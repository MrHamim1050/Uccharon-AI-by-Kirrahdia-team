import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VoiceInput } from "@/components/VoiceInput";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Splash } from "@/components/Splash";
import { Welcome } from "@/components/Welcome";
import { AppHeader } from "@/components/AppHeader";

type Stage = "splash" | "welcome" | "app";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Uccharon AI — AI Bengali Pronunciation Coach" },
      {
        name: "description",
        content:
          "Uccharon AI helps speakers of local Bangla dialects (Sylheti, Chattogramia, and more) master Standard Bengali pronunciation with instant AI feedback.",
      },
      { property: "og:title", content: "Uccharon AI — AI Bengali Pronunciation Coach" },
      {
        property: "og:description",
        content: "Speak Naturally. Learn Perfect Bengali. Powered by AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const [stage, setStage] = useState<Stage>("splash");

  useEffect(() => {
    const t = setTimeout(() => setStage("welcome"), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatedBackground />
      <AnimatePresence mode="wait">
        {stage === "splash" && <Splash key="splash" />}
        {stage === "welcome" && <Welcome key="welcome" onStart={() => setStage("app")} />}
        {stage === "app" && (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-h-screen"
          >
            <AppHeader />
            <main className="px-4 pb-16 pt-8 sm:pt-12">
              <VoiceInput />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
