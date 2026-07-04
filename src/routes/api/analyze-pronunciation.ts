import { createFileRoute } from "@tanstack/react-router";

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

        const { transcript, language, target, targetMeaning } = (await request.json()) as {
          transcript?: string;
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
        const langLabel = language && language !== "auto" ? language : "the language/dialect the learner spoke (auto-detect between English, Standard Bangla, or a regional Bangla dialect like Sylheti, Chattogramia, Noakhailla, Rangpuri, or Barishailla)";


        const systemPrompt = `You are Uchcharon AI, a friendly expert coach that helps speakers of REGIONAL BANGLA DIALECTS (Sylheti, Chattogramia, Noakhailla, Rangpuri, Barishailla, etc.) learn STANDARD BANGLA (প্রমিত বাংলা) pronunciation. You also support English learners. You do NOT coach any other language — if the transcript is clearly in another language (Spanish, French, Hindi, Urdu, etc.), politely say in the "overall" field that Uchcharon AI only supports English and Bangla (including regional dialects), set score to null, and return empty arrays.

You will be given a TARGET SENTENCE (what the learner was asked to say in Standard Bangla) and the TRANSCRIPT that an ASR produced from the learner's audio. Compare the transcript to the target:
- Which words match, which are missing, mispronounced, or replaced with dialect equivalents.
- Because ASR is imperfect, unusual spellings or dropped endings usually reveal real pronunciation issues (unclear consonants, wrong vowels, misplaced stress, dialect substitutions).
- Focus feedback on shifting the learner toward STANDARD BANGLA pronunciation.

Return a concise JSON object with this exact shape:
{
  "score": number|null (0-100, how closely the transcript matches the target in Standard Bangla),
  "overall": string (1-2 sentence summary of accuracy vs. the target),
  "strengths": string[] (0-3 short bullets),
  "issues": [
    { "word": string, "problem": string, "tip": string }
  ] (0-6 items; "word" MUST appear verbatim in the TRANSCRIPT so it can be highlighted),
  "practiceTip": string (one actionable next step)
}
Only return JSON. No markdown, no code fences.`;

        const targetBlock = target
          ? `TARGET SENTENCE (Standard Bangla): ${target}${targetMeaning ? `\nMEANING: ${targetMeaning}` : ""}\n\n`
          : "";
        const userPrompt = `LANGUAGE/DIALECT: ${langLabel}\nRespond in the SAME language as the transcript (Bangla for Bangla/dialect input, English for English input) for "overall", "strengths", "problem", "tip", and "practiceTip". Keep the JSON keys in English.\n\n${targetBlock}TRANSCRIPT: ${transcript}`;

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
