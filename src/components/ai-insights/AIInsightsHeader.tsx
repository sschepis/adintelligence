import { Brain, Sparkles } from "lucide-react";

interface AIInsightsHeaderProps {
  trendCount: number;
  inventoryCount: number;
}

export function AIInsightsHeader({ trendCount, inventoryCount }: AIInsightsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-sm text-muted-foreground">
            Predictive intelligence powered by your trends and inventory
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-card/60 px-3 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm">
            <span className="font-medium">{trendCount}</span> trends
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm">
            <span className="font-medium">{inventoryCount}</span> products
          </span>
        </div>
      </div>
    </div>
  );
}
