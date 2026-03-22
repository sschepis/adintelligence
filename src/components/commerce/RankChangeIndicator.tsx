import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RankChangeIndicatorProps {
  previousRank: number;
  currentRank: number;
  animate?: boolean;
}

export function RankChangeIndicator({
  previousRank,
  currentRank,
  animate = true
}: RankChangeIndicatorProps) {
  const change = previousRank - currentRank; // Positive = moved up, Negative = moved down
  
  if (change === 0 || previousRank === 0) {
    return null;
  }

  const isUp = change > 0;
  const absChange = Math.abs(change);

  return (
    <div 
      className={cn(
        "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
        isUp 
          ? "bg-signal-rising/20 text-signal-rising" 
          : "bg-destructive/20 text-destructive",
        animate && "animate-scale-in"
      )}
    >
      {isUp ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>{absChange}</span>
    </div>
  );
}
