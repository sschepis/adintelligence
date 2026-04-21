import { motion } from "framer-motion";
import type { ProductionManifest } from "@/types/videoAd";
import { cn } from "@/lib/utils";

interface ManifestTimelineProps {
  manifest: ProductionManifest;
  /** Indices of shots flagged by validation */
  errorIndices?: Set<number>;
  activeIndex?: number | null;
  onShotClick?: (index: number) => void;
}

const SHOT_COLORS = [
  "bg-primary/70", "bg-accent/70", "bg-secondary/70",
  "bg-success/70", "bg-warning/70", "bg-info/70",
];

export function ManifestTimeline({
  manifest, errorIndices, activeIndex, onShotClick,
}: ManifestTimelineProps) {
  const total = manifest.shots.reduce((acc, s) => acc + s.durationSeconds, 0);
  if (!total) return null;

  // Build cumulative cursor to detect overlaps/gaps for visual hints
  let cursor = 0;
  const segments = manifest.shots.map((s, i) => {
    const expectedStart = cursor;
    const gap = (s.startSeconds ?? cursor) - cursor;
    cursor = (s.startSeconds ?? cursor) + s.durationSeconds;
    return { shot: s, idx: i, expectedStart, gap };
  });

  // Ticks every 5s (or 1s if total <= 10)
  const tickInterval = total <= 10 ? 1 : total <= 30 ? 5 : 10;
  const ticks: number[] = [];
  for (let t = 0; t <= total; t += tickInterval) ticks.push(t);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Timeline · {total.toFixed(1)}s total</span>
        <span>Target {manifest.durationSeconds}s</span>
      </div>

      <div className="relative w-full h-12 rounded-md bg-muted/40 overflow-hidden border border-border">
        {segments.map(({ shot, idx, gap }) => {
          const widthPct = (shot.durationSeconds / total) * 100;
          const isActive = activeIndex === idx;
          const hasError = errorIndices?.has(idx);
          const color = SHOT_COLORS[idx % SHOT_COLORS.length];
          return (
            <motion.button
              key={idx}
              type="button"
              onClick={() => onShotClick?.(idx)}
              layout
              initial={false}
              animate={{ width: `${widthPct}%` }}
              className={cn(
                "h-full inline-flex items-center justify-center text-[10px] font-medium text-foreground/90",
                "border-r border-background/40 last:border-r-0 transition-all relative overflow-hidden",
                color,
                hasError && "ring-2 ring-destructive ring-inset",
                isActive && "ring-2 ring-primary ring-inset z-10",
                Math.abs(gap) > 0.5 && "border-l-2 border-l-destructive",
              )}
              style={{ width: `${widthPct}%`, display: "inline-block" }}
              title={`Shot ${idx + 1} · ${shot.durationSeconds}s${
                Math.abs(gap) > 0.5 ? ` · ${gap > 0 ? "gap" : "overlap"} ${Math.abs(gap).toFixed(1)}s` : ""
              }`}
            >
              <span className="truncate px-1">#{idx + 1} · {shot.durationSeconds}s</span>
            </motion.button>
          );
        })}
      </div>

      {/* tick ruler */}
      <div className="relative h-4 w-full">
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute top-0 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${(t / total) * 100}%` }}
          >
            <div className="h-1 w-px bg-muted-foreground/40" />
            <span className="text-[9px] text-muted-foreground mt-0.5">{t}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
