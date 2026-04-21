// Client-side mirror of the plan-video-ad server validator.
// Keep in sync with supabase/functions/plan-video-ad/index.ts::validateManifest
import type { ProductionManifest, PlanValidationError } from "@/types/videoAd";

export const CAMERA_MOTIONS = [
  "static", "pan-left", "pan-right", "zoom-in", "zoom-out", "dolly", "tilt",
] as const;
export const TRANSITIONS = ["cut", "fade", "dissolve", "wipe", "slide"] as const;
export const ASPECTS = ["16:9", "9:16", "1:1"] as const;

export function validateManifest(
  m: ProductionManifest | null | undefined,
  expectedDuration?: number,
  expectedAspect?: string,
): PlanValidationError[] {
  const errors: PlanValidationError[] = [];
  const push = (path: string, message: string) => errors.push({ path, message });
  if (!m || typeof m !== "object") {
    push("", "Manifest is missing");
    return errors;
  }

  if (!m.title || m.title.length < 2) push("title", "Title must be a non-empty string");
  if (!m.concept || m.concept.length < 10) push("concept", "Concept must be at least 10 chars");
  if (typeof m.durationSeconds !== "number" || m.durationSeconds <= 0) {
    push("durationSeconds", "Must be positive");
  } else if (expectedDuration && Math.abs(m.durationSeconds - expectedDuration) > 0.5) {
    push("durationSeconds", `Expected ~${expectedDuration}s, got ${m.durationSeconds}s`);
  }
  if (!ASPECTS.includes(m.aspectRatio as any)) {
    push("aspectRatio", `Must be one of ${ASPECTS.join(", ")}`);
  } else if (expectedAspect && m.aspectRatio !== expectedAspect) {
    push("aspectRatio", `Expected ${expectedAspect}`);
  }

  if (!m.soundtrack?.mood || !m.soundtrack?.description) {
    push("soundtrack", "Must include mood and description");
  }
  if (!m.voiceover?.voice || !m.voiceover?.script) {
    push("voiceover", "Must include voice and script");
  }

  if (!Array.isArray(m.shots)) {
    push("shots", "Must be an array");
    return errors;
  }
  if (m.shots.length < 3) push("shots", "At least 3 shots required");
  if (m.shots.length > 12) push("shots", "At most 12 shots allowed");

  let cursor = 0;
  m.shots.forEach((s, i) => {
    const p = `shots[${i}]`;
    if (typeof s.startSeconds !== "number") push(`${p}.startSeconds`, "Must be a number");
    else if (Math.abs(s.startSeconds - cursor) > 0.5) {
      push(`${p}.startSeconds`, `Expected ${cursor.toFixed(1)}s (no gaps), got ${s.startSeconds}s`);
    }
    if (typeof s.durationSeconds !== "number" || s.durationSeconds <= 0) {
      push(`${p}.durationSeconds`, "Must be > 0");
    } else if (s.durationSeconds < 1) {
      push(`${p}.durationSeconds`, "Each shot must be at least 1s");
    }
    if (!s.visualPrompt || s.visualPrompt.length < 10) {
      push(`${p}.visualPrompt`, "Visual prompt must be at least 10 chars");
    }
    if (!CAMERA_MOTIONS.includes(s.cameraMotion as any)) {
      push(`${p}.cameraMotion`, "Invalid camera motion");
    }
    if (!TRANSITIONS.includes(s.transition as any)) {
      push(`${p}.transition`, "Invalid transition");
    }
    cursor = (s.startSeconds ?? cursor) + (s.durationSeconds ?? 0);
  });

  if (m.shots.length && Math.abs(cursor - (m.durationSeconds ?? 0)) > 0.5) {
    push("shots", `Shots tile to ${cursor.toFixed(1)}s but durationSeconds is ${m.durationSeconds}s`);
  }

  return errors;
}

/**
 * Re-tile shots so each shot starts at the previous shot's end (zero gaps),
 * and update manifest.durationSeconds to the new total.
 */
export function retileManifest(m: ProductionManifest): ProductionManifest {
  let cursor = 0;
  const shots = m.shots.map((s, i) => {
    const start = cursor;
    const dur = Math.max(1, Number(s.durationSeconds) || 1);
    cursor += dur;
    return { ...s, index: i, startSeconds: start, durationSeconds: dur };
  });
  return { ...m, shots, durationSeconds: cursor };
}
