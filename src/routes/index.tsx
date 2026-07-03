import { createFileRoute } from "@tanstack/react-router";
import { VoiceInput } from "@/components/VoiceInput";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Uccharon AI — Pronunciation Coach" },
      {
        name: "description",
        content: "Uccharon AI records your voice, transcribes it, and gives instant AI-powered pronunciation feedback in many languages including Bangla.",
      },
      { property: "og:title", content: "Uccharon AI — Pronunciation Coach" },
      {
        property: "og:description",
        content: "Record, transcribe, and get AI pronunciation feedback in many languages including Bangla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Uccharon AI</h1>
        <p className="text-muted-foreground">
          Tap the mic, speak in any language, and get instant AI pronunciation feedback.
        </p>
      </div>
      <VoiceInput />
    </main>
  );
}
