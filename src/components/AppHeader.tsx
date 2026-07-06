import { useEffect, useState } from "react";
import { Moon, Sun, Settings, HelpCircle, User, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("uchcharon-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Mic className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-base sm:text-lg font-bold leading-tight truncate">
                Uccharon <span className="text-gradient">AI</span>
              </div>
              <div className="hidden sm:block text-[11px] text-muted-foreground leading-tight">
                AI Bengali Pronunciation Coach
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hidden sm:inline-flex" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hidden sm:inline-flex" aria-label="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" aria-label="Profile">
              <User className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
