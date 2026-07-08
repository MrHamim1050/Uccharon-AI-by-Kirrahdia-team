import { createFileRoute } from "@tanstack/react-router";
import { isSameOriginRequest } from "@/lib/request-guard";

export const Route = createFileRoute("/api/request-token")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          });
        }
        const { mintRequestToken } = await import("@/lib/request-token.server");
        return new Response(
          JSON.stringify({ token: mintRequestToken() }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
