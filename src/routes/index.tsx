import { createFileRoute } from "@tanstack/react-router";
import { VoiceInput } from "@/components/VoiceInput";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Uchcharon AI — Learn Standard Bangla" },
      {
        name: "description",
        content: "Uchcharon AI helps speakers of local Bangla dialects (Sylheti, Chattogramia, and more) master Standard Bengali pronunciation with instant AI feedback.",
      },
      { property: "og:title", content: "Uchcharon AI — Learn Standard Bangla" },
      {
        property: "og:description",
        content: "Speak in your local dialect and get AI coaching to learn Standard Bengali pronunciation.",
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
        <h1 className="text-3xl font-bold tracking-tight">Uchcharon AI</h1>
        <p className="text-muted-foreground">
          Speak in your local Bangla dialect and learn Standard Bengali pronunciation with instant AI feedback.
        </p>
      </div>
      <VoiceInput />
    </main>
  );
}
