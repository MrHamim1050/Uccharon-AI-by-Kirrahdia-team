import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
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

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) {
          return new Response(JSON.stringify({ error: "No audio provided" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const language = form.get("language");
        const upstream = new FormData();
        upstream.append("file", file, file.name || "recording.webm");
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        if (typeof language === "string" && language && language !== "auto") {
          // Map dialect codes (e.g. bn-sylheti) to base ISO-639-1 for the ASR
          const base = language.split("-")[0];
          if (base === "bn" || base === "en") upstream.append("language", base);
        }


        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: upstream,
        });

        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
        });
      },
    },
  },
});
