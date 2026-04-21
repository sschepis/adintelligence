import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Info } from "lucide-react";
import type { CameraMotion, Transition } from "@/types/videoAd";
import {
  CAMERA_MOTION_OPTIONS, TRANSITION_OPTIONS, checkShotEnumCombo,
} from "@/lib/manifestEnums";

interface ShotEnumEditorProps {
  cameraMotion: CameraMotion;
  transition: Transition;
  durationSeconds: number;
  onCameraMotion: (v: CameraMotion) => void;
  onTransition: (v: Transition) => void;
  onClickStop?: (e: React.MouseEvent) => void;
}

export function ShotEnumEditor({
  cameraMotion, transition, durationSeconds,
  onCameraMotion, onTransition, onClickStop,
}: ShotEnumEditorProps) {
  const hint = checkShotEnumCombo(cameraMotion, transition, durationSeconds);

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Select value={cameraMotion} onValueChange={(v) => onCameraMotion(v as CameraMotion)}>
          <SelectTrigger className="h-8 flex-1 min-w-[140px] text-xs" onClick={onClickStop}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-sm">
            {CAMERA_MOTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                <div className="flex flex-col items-start py-0.5">
                  <span className="text-xs font-medium">{o.label}</span>
                  <span className="text-[10px] text-muted-foreground">{o.hint}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={transition} onValueChange={(v) => onTransition(v as Transition)}>
          <SelectTrigger className="h-8 w-32 text-xs" onClick={onClickStop}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-sm">
            {TRANSITION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                <div className="flex flex-col items-start py-0.5">
                  <span className="text-xs font-medium">{o.label}</span>
                  <span className="text-[10px] text-muted-foreground">{o.hint}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hint && (
        <div
          className={`flex items-start gap-1 text-[10px] ${
            hint.level === "warn" ? "text-warning" : "text-muted-foreground"
          }`}
        >
          {hint.level === "warn" ? (
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          ) : (
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
          )}
          <span>{hint.message}</span>
        </div>
      )}
    </div>
  );
}
