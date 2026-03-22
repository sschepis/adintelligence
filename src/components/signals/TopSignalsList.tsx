import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { badgeContrastColors } from "@/lib/colorContrast";

interface TopSignalsListProps {
  className?: string;
}

export function TopSignalsList({ className }: TopSignalsListProps) {
  const { savedTrends, loading } = useSavedTrends();

  // Transform saved trends to display format
  const topSignals = savedTrends.slice(0, 5).map((trend, index) => ({
    id: trend.id,
    name: trend.trend_name,
    volume: trend.volume || "N/A",
    change: trend.velocity === "Accelerating" ? 100 : trend.velocity === "Stable" ? 0 : -20,
    rank: index + 1,
  }));

  const getChangeColors = (change: number) => {
    if (change > 0) return badgeContrastColors.green;
    if (change < 0) return badgeContrastColors.red;
    return badgeContrastColors.gray;
  };

  return (
    <div className={cn("bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">Top Signals</h3>
          <p className="text-sm text-muted-foreground">Your saved trends</p>
        </div>
        <span className="text-xs text-muted-foreground">Saved</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : topSignals.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No saved trends yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Save trends to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topSignals.map((signal, index) => {
            const changeColors = getChangeColors(signal.change);
            return (
              <div
                key={signal.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/70 border border-border/30 hover:border-primary/20 transition-all duration-200 cursor-pointer group animate-slide-in-right"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Rank */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-xl font-display font-bold text-sm shadow-sm",
                  signal.rank === 1 && "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                  signal.rank === 2 && "bg-gradient-to-br from-muted-foreground/60 to-muted-foreground/80 text-primary-foreground",
                  signal.rank === 3 && "bg-gradient-to-br from-accent to-primary/80 text-primary-foreground",
                  signal.rank > 3 && "bg-secondary text-muted-foreground border border-border/40"
                )}>
                  {signal.rank}
                </div>

                {/* Name & Volume */}
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {signal.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{signal.volume} mentions</p>
                </div>

                {/* Change */}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
                  changeColors.bg,
                  changeColors.text,
                  changeColors.border
                )}>
                  {signal.change > 0 && <TrendingUp className="h-3 w-3" />}
                  {signal.change < 0 && <TrendingDown className="h-3 w-3" />}
                  {signal.change === 0 && <Minus className="h-3 w-3" />}
                  <span>{signal.change > 0 ? "+" : ""}{signal.change}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}