import { createFileRoute } from "@tanstack/react-router";
import { isSameOriginRequest } from "@/lib/request-guard";

// Translates an existing analysis JSON to the target language.
// Preserves score, submetrics, issues[].word (native script), and structure —
// only the human-readable strings are translated. This keeps the score and
// counts stable when the user toggles the feedback language.

export const Route = createFileRoute("/api/translate-analysis")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          });
        }
        const { verifyRequestToken } = await import("@/lib/request-token.server");
        if (!verifyRequestToken(request.headers.get("x-request-token"))) {
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

        const body = (await request.json().catch(() => null)) as {
          analysis?: any;
          targetLang?: "en" | "bn";
        } | null;
        const targetLang = body?.targetLang === "bn" ? "bn" : "en";
        const analysis = body?.analysis;
        if (!analysis || typeof analysis !== "object") {
          return new Response(JSON.stringify({ error: "analysis required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const langName = targetLang === "bn" ? "Bengali (বাংলা script)" : "English";
        const systemPrompt = `You translate a pronunciation-coach analysis JSON into ${langName}. Rules:
- Preserve the JSON shape and every numeric value EXACTLY (score, any numbers).
- Preserve the array length and order of "issues" and "strengths".
- The "word" field inside each issue MUST stay verbatim in its original script — do NOT translate or transliterate it.
- Translate only "overall", "strengths[]", each issue's "problem" and "tip", and "practiceTip".
- Return ONLY JSON, no markdown.`;

        const userPrompt = `Translate the following analysis to ${langName}:\n${JSON.stringify(analysis)}`;

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
          console.error("translate-analysis upstream error:", res.status, t);
          const status = res.status === 429 ? 429 : res.status >= 500 ? 502 : 500;
          return new Response(
            JSON.stringify({
              error:
                res.status === 429
                  ? "Service busy, please try again."
                  : "Translation service unavailable.",
            }),
            { status, headers: { "content-type": "application/json" } },
          );
        }

        const data = (await res.json()) as any;
        const content = data?.choices?.[0]?.message?.content ?? "{}";
        let parsed: any;
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = analysis;
        }

        // Hard-preserve score + issues[].word from the original so the model
        // can never drift them.
        const merged = {
          ...analysis,
          ...parsed,
          score: analysis.score ?? parsed.score ?? null,
          issues: Array.isArray(parsed.issues)
            ? parsed.issues.map((it: any, i: number) => ({
                ...it,
                word: analysis.issues?.[i]?.word ?? it.word,
              }))
            : analysis.issues ?? [],
        };

        return new Response(JSON.stringify(merged), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
