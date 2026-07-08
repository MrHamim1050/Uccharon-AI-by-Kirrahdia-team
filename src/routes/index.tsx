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
      { property: "og:url", content: "https://ucchararon-ai-by-kirrahdia.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://ucchararon-ai-by-kirrahdia.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Uccharon AI",
          operatingSystem: "All",
          applicationCategory: "EducationalApplication",
          description:
            "AI-powered Bengali pronunciation coach for speakers of local dialects mastering Standard Bengali.",
          url: "https://ucchararon-ai-by-kirrahdia.lovable.app/",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Uccharon AI",
          url: "https://ucchararon-ai-by-kirrahdia.lovable.app/",
        }),
      },
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
