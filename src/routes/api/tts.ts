import { createFileRoute } from "@tanstack/react-router";
import { isSameOriginRequest } from "@/lib/request-guard";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return new Response("Forbidden", { status: 403 });
        }
        const { verifyRequestToken } = await import("@/lib/request-token.server");
        if (!verifyRequestToken(request.headers.get("x-request-token"))) {
          return new Response("Forbidden", { status: 403 });
        }


        let body: { text?: string; voice?: string } = {};
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const text = (body.text ?? "").toString().trim();
        if (!text) return new Response("Missing text", { status: 400 });
        // Guard against abuse — cap request size.
        const capped = text.slice(0, 600);

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("TTS not configured", { status: 500 });

        const voice = typeof body.voice === "string" && body.voice ? body.voice : "alloy";

        try {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts",
              input: capped,
              voice,
              response_format: "mp3",
            }),
          });

          if (!upstream.ok) {
            if (upstream.status === 429) return new Response("Rate limited", { status: 502 });
            if (upstream.status === 402) return new Response("Out of credits", { status: 502 });
            return new Response("TTS failed", { status: 502 });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "no-store",
            },
          });
        } catch {
          return new Response("TTS failed", { status: 502 });
        }
      },
    },
  },
});
