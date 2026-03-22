import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { useSavedTrends } from "@/hooks/useSavedTrends";

export interface Trend {
  id: string;
  name: string;
  signal: "hot" | "warm" | "rising" | "stable";
  matchedSkus: number;
  keywords?: string[];
  colors?: string[];
}

// Legacy export for backward compatibility - now populated from saved trends
export const trends: Trend[] = [];

const signalColors = {
  hot: "bg-destructive",
  warm: "bg-accent",
  rising: "bg-signal-rising",
  stable: "bg-primary",
};

interface TrendSelectorProps {
  selectedTrend: string | null;
  onSelect: (id: string, trend: Trend) => void;
}

export function TrendSelector({ selectedTrend, onSelect }: TrendSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { savedTrends, loading } = useSavedTrends();

  // Transform saved trends to the Trend interface
  const availableTrends: Trend[] = savedTrends.map((saved) => ({
    id: saved.id,
    name: saved.trend_name,
    signal: saved.velocity === "Accelerating" ? "hot" : saved.velocity === "Rising" ? "rising" : saved.velocity === "Stable" ? "stable" : "warm",
    matchedSkus: 0,
    keywords: [],
    colors: [],
  }));

  const selected = availableTrends.find(t => t.id === selectedTrend);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 rounded-lg bg-secondary border border-border transition-colors",
          isOpen && "border-primary"
        )}
        disabled={loading}
      >
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
          {loading ? (
            <span className="text-muted-foreground">Loading trends...</span>
          ) : selected ? (
            <>
              <div className={cn("w-2 h-2 rounded-full", signalColors[selected.signal])} />
              <span className="font-medium">{selected.name}</span>
              <span className="text-sm text-muted-foreground">
                ({selected.matchedSkus} SKUs)
              </span>
              {selected.keywords && selected.keywords.length > 0 && (
                <div className="hidden md:flex items-center gap-1 ml-2">
                  {selected.keywords.slice(0, 3).map(kw => (
                    <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">
              {availableTrends.length === 0 ? "No saved trends - save trends from Signal Intelligence" : "Select a trend to match inventory..."}
            </span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && availableTrends.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-lg bg-card border border-border shadow-xl z-50 animate-scale-in">
          {availableTrends.map((trend) => (
            <button
              key={trend.id}
              onClick={() => {
                onSelect(trend.id, trend);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2.5 rounded-md transition-colors",
                selectedTrend === trend.id ? "bg-primary/10 text-primary" : "hover:bg-secondary"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", signalColors[trend.signal])} />
                <span className="font-medium text-sm">{trend.name}</span>
                {trend.keywords && trend.keywords.length > 0 && (
                  <div className="hidden md:flex items-center gap-1">
                    {trend.keywords.slice(0, 2).map(kw => (
                      <span key={kw} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{trend.matchedSkus} matches</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && availableTrends.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-lg bg-card border border-border shadow-xl z-50 animate-scale-in text-center">
          <p className="text-sm text-muted-foreground">No saved trends available</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Save trends from Signal Intelligence to use them here
          </p>
        </div>
      )}
    </div>
  );
}