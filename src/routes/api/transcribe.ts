import { createFileRoute } from "@tanstack/react-router";
import { isSameOriginRequest } from "@/lib/request-guard";

const SUPPORTED_BASE = new Set([
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ur",
]);

const LANG_NAMES: Record<string, string> = {
  en: "English",
  zh: "Mandarin Chinese",
  hi: "Hindi",
  es: "Spanish",
  ar: "Modern Standard Arabic",
  fr: "French",
  bn: "Bengali",
  pt: "Portuguese",
  ru: "Russian",
  ur: "Urdu",
};

const LANG_SCRIPTS: Record<string, string> = {
  en: "Latin",
  zh: "Simplified Chinese characters",
  hi: "Devanagari",
  es: "Latin",
  ar: "Arabic",
  fr: "Latin",
  bn: "Bengali (Bangla) script",
  pt: "Latin",
  ru: "Cyrillic",
  ur: "Urdu Nastaliq (Perso-Arabic)",
};

const BN_DIALECT_LABEL: Record<string, string> = {
  sylheti: "Sylheti",
  chattogramia: "Chattogramia",
  noakhailla: "Noakhailla",
  rangpuri: "Rangpuri",
  barishailla: "Barishailla",
};

function buildPrompt(language?: string) {
  if (!language || language === "auto") {
    return "Transcribe faithfully in the native script of the spoken language.";
  }
  const [base, variant] = language.split("-");
  const name = LANG_NAMES[base] ?? base;
  const script = LANG_SCRIPTS[base] ?? "the native script";
  if (base === "bn" && variant && BN_DIALECT_LABEL[variant]) {
    return `The audio is a learner speaking ${BN_DIALECT_LABEL[variant]}, a regional Bangla dialect. Transcribe exactly what they said in Bengali script (Bangla). Do not translate to Standard Bangla; preserve the dialect words.`;
  }
  return `The audio is in ${name}. Transcribe faithfully in ${script}. Preserve the speaker's actual words even if pronunciation is imperfect.`;
}

async function transcribeWithOpenAI(
  apiKey: string,
  file: File,
  language: string | undefined,
): Promise<{ ok: boolean; status: number; text: string }> {
  const upstream = new FormData();
  upstream.append("file", file, file.name || "recording.webm");
  upstream.append("model", "openai/gpt-4o-transcribe");
  upstream.append("prompt", buildPrompt(language));
  if (language && language !== "auto") {
    const base = language.split("-")[0];
    if (SUPPORTED_BASE.has(base)) upstream.append("language", base);
  }
  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
  });
  const bodyText = await res.text();
  if (!res.ok) return { ok: false, status: res.status, text: bodyText };
  try {
    const json = JSON.parse(bodyText);
    return { ok: true, status: 200, text: String(json.text ?? "") };
  } catch {
    return { ok: false, status: 500, text: bodyText };
  }
}

async function transcribeWithGemini(
  apiKey: string,
  file: File,
  language: string | undefined,
): Promise<string | null> {
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    // Base64 encode
    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    const b64 = btoa(binary);
    const mime = file.type || "audio/webm";

    const [base, variant] = (language ?? "").split("-");
    const langLabel = LANG_NAMES[base] ?? "the spoken language";
    const script = LANG_SCRIPTS[base] ?? "the native script";
    const dialectHint =
      base === "bn" && variant && BN_DIALECT_LABEL[variant]
        ? ` The speaker uses ${BN_DIALECT_LABEL[variant]}, a regional Bangla dialect — transcribe their actual words in Bangla script, do not normalize to Standard Bangla.`
        : "";

    const prompt = `Transcribe the attached audio in ${langLabel} using ${script}.${dialectHint} Return ONLY the transcript text, no quotes, no commentary, no translation.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "input_audio", input_audio: { data: b64, format: mime.includes("mp4") ? "mp4" : mime.includes("wav") ? "wav" : mime.includes("mp3") ? "mp3" : "webm" } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text === "string" && text.trim()) return text.trim();
    return null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          });
        }
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Service unavailable" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) {
          return new Response(JSON.stringify({ error: "No audio provided" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const languageRaw = form.get("language");
        const language = typeof languageRaw === "string" ? languageRaw : undefined;

        // Primary transcription (higher-accuracy OpenAI model)
        const primary = await transcribeWithOpenAI(apiKey, file, language);
        if (!primary.ok) {
          console.error("transcribe upstream error:", primary.status, primary.text);
          const status = primary.status === 429 ? 429 : primary.status >= 500 ? 502 : 500;
          const message = primary.status === 429 ? "Service busy, please try again." : "Transcription service unavailable.";
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "content-type": "application/json" },
          });
        }

        // Hybrid verification pass for Bengali dialects (best accuracy path)
        const isBnDialect = !!language && language.startsWith("bn-") && language !== "bn";
        let alt: string | null = null;
        if (isBnDialect) {
          alt = await transcribeWithGemini(apiKey, file, language);
        }

        return new Response(
          JSON.stringify({ text: primary.text, alt: alt ?? undefined }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
