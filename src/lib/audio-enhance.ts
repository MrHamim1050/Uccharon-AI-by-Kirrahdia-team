// Client-only audio enhancement chain:
//   mic → gain (amplifier) → RNNoise (noise suppression) → soft-clip limiter →
//     [analyser for UI] + [MediaStreamDestination for MediaRecorder]
//
// Runs at 48 kHz because RNNoise is trained for 48 kHz frames.
// Browser-level echoCancellation / noiseSuppression / autoGainControl are also
// enabled as a first pass — RNNoise then removes what those miss (fans,
// keyboard, street noise).

import {
  RnnoiseWorkletNode,
  loadRnnoise,
} from "@sapphi-red/web-noise-suppressor";
import rnnoiseWasmUrl from "@sapphi-red/web-noise-suppressor/rnnoise.wasm?url";
import rnnoiseSimdWasmUrl from "@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url";
import rnnoiseWorkletUrl from "@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url";

export type EnhancedAudio = {
  /** Processed stream — feed this into MediaRecorder. */
  recorderStream: MediaStream;
  /** Raw mic stream — stop its tracks to release the mic. */
  micStream: MediaStream;
  audioCtx: AudioContext;
  analyser: AnalyserNode;
  /** Live-tunable amplifier (1.0 = unity). */
  gainNode: GainNode;
  /** Tear everything down. */
  dispose: () => Promise<void>;
};

// Soft-clip curve (tanh-shaped) — prevents digital clipping when the amp is
// pushed on quiet speakers.
function buildSoftClipCurve(amount = 0.9) {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = amount * 6; // shaping strength
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return curve;
}

let cachedRnnoiseWasm: ArrayBuffer | null = null;
let workletLoadedFor: WeakSet<AudioContext> = new WeakSet();

export async function startEnhancedCapture(options?: {
  gain?: number;
}): Promise<EnhancedAudio> {
  const targetGain = options?.gain ?? 1.6;

  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 48000,
    },
  });

  const AudioCtx =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx({ sampleRate: 48000 });

  // Load RNNoise (worklet + wasm) once per context.
  if (!workletLoadedFor.has(audioCtx)) {
    await audioCtx.audioWorklet.addModule(rnnoiseWorkletUrl);
    workletLoadedFor.add(audioCtx);
  }
  if (!cachedRnnoiseWasm) {
    cachedRnnoiseWasm = await loadRnnoise({
      url: rnnoiseWasmUrl,
      simdUrl: rnnoiseSimdWasmUrl,
    });
  }

  const source = audioCtx.createMediaStreamSource(micStream);

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = targetGain;

  let rnnoise: RnnoiseWorkletNode | null = null;
  try {
    rnnoise = new RnnoiseWorkletNode(audioCtx, {
      maxChannels: 1,
      wasmBinary: cachedRnnoiseWasm,
    });
  } catch {
    rnnoise = null; // graceful fallback if worklet fails
  }

  const limiter = audioCtx.createWaveShaper();
  limiter.curve = buildSoftClipCurve(0.9);
  limiter.oversample = "2x";

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  const destination = audioCtx.createMediaStreamDestination();

  // Wire chain: source → gain → (rnnoise?) → limiter → [analyser, destination]
  source.connect(gainNode);
  const afterGain: AudioNode = gainNode;
  if (rnnoise) {
    afterGain.connect(rnnoise);
    rnnoise.connect(limiter);
  } else {
    afterGain.connect(limiter);
  }
  limiter.connect(analyser);
  limiter.connect(destination);

  const dispose = async () => {
    try {
      source.disconnect();
      gainNode.disconnect();
      rnnoise?.disconnect();
      rnnoise?.destroy?.();
      limiter.disconnect();
      analyser.disconnect();
    } catch {
      /* ignore */
    }
    micStream.getTracks().forEach((t) => t.stop());
    try {
      await audioCtx.close();
    } catch {
      /* ignore */
    }
  };

  return {
    recorderStream: destination.stream,
    micStream,
    audioCtx,
    analyser,
    gainNode,
    dispose,
  };
}
