import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

const LANGUAGES: { code: string; label: string }[] = [
  { code: "auto", label: "Auto-detect" },
  { code: "bn", label: "Standard Bangla (বাংলা)" },
  { code: "bn-sylheti", label: "Sylheti (সিলেটি)" },
  { code: "bn-chattogramia", label: "Chattogramia (চাটগাঁইয়া)" },
  { code: "bn-noakhailla", label: "Noakhailla (নোয়াখাইল্লা)" },
  { code: "bn-rangpuri", label: "Rangpuri (রংপুরী)" },
  { code: "bn-barishailla", label: "Barishailla (বরিশাইল্লা)" },
  { code: "en", label: "English" },
];

export function VoiceInput() {
  const [language, setLanguage] = useState<string>("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => stopEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const bars = 48;
      const step = Math.floor(bufferLength / bars);
      const barW = w / bars;
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          const v = (dataArray[i * step + j] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / step);
        const barH = Math.max(3, rms * h * 2.5);
        const y = (h - barH) / 2;
        ctx.fillStyle = `oklch(0.55 0.2 264)`;
        ctx.fillRect(i * barW + barW * 0.15, y, barW * 0.7, barH);
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
      setStatus("idle");
    } catch (e: any) {
      setError(e.message ?? "Transcription failed");
      setStatus("error");
    }
  }

  async function analyzeWithAI() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-pronunciation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript, language }),
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

  // Map normalized issue word -> Issue for hover lookup
  const issueMap = useMemo(() => {
    const map = new Map<string, Issue>();
    analysis?.issues?.forEach((iss) => {
      const key = normalizeWord(iss.word);
      if (key) map.set(key, iss);
    });
    return map;
  }, [analysis]);

  // Split transcript into tokens with whitespace preserved
  const tokens = useMemo(() => {
    if (!transcript) return [] as { text: string; isWord: boolean }[];
    const parts = transcript.split(/(\s+)/);
    return parts
      .filter((p) => p.length > 0)
      .map((p) => ({ text: p, isWord: !/^\s+$/.test(p) }));
  }, [transcript]);

  const seconds = (elapsedMs / 1000).toFixed(1);
  const isRecording = status === "recording";
  const isBusy = status === "transcribing";
  const hasIssues = (analysis?.issues?.length ?? 0) > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-muted-foreground">Language</label>
        <Select value={language} onValueChange={setLanguage} disabled={isRecording || isBusy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isBusy}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={cn(
            "relative flex h-28 w-28 items-center justify-center rounded-full transition-all",
            "shadow-lg hover:scale-105 active:scale-95",
            isRecording
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground",
            isBusy && "opacity-60 cursor-not-allowed",
          )}
        >
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping" />
          )}
          {isBusy ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : isRecording ? (
            <Square className="h-10 w-10 fill-current" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </button>

        <div className="h-16 w-full rounded-lg bg-muted/50 border border-border overflow-hidden">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        <div className="font-mono text-lg tabular-nums text-foreground">
          {isRecording ? `● ${seconds}s` : isBusy ? "Transcribing…" : `${seconds}s`}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">Transcription</label>
          {hasIssues && (
            <span className="text-xs text-muted-foreground">
              Hover the <span className="text-destructive font-medium">red</span> words for tips
            </span>
          )}
        </div>

        {hasIssues ? (
          <TooltipProvider delayDuration={100}>
            <div className="min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-relaxed">
              {tokens.map((tok, i) => {
                if (!tok.isWord) return <span key={i}>{tok.text}</span>;
                const key = normalizeWord(tok.text);
                const iss = issueMap.get(key);
                if (!iss) return <span key={i}>{tok.text}</span>;
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
          />
        )}
      </div>

      {audioUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Playback your recording
          </label>
          <audio
            src={audioUrl}
            controls
            className="w-full rounded-md bg-muted/40 border border-border"
          />
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <Button
        onClick={analyzeWithAI}
        disabled={!transcript.trim() || analyzing}
        className="w-full"
        size="lg"
      >
        {analyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Get AI Pronunciation Analysis
          </>
        )}
      </Button>

      {analysis && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">AI Analysis</label>
            {typeof analysis.score === "number" && (
              <div className="text-2xl font-bold tabular-nums text-primary">
                {analysis.score}
                <span className="text-sm text-muted-foreground font-normal">/100</span>
              </div>
            )}
          </div>

          {analysis.overall && (
            <p className="text-sm text-foreground leading-relaxed">{analysis.overall}</p>
          )}

          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Strengths
              </div>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {analysis.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.issues && analysis.issues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Areas to improve
              </div>
              <ul className="space-y-2">
                {analysis.issues.map((iss, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border bg-card p-3 text-sm space-y-1"
                  >
                    <div className="font-semibold text-destructive">{iss.word}</div>
                    <div className="text-foreground">{iss.problem}</div>
                    <div className="text-muted-foreground italic">💡 {iss.tip}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.practiceTip && (
            <div className="text-sm border-t border-border pt-3">
              <span className="font-semibold">Next: </span>
              {analysis.practiceTip}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
