import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, FileText, Search } from "lucide-react";

export interface GapItem {
  id: string;
  trendName: string;
  missingCategory: string;
  marketDemand: string;
  competitorCount: number;
  urgency: "high" | "medium" | "low";
  suggestedProducts: string[];
}

const urgencyColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/10 text-accent border-accent/20",
  low: "bg-primary/10 text-primary border-primary/20",
};

interface GapAnalysisPanelProps {
  className?: string;
  gaps?: GapItem[];
  loading?: boolean;
  onGenerateBrief?: (gap: GapItem) => void;
}

export function GapAnalysisPanel({ className, gaps = [], loading, onGenerateBrief }: GapAnalysisPanelProps) {
  if (loading) {
    return (
      <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-lg">Gap Analysis</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No gaps detected</p>
          <p className="text-xs text-muted-foreground/70">Select a trend to identify inventory gaps</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-lg">Gap Analysis</h3>
        </div>
        <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
          {gaps.length} opportunities
        </span>
      </div>

      <div className="space-y-4">
        {gaps.map((gap, index) => (
          <div
            key={gap.id}
            className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors animate-slide-in-right"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{gap.missingCategory}</h4>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium border",
                    urgencyColors[gap.urgency]
                  )}>
                    {gap.urgency} priority
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Trending with "{gap.trendName}"
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-accent">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="font-semibold">{gap.marketDemand}</span>
                </div>
                <p className="text-xs text-muted-foreground">market demand</p>
              </div>
            </div>

            {/* Suggested Products */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Suggested Products</p>
              <div className="flex flex-wrap gap-1.5">
                {gap.suggestedProducts.map((product, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {gap.competitorCount} competitors active
              </span>
              <Button 
                variant="glass" 
                size="sm" 
                className="gap-1.5"
                onClick={() => onGenerateBrief?.(gap)}
              >
                <FileText className="h-3.5 w-3.5" />
                Generate Brief
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
