// Analyze a manifest's shot timing to pinpoint exactly where gaps and overlaps occur.
import type { ProductionManifest } from "@/types/videoAd";

export type TimingIssueKind = "gap" | "overlap";

export interface TimingIssue {
  kind: TimingIssueKind;
  /** Index of the shot whose startSeconds disagrees with the previous cursor. */
  shotIndex: number;
  /** Seconds of gap (positive) or overlap (positive). */
  deltaSeconds: number;
  /** Where the cursor expected this shot to start. */
  expectedStart: number;
  /** Where the shot actually starts. */
  actualStart: number;
}

/**
 * Walk the shot list and report every place where shot N's startSeconds
 * doesn't match the cursor (= prev.startSeconds + prev.durationSeconds).
 */
export function analyzeTiming(m: ProductionManifest | null | undefined): TimingIssue[] {
  if (!m?.shots?.length) return [];
  const issues: TimingIssue[] = [];
  let cursor = 0;
  m.shots.forEach((s, i) => {
    const start = Number(s.startSeconds ?? cursor);
    const dur = Number(s.durationSeconds ?? 0);
    const delta = start - cursor;
    if (Math.abs(delta) > 0.1) {
      issues.push({
        kind: delta > 0 ? "gap" : "overlap",
        shotIndex: i,
        deltaSeconds: Math.abs(delta),
        expectedStart: cursor,
        actualStart: start,
      });
    }
    cursor = start + dur;
  });
  return issues;
}

/** Re-tile only one shot: snap its startSeconds to the previous shot's end, then push subsequent shots' starts. */
export function retileShot(m: ProductionManifest, shotIndex: number): ProductionManifest {
  if (!m.shots[shotIndex]) return m;
  const shots = [...m.shots];
  const prev = shots[shotIndex - 1];
  const newStart = prev ? prev.startSeconds + prev.durationSeconds : 0;
  shots[shotIndex] = { ...shots[shotIndex], startSeconds: newStart };
  // Cascade — subsequent shots follow
  let cursor = newStart + shots[shotIndex].durationSeconds;
  for (let i = shotIndex + 1; i < shots.length; i++) {
    shots[i] = { ...shots[i], startSeconds: cursor };
    cursor += shots[i].durationSeconds;
  }
  const total = shots.reduce((acc, s) => acc + s.durationSeconds, 0);
  return { ...m, shots, durationSeconds: total };
}
