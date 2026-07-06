import { motion } from "framer-motion";
import { Mic, ArrowRight } from "lucide-react";

export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="relative mb-10"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-40 blur-3xl animate-breathe" />
        <div className="relative grid h-36 w-36 place-items-center rounded-full bg-gradient-primary shadow-glow animate-breathe">
          <Mic className="h-16 w-16 text-primary-foreground" strokeWidth={2} />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="font-display text-4xl sm:text-6xl font-bold tracking-tight"
      >
        Welcome to <span className="text-gradient">Uccharon AI</span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground"
      >
        Master Standard Bengali Pronunciation Using Artificial Intelligence
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="mt-2 text-sm text-muted-foreground/80"
      >
        Practice. Improve. Speak Confidently.
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.6 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="group relative mt-10 inline-flex items-center gap-3 rounded-full bg-gradient-primary px-9 py-4 text-base sm:text-lg font-semibold text-primary-foreground shadow-glow animate-gradient"
      >
        <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
        <span className="relative">Start Learning</span>
        <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
}
