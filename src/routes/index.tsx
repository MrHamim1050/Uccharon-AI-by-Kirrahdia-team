import { createFileRoute } from "@tanstack/react-router";
import { VoiceInput } from "@/components/VoiceInput";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pronunciation Practice — Voice Input" },
      {
        name: "description",
        content: "Record your voice, transcribe it with AI, and check your pronunciation against a target sentence.",
      },
      { property: "og:title", content: "Pronunciation Practice — Voice Input" },
      {
        property: "og:description",
        content: "Record your voice, transcribe it with AI, and check your pronunciation against a target sentence.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pronunciation Practice</h1>
        <p className="text-muted-foreground">
          Tap the mic, read the sentence aloud, and see which words matched.
        </p>
      </div>
      <VoiceInput />
    </main>
  );
}
