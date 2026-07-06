import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Loader2, Sparkles, Shuffle, BookOpen, RotateCcw, Share2, Download, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  SENTENCE_BANK,
  randomSentence,
  firstSentence,
  LANGUAGE_LABELS,
  LANGUAGE_ORDER,
  BN_DIALECT_LABELS,
  BN_DIALECT_ORDER,
  type Level,
  type LanguageCode,
  type BnDialect,
  type TargetSentence,
} from "@/lib/sentence-bank";
import { Globe } from "lucide-react";

type Status = "idle" | "recording" | "transcribing" | "error";

type Issue = { word: string; problem: string; tip: string };

type Analysis = {
  score?: number | null;
  overall?: string;
  strengths?: string[];
  issues?: Issue[];
  practiceTip?: string;
};

function normalizeWord(w: string) {
  return w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
}

function pickExt(mime: string) {
  const t = mime.split(";")[0];
  if (t.includes("mp4")) return "mp4";
  if (t.includes("mpeg")) return "mp3";
  if (t.includes("wav")) return "wav";
  return "webm";
}


const LEVEL_BADGE: Record<Level, string> = {
  beginner: "bg-success/15 text-success border-success/30",
  intermediate: "bg-warning/15 text-warning border-warning/30",
  advanced: "bg-destructive/15 text-destructive border-destructive/30",
  freestyle: "bg-primary/15 text-primary border-primary/30",
};

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display}</>;
}

function ScoreRing({ score }: { score: number }) {
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.6 0.22 285)" />
            <stop offset="100%" stopColor="oklch(0.72 0.2 320)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity={0.1} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${pct * c} ${c}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-numeric text-5xl font-bold text-gradient leading-none">
          <AnimatedCounter value={score} />
        </div>
        <div className="text-xs text-muted-foreground mt-1">/ 100</div>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-numeric font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/70 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-primary"
        />
      </div>
    </div>
  );
}

export function VoiceInput() {
  const [primaryLang, setPrimaryLang] = useState<LanguageCode>("bn");
  const [dialect, setDialect] = useState<BnDialect>("standard");
  const [level, setLevel] = useState<Level>("beginner");
  const [target, setTarget] = useState<TargetSentence>(() => firstSentence("bn", "beginner"));
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [outputLang, setOutputLang] = useState<"en" | "bn">("bn");

  // Compose the language code sent to the backend (e.g. "bn-sylheti" or "en").
  const language = useMemo(() => {
    if (primaryLang === "bn" && dialect !== "standard") return `bn-${dialect}`;
    return primaryLang;
  }, [primaryLang, dialect]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const altTranscriptRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTarget((cur) => randomSentence(primaryLang, level, cur.id));
    return () => stopEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When switching UI language, default the analysis-output language to match.
  useEffect(() => {
    setOutputLang(primaryLang === "bn" ? "bn" : "en");
  }, [primaryLang]);


  // Confetti when score > 90
  useEffect(() => {
    if (analysis?.score && analysis.score > 90) {
      const end = Date.now() + 800;
      const burst = () => {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ["#a855f7", "#ec4899", "#6366f1", "#f0abfc"] });
        if (Date.now() < end) setTimeout(burst, 250);
      };
      burst();
    }
  }, [analysis]);

  function stopEverything() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    rafRef.current = null;
    timerRef.current = null;
  }

  function drawWave() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const w = rect.width;
    const h = rect.height;

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, w, h);

      const bars = 56;
      const step = Math.floor(bufferLength / bars);
      const barW = w / bars;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "oklch(0.6 0.22 285)");
      grad.addColorStop(1, "oklch(0.72 0.2 320)");
      ctx.fillStyle = grad;
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          const v = (dataArray[i * step + j] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / step);
        const barH = Math.max(4, rms * h * 2.6);
        const y = (h - barH) / 2;
        const x = i * barW + barW * 0.2;
        const bw = barW * 0.6;
        const r = bw / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + bw, y, x + bw, y + barH, r);
        ctx.arcTo(x + bw, y + barH, x, y + barH, r);
        ctx.arcTo(x, y + barH, x, y, r);
        ctx.arcTo(x, y, x + bw, y, r);
        ctx.closePath();
        ctx.fill();
      }
    };
    render();
  }

  async function startRecording() {
    setError(null);
    setAnalysis(null);
    setTranscript("");
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => handleStop(recorder.mimeType || mime || "audio/webm");
      recorder.start();

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 100);

      setStatus("recording");
      requestAnimationFrame(drawWave);
    } catch (e) {
      setError("Microphone access denied or unavailable.");
      setStatus("error");
      stopEverything();
    }
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  async function handleStop(mime: string) {
    stopEverything();
    setStatus("transcribing");
    try {
      const blob = new Blob(chunksRef.current, { type: mime });
      if (blob.size < 1024) {
        throw new Error("Recording was too short. Please try again.");
      }
      const ext = pickExt(mime);
      setAudioUrl(URL.createObjectURL(blob));
      const form = new FormData();
      form.append("file", blob, `recording.${ext}`);
      form.append("language", language);

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Transcription failed (${res.status})`);
      }
      const data = await res.json();
      setTranscript((data.text ?? "").trim());
      altTranscriptRef.current = typeof data.alt === "string" ? data.alt : null;
      setStatus("idle");
    } catch (e: any) {
      setError(e.message ?? "Transcription failed");
      setStatus("error");
    }
  }

  async function analyzeWithAI(langOverride?: "en" | "bn") {
    const lang = langOverride ?? outputLang;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-pronunciation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript, altTranscript: altTranscriptRef.current ?? undefined, language, target: level === "freestyle" ? undefined : target.text, targetMeaning: level === "freestyle" ? undefined : target.meaning, outputLang: lang }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `AI analysis failed (${res.status})`);
      }
      const data = (await res.json()) as Analysis;
      setAnalysis(data);
    } catch (e: any) {
      setError(e.message ?? "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function resetPractice() {
    setTranscript("");
    altTranscriptRef.current = null;
    setAnalysis(null);
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }

  function nextSentence() {
    setTarget((cur) => randomSentence(primaryLang, level, cur.id));
    resetPractice();
  }


  const issueMap = useMemo(() => {
    const map = new Map<string, Issue>();
    analysis?.issues?.forEach((iss) => {
      const key = normalizeWord(iss.word);
      if (key) map.set(key, iss);
    });
    return map;
  }, [analysis]);

  const tokens = useMemo(() => {
    if (!transcript) return [] as { text: string; isWord: boolean }[];
    return transcript
      .split(/(\s+)/)
      .filter((p) => p.length > 0)
      .map((p) => ({ text: p, isWord: !/^\s+$/.test(p) }));
  }, [transcript]);

  const seconds = (elapsedMs / 1000).toFixed(1);
  const isRecording = status === "recording";
  const isBusy = status === "transcribing";
  const hasAnalysis = !!analysis;
  const score = analysis?.score ?? 0;

  // Derived sub-metrics (visual only, based on the single overall score)
  const submetrics = useMemo(() => {
    const base = score || 0;
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    return {
      Pronunciation: clamp(base),
      Accuracy: clamp(base - 3),
      Fluency: clamp(base + 2),
      Confidence: clamp(base - 5),
    };
  }, [score]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <motion.h1
          key={primaryLang}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
        >
          Practice <span className="text-gradient">Standard {LANGUAGE_LABELS[primaryLang]}</span>
        </motion.h1>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          {primaryLang === "bn"
            ? "Speak in your local dialect. Get instant AI coaching, word by word."
            : "Speak naturally. Get instant AI pronunciation coaching, word by word."}
        </p>
      </div>
      <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Language selector — two dropdowns in one box */}
        <div className="rounded-2xl border border-border/60 bg-background/40 backdrop-blur p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Detection language
          </div>
          <div
            className={cn(
              "grid gap-2",
              primaryLang === "bn" ? "sm:grid-cols-2" : "sm:grid-cols-1",
            )}
          >
            <Select
              value={primaryLang}
              onValueChange={(v) => {
                const lc = v as LanguageCode;
                setPrimaryLang(lc);
                if (lc !== "bn") setDialect("standard");
                setTarget(randomSentence(lc, level));
                resetPractice();
              }}
              disabled={isRecording || isBusy}
            >
              <SelectTrigger className="rounded-xl border-border/60 bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LANGUAGE_ORDER.map((code) => (
                  <SelectItem key={code} value={code}>
                    {LANGUAGE_LABELS[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {primaryLang === "bn" && (
              <Select
                value={dialect}
                onValueChange={(v) => setDialect(v as BnDialect)}
                disabled={isRecording || isBusy}
              >
                <SelectTrigger className="rounded-xl border-border/60 bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {BN_DIALECT_ORDER.map((code) => (
                    <SelectItem key={code} value={code}>
                      {BN_DIALECT_LABELS[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Target sentence card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-5">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-primary opacity-10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {LANGUAGE_LABELS[primaryLang]} · Practice
              <span className={cn("ml-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", LEVEL_BADGE[level])}>
                {level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={level}
                onValueChange={(v) => {
                  const lv = v as Level;
                  setLevel(lv);
                  setTarget(randomSentence(primaryLang, lv));
                  resetPractice();
                }}
                disabled={isRecording || isBusy}
              >
                <SelectTrigger className="w-36 h-8 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="freestyle">Freestyle</SelectItem>
                </SelectContent>
              </Select>
              {level !== "freestyle" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() => setTarget(randomSentence(primaryLang, level, target.id))}
                  disabled={isRecording || isBusy}
                  aria-label="Shuffle sentence"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {level === "freestyle" ? (
            <div className="relative mt-2 text-sm text-muted-foreground italic">
              No target sentence — just speak freely in {LANGUAGE_LABELS[primaryLang]} and get AI feedback.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="relative space-y-1 mt-3"
              >
                <div className="font-display text-2xl sm:text-3xl leading-relaxed font-semibold">
                  {target.text}
                </div>
                {target.translit && (
                  <div className="text-sm text-primary/90 italic">{target.translit}</div>
                )}
                <div className="text-xs text-muted-foreground">{target.meaning}</div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>


        {/* Mic */}
        <div className="flex flex-col items-center gap-5 py-2">
          <div className="relative">
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
                <span className="absolute -inset-3 rounded-full border border-destructive/40 animate-ping" style={{ animationDelay: "0.3s" }} />
                <span className="absolute -inset-6 rounded-full border border-destructive/20 animate-ping" style={{ animationDelay: "0.6s" }} />
              </>
            )}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isBusy}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className={cn(
                "relative grid h-32 w-32 place-items-center rounded-full text-primary-foreground transition-colors",
                isRecording ? "bg-destructive" : "bg-gradient-primary shadow-glow",
                !isRecording && !isBusy && "animate-breathe",
                isBusy && "opacity-60 cursor-not-allowed",
              )}
            >
              {isBusy ? (
                <Loader2 className="h-11 w-11 animate-spin" />
              ) : isRecording ? (
                <Square className="h-10 w-10 fill-current" />
              ) : (
                <Mic className="h-12 w-12" strokeWidth={2} />
              )}
            </motion.button>
          </div>

          <div className="h-20 w-full rounded-2xl bg-muted/40 border border-border/60 overflow-hidden backdrop-blur">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>

          <div className="flex items-center gap-3">
            {isRecording && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />}
            <div className="font-numeric text-lg tabular-nums">
              {isRecording ? `Listening · ${seconds}s` : isBusy ? "Transcribing…" : `${seconds}s`}
            </div>
          </div>
        </div>

        {/* Transcription */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">Your transcription</label>
            {(analysis?.issues?.length ?? 0) > 0 && (
              <span className="text-xs text-muted-foreground">
                Hover the <span className="text-destructive font-medium">red</span> words for tips
              </span>
            )}
          </div>

          {(analysis?.issues?.length ?? 0) > 0 ? (
            <TooltipProvider delayDuration={100}>
              <div className="min-h-[96px] w-full rounded-2xl border border-border/60 bg-background/40 backdrop-blur px-4 py-3 text-base leading-relaxed">
                {tokens.map((tok, i) => {
                  if (!tok.isWord) return <span key={i}>{tok.text}</span>;
                  const key = normalizeWord(tok.text);
                  const iss = issueMap.get(key);
                  if (!iss)
                    return (
                      <span key={i} className="text-success/90">
                        {tok.text}
                      </span>
                    );
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <span className="text-destructive font-semibold underline decoration-wavy decoration-destructive/70 underline-offset-4 cursor-help">
                          {tok.text}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs space-y-1">
                        <div className="font-semibold">{iss.word}</div>
                        <div>{iss.problem}</div>
                        <div className="italic opacity-80">💡 {iss.tip}</div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          ) : (
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your transcribed speech will appear here…"
              rows={4}
              className="rounded-2xl bg-background/40 backdrop-blur border-border/60 text-base"
            />
          )}
        </div>

        {audioUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Playback</label>
            <audio src={audioUrl} controls className="w-full rounded-xl bg-muted/40 border border-border/60" />
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: transcript.trim() && !analyzing ? 1.01 : 1 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => analyzeWithAI()}
          disabled={!transcript.trim() || analyzing}
          className={cn(
            "relative flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow overflow-hidden",
            "bg-gradient-primary animate-gradient",
            (!transcript.trim() || analyzing) && "opacity-60 cursor-not-allowed",
          )}
        >
          {analyzing && (
            <span
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s linear infinite",
              }}
            />
          )}
          <span className="relative flex items-center gap-2">
            {analyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {analyzing ? "Analyzing your pronunciation…" : "Analyze My Pronunciation"}
          </span>
        </motion.button>
      </div>

      {/* Analysis dashboard */}
      <AnimatePresence>
        {hasAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-6 sm:p-8 space-y-6"
          >
            <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] items-center">
              <div className="justify-self-center">
                <ScoreRing score={score} />
              </div>
              <div className="space-y-3">
                <MetricBar label="Pronunciation" value={submetrics.Pronunciation} />
                <MetricBar label="Accuracy" value={submetrics.Accuracy} />
                <MetricBar label="Fluency" value={submetrics.Fluency} />
                <MetricBar label="Confidence" value={submetrics.Confidence} />
              </div>
            </div>

            {analysis?.overall && (
              <div className="rounded-2xl border border-border/60 bg-background/40 backdrop-blur p-4 text-sm leading-relaxed">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">AI Coach</div>
                {analysis.overall}
              </div>
            )}

            {analysis?.strengths && analysis.strengths.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-success">Strengths</div>
                <ul className="space-y-1.5">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis?.issues && analysis.issues.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-destructive">Areas to improve</div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {analysis.issues.map((iss, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-border/60 bg-background/40 backdrop-blur p-4 text-sm space-y-1"
                    >
                      <div className="font-display font-semibold text-destructive">{iss.word}</div>
                      <div>{iss.problem}</div>
                      <div className="text-muted-foreground italic">💡 {iss.tip}</div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {analysis?.practiceTip && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
                <span className="font-semibold text-primary">Practice tip: </span>
                {analysis.practiceTip}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={resetPractice}>
                <RotateCcw className="h-4 w-4" /> Practice Again
              </Button>
              <Button className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow" onClick={nextSentence}>
                <ArrowRight className="h-4 w-4" /> Next Sentence
              </Button>
              <Button variant="outline" className="rounded-xl" disabled>
                <Share2 className="h-4 w-4" /> Share Score
              </Button>
              <Button variant="outline" className="rounded-xl" disabled>
                <Download className="h-4 w-4" /> Report
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
