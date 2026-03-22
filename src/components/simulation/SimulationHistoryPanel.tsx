import { cn } from "@/lib/utils";
import { useSimulationResults, SimulationResult } from "@/hooks/useSimulationResults";
import { History, Trash2, Loader2, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface SimulationHistoryPanelProps {
  className?: string;
  onLoadResult?: (result: SimulationResult) => void;
}

export function SimulationHistoryPanel({ className, onLoadResult }: SimulationHistoryPanelProps) {
  const { results, loading, deleteResult } = useSimulationResults();

  return (
    <div className={cn("glass-card rounded-xl p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h3 className="font-display font-bold text-lg">Past Simulations</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8">
          <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No saved simulations yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Run a simulation and save it to build your history
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {results.map((result) => (
            <SimulationHistoryItem
              key={result.id}
              result={result}
              onLoad={() => onLoadResult?.(result)}
              onDelete={() => deleteResult(result.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SimulationHistoryItemProps {
  result: SimulationResult;
  onLoad: () => void;
  onDelete: () => void;
}

function SimulationHistoryItem({ result, onLoad, onDelete }: SimulationHistoryItemProps) {
  const score = result.overall_score || 0;
  const scoreColor = score >= 70 ? "text-signal-rising" : score >= 50 ? "text-accent" : "text-destructive";

  return (
    <div 
      className="group flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={onLoad}
    >
      <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg bg-secondary", scoreColor)}>
        <TrendingUp className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{result.ad_headline}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-sm font-semibold", scoreColor)}>
            {score}%
          </span>
          <span className="text-xs text-muted-foreground">
            • {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
