import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_LANG_BASES = new Set([
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ur",
]);
const ALLOWED_BN_DIALECTS = new Set([
  "sylheti", "chattogramia", "noakhailla", "rangpuri", "barishailla",
]);

function validLanguage(lang: string): boolean {
  if (typeof lang !== "string" || lang.length > 32) return false;
  const [base, variant] = lang.split("-");
  if (!ALLOWED_LANG_BASES.has(base)) return false;
  if (!variant) return true;
  if (base === "bn") return ALLOWED_BN_DIALECTS.has(variant);
  return /^[a-zA-Z]{2,8}$/.test(variant);
}

function validDialect(d: unknown): d is string | null | undefined {
  if (d == null) return true;
  if (typeof d !== "string") return false;
  if (d.length > 32) return false;
  return ALLOWED_BN_DIALECTS.has(d);
}

export const Route = createFileRoute("/api/public/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          language?: unknown;
          dialect?: unknown;
          issue_pattern?: unknown;
          count?: unknown;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const language = typeof body.language === "string" ? body.language : "";
        const issuePattern = typeof body.issue_pattern === "string" ? body.issue_pattern.replace(/[\r\n\t]/g, " ").trim() : "";

        if (!language || !issuePattern) {
          return Response.json({ error: "language and issue_pattern required" }, { status: 400 });
        }
        if (!validLanguage(language)) {
          return Response.json({ error: "Invalid language" }, { status: 400 });
        }
        if (issuePattern.length > 200) {
          return Response.json({ error: "issue_pattern too long" }, { status: 400 });
        }
        if (!validDialect(body.dialect)) {
          return Response.json({ error: "Invalid dialect" }, { status: 400 });
        }
        const rawCount = Number(body.count);
        const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.min(Math.floor(rawCount), 1000) : 1;

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          }
        );

        const { error } = await supabase.from("pronunciation_sessions").insert({
          language,
          dialect: (body.dialect as string | undefined) ?? null,
          transcript: "",
          score: null,
          issues: [{ word: issuePattern, problem: "aggregated", tip: "", count }],
          strengths: [],
          practice_tip: "",
          guest_id: "analytics",
        });

        if (error) {
          console.error("Analytics insert error:", error);
          return Response.json({ error: "Analytics service unavailable" }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
