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
              <div className="mx-auto max-w-3xl text-center mb-8">
                <motion.h1
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
                >
                  Practice <span className="text-gradient">Standard Bengali</span>
                </motion.h1>
                <motion.p
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mt-3 text-muted-foreground"
                >
                  Speak in your local dialect. Get instant AI coaching, word by word.
                </motion.p>
              </div>
              <VoiceInput />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
