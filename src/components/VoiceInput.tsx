import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Mic, Square, Loader2, Sparkles, Shuffle, BookOpen, RotateCcw, Share2, Download, ArrowRight, Volume2 } from "lucide-react";
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
import { authedFetch } from "@/lib/authed-fetch";
import {
  SENTENCE_BANK,
  randomSentence,
  firstSentence,
  LANGUAGE_LABELS,
  LANGUAGE_ORDER,
  LANGUAGE_TTS_LOCALE,
  type Level,
  type LanguageCode,
  type TargetSentence,
} from "@/lib/sentence-bank";
import ttsCache from "@/lib/tts-cache.json";

import { Globe } from "lucide-react";
import type { EnhancedAudio } from "@/lib/audio-enhance";
import {
  saveSession,
  getRecurringIssues,
} from "@/lib/session-history";
import { AlertCircle } from "lucide-react";

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
  const [directMode, setDirectMode] = useState<boolean>(true);
  const [recurringIssues, setRecurringIssues] = useState<{ pattern: string; count: number; lastTip: string }[]>([]);
  

  // Language code sent to the backend (dialects removed — always base language).
  const language = primaryLang;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const enhancedRef = useRef<EnhancedAudio | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const altTranscriptRef = useRef<string | null>(null);
  const audioBlobRef = useRef<{ blob: Blob; mime: string } | null>(null);
  const analysisCacheRef = useRef<Partial<Record<"en" | "bn", Analysis>>>({});
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingActiveRef = useRef<boolean>(false);

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
    const enh = enhancedRef.current;
    if (enh) {
      enh.dispose().catch(() => {});
    }
    enhancedRef.current = null;
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
      const { startEnhancedCapture } = await import("@/lib/audio-enhance");
      const { loadAudioSettings } = await import("@/lib/audio-settings");
      const s = loadAudioSettings();
      const enhanced = await startEnhancedCapture({
        gain: s.gain,
        noiseSuppression: s.noiseSuppression,
        softLimiter: s.softLimiter,
      });
      enhancedRef.current = enhanced;

      
      analyserRef.current = enhanced.analyser;

      const recorderStream = enhanced.recorderStream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
      const recorder = mime
        ? new MediaRecorder(recorderStream, { mimeType: mime })
        : new MediaRecorder(recorderStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => handleStop(recorder.mimeType || mime || "audio/webm");
      recorder.start();

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      recordingActiveRef.current = true;
      timerRef.current = setInterval(() => {
        if (!recordingActiveRef.current) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
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
    // Freeze timer & waveform immediately so the UI reflects the click,
    // even if MediaRecorder.onstop fires a moment later.
    recordingActiveRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (startedAtRef.current) {
      setElapsedMs(Date.now() - startedAtRef.current);
    }
    setStatus("transcribing");
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
      audioBlobRef.current = { blob, mime };
      const form = new FormData();
      form.append("file", blob, `recording.${ext}`);
      form.append("language", language);

      const res = await authedFetch("/api/transcribe", { method: "POST", body: form });
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
    const isTranslateOnly = langOverride !== undefined;

    // If we already have a cached analysis for this language, reuse it —
    // no extra AI round-trip, no score drift.
    const cached = analysisCacheRef.current[lang];
    if (isTranslateOnly && cached) {
      setAnalysis(cached);
      return;
    }

    // Translate-only path: use the dedicated translation endpoint so the
    // score, metrics, issue count, and native-script words never change.
    if (isTranslateOnly) {
      const source =
        analysisCacheRef.current.bn ?? analysisCacheRef.current.en ?? analysis;
      if (source) {
        setAnalyzing(true);
        setError(null);
        try {
          const res = await authedFetch("/api/translate-analysis", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ analysis: source, targetLang: lang }),
          });
          if (!res.ok) throw new Error(`Translate failed (${res.status})`);
          const translated = (await res.json()) as Analysis;
          // Hard-preserve score from the source so it can never drift.
          const merged: Analysis = { ...translated, score: source.score ?? translated.score };
          analysisCacheRef.current[lang] = merged;
          setAnalysis(merged);
        } catch (e: any) {
          setError(e.message ?? "Translation failed");
        } finally {
          setAnalyzing(false);
        }
        return;
      }
    }

    setAnalyzing(true);
    setError(null);
    try {
      const history = getRecurringIssues(language, 2);
      setRecurringIssues(history);

      let res: Response;
      if (directMode && audioBlobRef.current) {
        const { blob, mime } = audioBlobRef.current;
        const ext = pickExt(mime);
        const form = new FormData();
        form.append("file", blob, `recording.${ext}`);
        form.append("language", language);
        form.append("outputLang", lang);
        if (level !== "freestyle") {
          form.append("target", target.text);
          if (target.meaning) form.append("targetMeaning", target.meaning);
        }
        if (history.length > 0) form.append("history", JSON.stringify(history));
        res = await authedFetch("/api/analyze-audio", { method: "POST", body: form });
      } else {
        res = await authedFetch("/api/analyze-pronunciation", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            transcript,
            altTranscript: altTranscriptRef.current ?? undefined,
            language,
            target: level === "freestyle" ? undefined : target.text,
            targetMeaning: level === "freestyle" ? undefined : target.meaning,
            outputLang: lang,
            history: history.length > 0 ? history : undefined,
          }),
        });
      }
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `AI analysis failed (${res.status})`);
      }
      const data = (await res.json()) as Analysis;
      analysisCacheRef.current[lang] = data;
      setAnalysis(data);

      saveSession({
        language,
        dialect: null,
        level,
        targetSentence: level === "freestyle" ? null : target.text,
        transcript,
        score: data.score ?? null,
        issues: data.issues ?? [],
        strengths: data.strengths ?? [],
        practiceTip: data.practiceTip ?? "",
      });
    } catch (e: any) {
      setError(e.message ?? "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }


  function resetPractice() {
    setTranscript("");
    altTranscriptRef.current = null;
    audioBlobRef.current = null;
    analysisCacheRef.current = {};
    setAnalysis(null);
    setError(null);
    setRecurringIssues([]);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }

  function nextSentence() {
    setTarget((cur) => randomSentence(primaryLang, level, cur.id));
    resetPractice();
  }

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsUrlRef = useRef<string | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const ttsCtxRef = useRef<AudioContext | null>(null);
  const ttsSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const stopStreamingTTS = useCallback(() => {
    if (ttsAbortRef.current) {
      try { ttsAbortRef.current.abort(); } catch { /* ignore */ }
      ttsAbortRef.current = null;
    }
    for (const s of ttsSourcesRef.current) {
      try { s.stop(); } catch { /* ignore */ }
    }
    ttsSourcesRef.current = [];
  }, []);

  const playServerTTS = useCallback(async (text: string) => {
    stopStreamingTTS();
    const abort = new AbortController();
    ttsAbortRef.current = abort;
    try {
      const res = await authedFetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) return;

      const { createParser } = await import("eventsource-parser");

      const AudioCtx = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = ttsCtxRef.current ?? new AudioCtx({ sampleRate: 24000 });
      ttsCtxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});

      let playhead = 0;
      let pending = new Uint8Array(0);

      const playChunk = (incoming: Uint8Array) => {
        const bytes = new Uint8Array(pending.length + incoming.length);
        bytes.set(pending);
        bytes.set(incoming, pending.length);
        const usable = bytes.length - (bytes.length % 2);
        pending = bytes.slice(usable);
        if (usable === 0) return;
        const samples = new Int16Array(bytes.buffer, 0, usable / 2);
        const floats = new Float32Array(samples.length);
        for (let i = 0; i < samples.length; i++) floats[i] = samples[i] / 32768;
        const buffer = ctx.createBuffer(1, floats.length, 24000);
        buffer.copyToChannel(floats, 0);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        if (playhead === 0) {
          playhead = ctx.currentTime + 0.05;
        } else {
          playhead = Math.max(playhead, ctx.currentTime);
        }
        source.start(playhead);
        playhead += buffer.duration;
        ttsSourcesRef.current.push(source);
        source.onended = () => {
          ttsSourcesRef.current = ttsSourcesRef.current.filter((s) => s !== source);
        };
      };

      const parser = createParser({
        onEvent(event) {
          if (!event.data) return;
          let payload: { type?: string; audio?: string };
          try { payload = JSON.parse(event.data); } catch { return; }
          if (payload.type !== "speech.audio.delta" || !payload.audio) return;
          const binary = atob(payload.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          playChunk(bytes);
        },
      });

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        parser.feed(value);
      }
    } catch {
      /* ignore (includes aborts) */
    }
  }, [stopStreamingTTS]);


  const speakSentence = useCallback((text: string, id?: string) => {
    if (!text) return;
    // Pre-generated MP3 from the CDN — instant playback, no server round-trip.
    const cachedUrl = id ? (ttsCache as Record<string, string>)[id] : undefined;
    if (cachedUrl) {
      stopStreamingTTS();
      if (ttsAudioRef.current) {
        try { ttsAudioRef.current.pause(); } catch { /* ignore */ }
      }
      const audio = new Audio(cachedUrl);
      ttsAudioRef.current = audio;
      void audio.play().catch(() => {});
      return;
    }

    // Stop any in-flight audio.
    if (ttsAudioRef.current) {
      try { ttsAudioRef.current.pause(); } catch { /* ignore */ }
      ttsAudioRef.current = null;
    }
    stopStreamingTTS();

    // Languages where browser SpeechSynthesis rarely has voices — go straight
    // to the server TTS so playback actually works.
    const serverOnly: LanguageCode[] = ["bn", "ur", "ar"];
    if (serverOnly.includes(primaryLang)) {
      void playServerTTS(text);
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      void playServerTTS(text);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = LANGUAGE_TTS_LOCALE[primaryLang] ?? "en-US";
      utter.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang?.toLowerCase().startsWith(utter.lang.toLowerCase())) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith(primaryLang));
      if (match) {
        utter.voice = match;
        window.speechSynthesis.speak(utter);
      } else {
        // No matching browser voice — fall back to server TTS.
        void playServerTTS(text);
      }
    } catch {
      void playServerTTS(text);
    }
  }, [primaryLang, playServerTTS, stopStreamingTTS]);

  // Warm the browser HTTP cache for the current target's MP3 so the ▶ click
  // plays instantly.
  useEffect(() => {
    const url = (ttsCache as Record<string, string>)[target.id];
    if (!url) return;
    const img = new Image();
    // Using fetch with no-store would defeat caching; a plain fetch primes the disk cache.
    void fetch(url, { mode: "cors", credentials: "omit" }).catch(() => {});
    void img;
  }, [target.id]);





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
        <section aria-labelledby="practice-settings-heading" className="rounded-2xl border border-border/60 bg-background/40 backdrop-blur p-4 space-y-3">
          <h2 id="practice-settings-heading" className="sr-only">Practice Settings</h2>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Detection language
          </div>
          <Select
            value={primaryLang}
            onValueChange={(v) => {
              const lc = v as LanguageCode;
              setPrimaryLang(lc);
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

          {/* Direct Audio Mode toggle — model listens to the recording itself
              instead of only reading the transcript. Works for all levels
              (Beginner → Freestyle). */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Direct audio mode
              </div>
              <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                {directMode
                  ? "AI listens to your voice directly for more accurate pronunciation feedback."
                  : "AI reads only the transcript. Faster, but less nuanced."}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={directMode}
              aria-label="Toggle direct audio mode"
              onClick={() => !analyzing && setDirectMode((v) => !v)}
              disabled={analyzing}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                directMode ? "bg-gradient-primary shadow-glow" : "bg-muted",
                analyzing && "opacity-60 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
                  directMode ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </section>


        {/* Target sentence card */}
        <section aria-labelledby="target-sentence-heading" className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-5">
          <h2 id="target-sentence-heading" className="sr-only">Target Sentence</h2>
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
                className="relative mt-3 flex items-start gap-3"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full border-primary/30 bg-background/60 text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => speakSentence(target.text, target.id)}
                  aria-label="Listen to sentence"
                  title="Listen"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className={cn(
                    "text-2xl sm:text-3xl leading-relaxed font-semibold break-words",
                    primaryLang === "bn" ? "font-bangla-main" : "font-display",
                  )}>
                    {target.text}
                  </div>
                  {target.translit && (
                    <div className={cn("text-sm text-primary/90 italic", primaryLang === "bn" && "font-bangla-side")}>{target.translit}</div>
                  )}
                  <div className={cn("text-xs text-muted-foreground", primaryLang === "bn" && "font-bangla-side")}>{target.meaning}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </section>


        {/* Mic */}
        <section aria-labelledby="record-heading" className="flex flex-col items-center gap-5 py-2">
          <h2 id="record-heading" className="sr-only">Record Your Voice</h2>
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
        </section>

        {/* Transcription */}
        <section aria-labelledby="transcription-heading" className="space-y-2">
          <h2 id="transcription-heading" className="sr-only">Your Transcription</h2>
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
                        <div className={cn("font-semibold", primaryLang === "bn" && "font-bangla-main")}>{iss.word}</div>
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
        </section>


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

        {(() => {
          const canAnalyze = directMode ? !!audioBlobRef.current : !!transcript.trim();
          return (
            <motion.button
              whileHover={{ scale: canAnalyze && !analyzing ? 1.01 : 1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => analyzeWithAI()}
              disabled={!canAnalyze || analyzing}
              className={cn(
                "relative flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow overflow-hidden",
                "bg-gradient-primary animate-gradient",
                (!canAnalyze || analyzing) && "opacity-60 cursor-not-allowed",
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
                {analyzing
                  ? "Analyzing your pronunciation…"
                  : directMode
                    ? "Analyze My Voice (Direct)"
                    : "Analyze My Pronunciation"}
              </span>
            </motion.button>
          );
        })()}
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
            {/* Output language toggle */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/40 backdrop-blur px-4 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Feedback language
              </div>
              <div className="inline-flex rounded-full border border-border/60 bg-muted/40 p-0.5 text-xs font-medium">
                {(["bn", "en"] as const).map((lc) => (
                  <button
                    key={lc}
                    type="button"
                    onClick={() => {
                      if (lc === outputLang || analyzing) return;
                      setOutputLang(lc);
                      analyzeWithAI(lc);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 transition-colors",
                      outputLang === lc
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    disabled={analyzing}
                  >
                    {lc === "bn" ? "বাংলা" : "English"}
                  </button>
                ))}
              </div>
            </div>

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


            {recurringIssues.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-warning">Recurring issues</div>
                <div className="flex flex-wrap gap-2">
                  {recurringIssues.map((ri, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {ri.pattern} · {ri.count}×
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                      <div className={cn("font-semibold text-destructive text-lg", primaryLang === "bn" ? "font-bangla-main" : "font-display")}>{iss.word}</div>
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
