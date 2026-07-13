import { motion } from "framer-motion";
import logoIcon from "@/assets/logo-icon.png";

export function Splash() {
  const title = "Uccharon AI";
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, oklch(0.18 0.05 275) 0%, oklch(0.08 0.02 265) 70%)" }}
    >
      {/* Converging particles */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r = 260;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return (
          <motion.span
            key={i}
            initial={{ x, y, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 1 }}
            transition={{ duration: 1.4, delay: 0.2 + (i % 6) * 0.05, ease: "easeIn" }}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: "oklch(0.75 0.2 300 / 0.9)", boxShadow: "0 0 12px oklch(0.75 0.2 300 / 0.9)" }}
          />
        );
      })}

      <div className="relative flex flex-col items-center gap-6 text-center">
        {/* Expanding rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.6, 1], opacity: [0, 0.6, 0.15] }}
          transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
          className="absolute h-40 w-40 rounded-full border border-primary/60"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2.2, 1.4], opacity: [0, 0.4, 0] }}
          transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
          className="absolute h-40 w-40 rounded-full border border-accent/60"
        />

        {/* Mic forms */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "backOut" }}
          className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-primary shadow-glow"
        >
          <Mic className="h-11 w-11 text-primary-foreground" strokeWidth={2.2} />
        </motion.div>

        {/* Title letter by letter */}
        <div className="flex overflow-hidden">
          {title.split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.5 + i * 0.06 }}
              className="font-display text-4xl sm:text-5xl font-bold text-gradient"
              style={{ textShadow: "0 0 30px oklch(0.7 0.2 300 / 0.4)" }}
            >
              {c === " " ? "\u00A0" : c}
            </motion.span>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4 }}
          className="max-w-sm text-sm sm:text-base text-white/70"
        >
          AI Language Pronunciation Coach
        </motion.p>
      </div>
    </motion.div>
  );
}
