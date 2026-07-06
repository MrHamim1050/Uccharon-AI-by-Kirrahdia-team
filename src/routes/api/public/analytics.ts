import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          language?: string;
          dialect?: string;
          issue_pattern?: string;
          count?: number;
        };

        if (!body.language || !body.issue_pattern) {
          return Response.json({ error: "language and issue_pattern required" }, { status: 400 });
        }

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          }
        );

        const { error } = await supabase.from("pronunciation_sessions").insert({
          language: body.language,
          dialect: body.dialect ?? null,
          transcript: "",
          score: null,
          issues: [{ word: body.issue_pattern, problem: "aggregated", tip: "" }],
          strengths: [],
          practice_tip: "",
          guest_id: "analytics",
        });

        if (error) {
          console.error("Analytics insert error:", error);
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
