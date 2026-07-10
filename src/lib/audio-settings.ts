// Persisted audio-processing preferences. Read at recording start; updated
// live from the Settings dialog. Values persist in localStorage.

export type AudioSettings = {
  noiseSuppression: boolean;
  softLimiter: boolean;
  /** Amplifier gain, 0.5 – 3.0. 1.0 = unity. */
  gain: number;
};

const KEY = "uccharon-audio-settings";

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  noiseSuppression: true,
  softLimiter: true,
  gain: 1.6,
};

export function loadAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      noiseSuppression: parsed.noiseSuppression ?? DEFAULT_AUDIO_SETTINGS.noiseSuppression,
      softLimiter: parsed.softLimiter ?? DEFAULT_AUDIO_SETTINGS.softLimiter,
      gain:
        typeof parsed.gain === "number" && parsed.gain >= 0.5 && parsed.gain <= 3
          ? parsed.gain
          : DEFAULT_AUDIO_SETTINGS.gain,
    };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(s: AudioSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("uccharon-audio-settings-changed", { detail: s }));
  } catch {}
}
