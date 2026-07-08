import { createFileRoute } from "@tanstack/react-router";
import { isSameOriginRequest } from "@/lib/request-guard";

// Strip control chars, collapse whitespace, cap length. Applied to any free-text
// field embedded into the AI prompt so a crafted transcript/target can't inject
// new instructions or exfiltrate the system prompt.
function sanitizePromptText(raw: unknown, maxLen: number): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function sanitizeHistory(
  raw: unknown,
): { pattern: string; count: number; lastTip: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 5)
    .map((h) => {
      if (!h || typeof h !== "object") return null;
      const pattern = sanitizePromptText((h as any).pattern, 80);
      const lastTip = sanitizePromptText((h as any).lastTip, 160);
      const rawCount = Number((h as any).count);
      const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.min(Math.floor(rawCount), 9999) : 0;
      if (!pattern) return null;
      return { pattern, count, lastTip };
    })
    .filter((x): x is { pattern: string; count: number; lastTip: string } => x !== null);
}


const LANG_NAMES: Record<string, string> = {
  en: "English",
  zh: "Mandarin Chinese",
  hi: "Hindi",
  es: "Spanish",
  ar: "Modern Standard Arabic",
  fr: "French",
  bn: "Standard Bangla",
  pt: "Portuguese",
  ru: "Russian",
  ur: "Urdu",
};

const BN_DIALECT_NAMES: Record<string, string> = {
  sylheti: "Sylheti",
  chattogramia: "Chattogramia",
  noakhailla: "Noakhailla",
  rangpuri: "Rangpuri",
  barishailla: "Barishailla",
};

function describeLanguage(code?: string) {
  if (!code || code === "auto") return "the language the learner spoke";
  const [base, variant] = code.split("-");
  if (base === "bn" && variant && BN_DIALECT_NAMES[variant]) {
    return `${BN_DIALECT_NAMES[variant]} (a regional Bangla dialect); the learning target is Standard Bangla (প্রমিত বাংলা)`;
  }
  return LANG_NAMES[base] ?? code;
}

export const Route = createFileRoute("/api/analyze-pronunciation")({
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

        const { transcript, altTranscript, language, target, targetMeaning, outputLang, history } = (await request.json()) as {
          transcript?: string;
          altTranscript?: string;
          language?: string;
          target?: string;
          targetMeaning?: string;
          outputLang?: "en" | "bn";
          history?: unknown;
        };
        if (!transcript || !transcript.trim()) {
          return new Response(JSON.stringify({ error: "transcript required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const safeHistory = sanitizeHistory(history);

        const langLabel = describeLanguage(language);
        const isBnDialect = !!language && language.startsWith("bn-") && language !== "bn";
        const hasAlt = !!altTranscript && altTranscript.trim() && altTranscript.trim() !== transcript.trim();

        const systemPrompt = `You are Uccharon AI, a friendly expert pronunciation coach. You support these languages: English, Mandarin Chinese, Hindi, Spanish, Modern Standard Arabic, French, Bengali (Standard Bangla and regional dialects: Sylheti, Chattogramia, Noakhailla, Rangpuri, Barishailla), Portuguese, Russian, and Urdu.

You will be given the LEARNER LANGUAGE they selected, a TARGET SENTENCE (what they were asked to say), and one or two TRANSCRIPT candidates that different ASR systems produced from their audio.${hasAlt ? " When two candidates are provided, silently reconcile them: prefer the reading that best matches the target sentence and the language's phonology; if they disagree on a word, pick the more plausible one and treat that as the effective transcript." : ""} Compare the effective transcript to the target: which words match, which are missing, mispronounced, or replaced. Because ASR is imperfect, unusual spellings or dropped endings usually reveal real pronunciation issues (unclear consonants, wrong vowels, misplaced stress).

${isBnDialect ? "The learner speaks a regional Bangla dialect. Coach them toward STANDARD BANGLA (প্রমিত বাংলা) pronunciation.\n\n" : ""}If the transcript is clearly in a language outside the supported list, politely say so in the "overall" field, set score to null, and return empty arrays.

Return a concise JSON object with this exact shape:
{
  "score": number|null (0-100, how closely the transcript matches the target),
  "overall": string (1-2 sentence summary of accuracy vs. the target),
  "strengths": string[] (0-3 short bullets),
  "issues": [
    { "word": string, "problem": string, "tip": string }
  ] (0-6 items; "word" MUST appear verbatim in one of the TRANSCRIPT candidates so it can be highlighted),
  "practiceTip": string (one actionable next step)
}
Only return JSON. No markdown, no code fences.`;

        const targetBlock = target
          ? `TARGET SENTENCE: ${target}${targetMeaning ? `\nMEANING (English): ${targetMeaning}` : ""}\n\n`
          : "";
        const transcriptBlock = hasAlt
          ? `TRANSCRIPT (candidate A): ${transcript}\nTRANSCRIPT (candidate B): ${altTranscript}`
          : `TRANSCRIPT: ${transcript}`;
        const historyBlock =
          safeHistory.length > 0
            ? `\n\nLEARNER HISTORY (recurring issues from recent sessions):\n${safeHistory.map((h) => `- ${h.pattern} (seen ${h.count} times). Last tip: ${h.lastTip}`).join("\n")}\n\nUse this history to tailor your feedback. If the same issue appears again, acknowledge the pattern gently and give a more targeted exercise.`
            : "";

        const responseLangInstruction =
          outputLang === "en"
            ? `Write "overall", "strengths", "problem", "tip", and "practiceTip" in ENGLISH. However, the "word" field MUST stay in the original script of the transcript (do NOT translate or transliterate it). Keep the JSON keys in English.`
            : outputLang === "bn"
              ? `Write "overall", "strengths", "problem", "tip", and "practiceTip" in BENGALI (বাংলা script). Keep the "word" field verbatim from the transcript. Keep the JSON keys in English.`
              : `Respond in the SAME language as the transcript for "overall", "strengths", "problem", "tip", and "practiceTip". Keep the "word" field verbatim from the transcript. Keep the JSON keys in English.`;
        const userPrompt = `LEARNER LANGUAGE: ${langLabel}\n${responseLangInstruction}\n\n${targetBlock}${transcriptBlock}${historyBlock}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const t = await res.text();
          console.error("analyze-pronunciation upstream error:", res.status, t);
          const status = res.status === 429 ? 429 : res.status >= 500 ? 502 : 500;
          const message = res.status === 429 ? "Service busy, please try again." : "Analysis service unavailable.";
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "content-type": "application/json" },
          });
        }

        const data = (await res.json()) as any;
        const content = data?.choices?.[0]?.message?.content ?? "{}";
        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = { overall: content, score: null, strengths: [], issues: [], practiceTip: "" };
        }

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
