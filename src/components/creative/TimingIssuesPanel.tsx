import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, ArrowUpFromLine, Wand2 } from "lucide-react";
import type { TimingIssue } from "@/lib/manifestTimingAnalysis";

interface TimingIssuesPanelProps {
  issues: TimingIssue[];
  onRetileShot?: (shotIndex: number) => void;
  onShotClick?: (shotIndex: number) => void;
}

export function TimingIssuesPanel({ issues, onRetileShot, onShotClick }: TimingIssuesPanelProps) {
  if (issues.length === 0) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h6 className="text-sm font-medium flex items-center gap-2">
            Timing issues
            <Badge variant="warning" className="text-[10px]">{issues.length}</Badge>
          </h6>
          <span className="text-[10px] text-muted-foreground">Click a shot to jump · "Retile" snaps to prev shot's end</span>
        </div>
        <AnimatePresence initial={false}>
          {issues.map((issue) => (
            <motion.div
              key={`${issue.shotIndex}-${issue.kind}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-2 text-xs p-2 rounded bg-background/60 border border-border"
            >
              {issue.kind === "gap" ? (
                <ArrowDownToLine className="h-3 w-3 text-warning shrink-0" />
              ) : (
                <ArrowUpFromLine className="h-3 w-3 text-destructive shrink-0" />
              )}
              <button
                type="button"
                onClick={() => onShotClick?.(issue.shotIndex)}
                className="font-medium hover:underline shrink-0"
              >
                Shot #{issue.shotIndex + 1}
              </button>
              <span className="text-muted-foreground">
                {issue.kind === "gap" ? "starts" : "overlaps by"}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {issue.deltaSeconds.toFixed(2)}s
              </Badge>
              <span className="text-muted-foreground truncate">
                · expected @{issue.expectedStart.toFixed(1)}s, got @{issue.actualStart.toFixed(1)}s
              </span>
              {onRetileShot && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto h-6 gap-1 text-[10px] shrink-0"
                  onClick={() => onRetileShot(issue.shotIndex)}
                >
                  <Wand2 className="h-3 w-3" /> Retile this shot
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
