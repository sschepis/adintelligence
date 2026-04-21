// Friendly labels + validation hints for ProductionManifest enum fields.
import type { CameraMotion, Transition } from "@/types/videoAd";

export const CAMERA_MOTION_OPTIONS: { value: CameraMotion; label: string; hint: string }[] = [
  { value: "static",     label: "Static — locked frame",       hint: "No camera movement. Best for product hero shots." },
  { value: "pan-left",   label: "Pan left",                    hint: "Horizontal sweep right→left. Good for revealing context." },
  { value: "pan-right",  label: "Pan right",                   hint: "Horizontal sweep left→right. Good for revealing context." },
  { value: "zoom-in",    label: "Zoom in — push",              hint: "Pulls viewer toward subject. Builds tension or focus." },
  { value: "zoom-out",   label: "Zoom out — pull",             hint: "Reveals scale or context. Often used for openings/closings." },
  { value: "dolly",      label: "Dolly — physical move",       hint: "Camera physically moves through scene. Cinematic depth." },
  { value: "tilt",       label: "Tilt — vertical pan",         hint: "Up/down sweep. Good for tall products or architecture." },
];

export const TRANSITION_OPTIONS: { value: Transition; label: string; hint: string }[] = [
  { value: "cut",      label: "Cut — instant",        hint: "Default. Energetic, modern pacing." },
  { value: "fade",     label: "Fade — to/from black", hint: "Marks a strong scene break. Use sparingly." },
  { value: "dissolve", label: "Dissolve — blend",     hint: "Soft transition. Good for time passing or mood shift." },
  { value: "wipe",     label: "Wipe — directional",   hint: "Stylistic, retro. Pair with bold motion." },
  { value: "slide",    label: "Slide — push frame",   hint: "Modern, app-like. Pairs well with pan motions." },
];

export interface EnumHint {
  level: "warn" | "info";
  message: string;
}

/**
 * Surface combinations that look off but aren't hard errors.
 * Returns null when the combo is fine.
 */
export function checkShotEnumCombo(
  cameraMotion: CameraMotion,
  transition: Transition,
  durationSeconds: number,
): EnumHint | null {
  // Fade + very short shot rarely reads on screen
  if (transition === "fade" && durationSeconds < 2) {
    return { level: "warn", message: "Fade transitions need ≥2s to register — consider 'cut' for shots under 2s." };
  }
  // Dissolve + cut-style fast pacing
  if (transition === "dissolve" && durationSeconds < 1.5) {
    return { level: "warn", message: "Dissolves blend across the cut — short shots will feel mushy." };
  }
  // Big zooms in tiny windows look frantic
  if ((cameraMotion === "zoom-in" || cameraMotion === "zoom-out") && durationSeconds < 1.5) {
    return { level: "info", message: "Zooms read better with ≥1.5s of screen time." };
  }
  // Dolly in <2s usually doesn't read
  if (cameraMotion === "dolly" && durationSeconds < 2) {
    return { level: "info", message: "Dolly moves benefit from ≥2s — increase duration for a clearer reveal." };
  }
  // Wipe + dolly is busy
  if (transition === "wipe" && cameraMotion === "dolly") {
    return { level: "warn", message: "Wipe + dolly stacks two strong motions. Consider 'cut' or 'static'." };
  }
  return null;
}
