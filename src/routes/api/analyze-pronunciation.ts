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

        const { transcript, language } = (await request.json()) as {
          transcript?: string;
          language?: string;
        };
        if (!transcript || !transcript.trim()) {
          return new Response(JSON.stringify({ error: "transcript required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const langLabel = language && language !== "auto" ? language : "the language the learner spoke (auto-detect)";


        const systemPrompt = `You are a friendly, expert pronunciation and speech coach. You will be given the TRANSCRIPT that an automatic speech-to-text system produced from a learner's spoken audio. There is NO target sentence — analyze what they actually said. Because the transcript comes from ASR, unusual spellings, dropped words, or garbled tokens usually reveal real pronunciation issues (unclear consonants, dropped endings, wrong vowel sounds, misplaced stress, mumbling, pacing).

Return a concise JSON object with this exact shape:
{
  "score": number (0-100, overall clarity & fluency),
  "overall": string (1-2 sentence summary),
  "strengths": string[] (0-3 short bullets),
  "issues": [
    { "word": string, "problem": string, "tip": string }
  ] (0-6 items; "word" MUST be a word that appears verbatim in the transcript so it can be highlighted; only include real, likely pronunciation issues),
  "practiceTip": string (one actionable next step)
}
Only return JSON. No markdown, no code fences.`;

        const userPrompt = `TRANSCRIPT: ${transcript}`;

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
