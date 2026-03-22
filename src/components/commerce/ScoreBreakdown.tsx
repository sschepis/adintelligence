import { cn } from "@/lib/utils";
import { Sparkles, Type, Eye } from "lucide-react";

interface ScoreBreakdownProps {
  keywordScore: number;
  visualScore?: number;
  combinedScore: number;
  hasVisualScore: boolean;
  compact?: boolean;
}

export function ScoreBreakdown({
  keywordScore,
  visualScore = 0,
  combinedScore,
  hasVisualScore,
  compact = false
}: ScoreBreakdownProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Combined Score Bar */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                hasVisualScore 
                  ? "bg-gradient-to-r from-violet-500 via-primary to-blue-500"
                  : "bg-gradient-to-r from-primary to-blue-500"
              )}
              style={{ width: `${combinedScore}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary">
            {combinedScore}%
            {hasVisualScore && (
              <span className="text-[10px] text-muted-foreground ml-0.5">AI</span>
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Combined Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-xs text-muted-foreground">Combined</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 rounded-full bg-secondary overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                hasVisualScore 
                  ? "bg-gradient-to-r from-violet-500 via-primary to-blue-500"
                  : "bg-gradient-to-r from-primary to-blue-500"
              )}
              style={{ width: `${combinedScore}%` }}
            />
          </div>
          <span className="text-xs font-bold text-primary w-8 text-right">{combinedScore}%</span>
        </div>
      </div>

      {/* Keyword Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Type className="h-3 w-3 text-blue-400" />
          <span className="text-xs text-muted-foreground">Keywords</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-20 rounded-full bg-secondary overflow-hidden">
            <div 
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${keywordScore}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{keywordScore}%</span>
        </div>
      </div>

      {/* Visual Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Eye className="h-3 w-3 text-violet-400" />
          <span className="text-xs text-muted-foreground">Visual AI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-20 rounded-full bg-secondary overflow-hidden">
            {hasVisualScore ? (
              <div 
                className="h-full rounded-full bg-violet-500 transition-all duration-300"
                style={{ width: `${visualScore}%` }}
              />
            ) : (
              <div className="h-full w-full bg-secondary/50 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">
            {hasVisualScore ? `${visualScore}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
