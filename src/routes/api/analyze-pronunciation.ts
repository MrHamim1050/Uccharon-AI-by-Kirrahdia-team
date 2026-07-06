import { createFileRoute } from "@tanstack/react-router";

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
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        const { transcript, altTranscript, language, target, targetMeaning } = (await request.json()) as {
          transcript?: string;
          altTranscript?: string;
          language?: string;
          target?: string;
          targetMeaning?: string;
        };
        if (!transcript || !transcript.trim()) {
          return new Response(JSON.stringify({ error: "transcript required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

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
        const userPrompt = `LEARNER LANGUAGE: ${langLabel}\nRespond in the SAME language as the transcript for "overall", "strengths", "problem", "tip", and "practiceTip". Keep the JSON keys in English.\n\n${targetBlock}${transcriptBlock}`;

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
          return new Response(JSON.stringify({ error: t || "AI analysis failed" }), {
            status: res.status,
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
