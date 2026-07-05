export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/40" />
      <div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.22 285 / 0.6), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.2 320 / 0.6), transparent 70%)", animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-[450px] w-[450px] rounded-full opacity-25 blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.18 220 / 0.6), transparent 70%)", animationDelay: "-12s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
