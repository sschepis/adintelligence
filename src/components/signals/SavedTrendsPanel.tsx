import { cn } from "@/lib/utils";
import { useSavedTrends, SavedTrend } from "@/hooks/useSavedTrends";
import { Bookmark, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface SavedTrendsPanelProps {
  className?: string;
}

export function SavedTrendsPanel({ className }: SavedTrendsPanelProps) {
  const { savedTrends, loading, removeTrend } = useSavedTrends();

  return (
    <div className={cn("bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/40 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="h-5 w-5 text-primary" />
        <h3 className="font-display font-bold text-lg text-foreground">Saved Trends</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : savedTrends.length === 0 ? (
        <div className="text-center py-8">
          <Bookmark className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No saved trends yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Click the bookmark icon on any trend to save it
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedTrends.map((trend) => (
            <SavedTrendItem
              key={trend.id}
              trend={trend}
              onRemove={() => removeTrend(trend.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SavedTrendItemProps {
  trend: SavedTrend;
  onRemove: () => void;
}

function SavedTrendItem({ trend, onRemove }: SavedTrendItemProps) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl bg-card hover:bg-secondary border border-border hover:border-primary/30 transition-all duration-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm text-foreground truncate">{trend.trend_name}</h4>
          {trend.ai_analysis && (
            <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
            {trend.platform}
          </span>
          {trend.volume && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
              {trend.volume}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Saved {formatDistanceToNow(new Date(trend.saved_at), { addSuffix: true })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
