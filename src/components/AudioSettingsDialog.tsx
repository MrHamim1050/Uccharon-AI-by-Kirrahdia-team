import { useEffect, useState } from "react";
import { Volume2, Waves, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_AUDIO_SETTINGS,
  loadAudioSettings,
  saveAudioSettings,
  type AudioSettings,
} from "@/lib/audio-settings";

export function AudioSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

  useEffect(() => {
    if (open) setSettings(loadAudioSettings());
  }, [open]);

  function update(patch: Partial<AudioSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveAudioSettings(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Audio Settings</DialogTitle>
          <DialogDescription>
            Tune how your microphone is processed before it reaches the AI. Changes apply on your next recording.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Noise suppression */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-semibold">Noise Suppression</div>
                <div className="text-xs text-muted-foreground">
                  RNNoise removes fans, keyboard clicks, and background chatter.
                </div>
              </div>
            </div>
            <Switch
              checked={settings.noiseSuppression}
              onCheckedChange={(v) => update({ noiseSuppression: v })}
            />
          </div>

          {/* Amplifier */}
          <div className="space-y-2">
            <div className="flex gap-3">
              <Volume2 className="mt-0.5 h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Amplifier</div>
                  <div className="font-numeric text-sm tabular-nums text-muted-foreground">
                    {settings.gain.toFixed(2)}×
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Boost quiet voices. Above 2× may distort loud speakers.
                </div>
              </div>
            </div>
            <Slider
              min={0.5}
              max={3}
              step={0.05}
              value={[settings.gain]}
              onValueChange={([v]) => update({ gain: v })}
              className="pt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
              <span>0.5×</span>
              <span>1.0×</span>
              <span>3.0×</span>
            </div>
          </div>

          {/* Soft limiter */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Waves className="mt-0.5 h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-semibold">Soft-clip Limiter</div>
                <div className="text-xs text-muted-foreground">
                  Prevents harsh distortion when the amplifier is pushed high.
                </div>
              </div>
            </div>
            <Switch
              checked={settings.softLimiter}
              onCheckedChange={(v) => update({ softLimiter: v })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSettings(DEFAULT_AUDIO_SETTINGS);
                saveAudioSettings(DEFAULT_AUDIO_SETTINGS);
              }}
            >
              Reset to defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
