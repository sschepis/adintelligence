import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePredictiveIntelligence } from "@/hooks/usePredictiveIntelligence";
import { Package, AlertTriangle, TrendingUp, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface DemandInsightsWidgetProps {
  trendName?: string;
  inventoryCount?: number;
  matchedProducts?: number;
  className?: string;
}

export function DemandInsightsWidget({ trendName, inventoryCount = 0, matchedProducts = 0, className }: DemandInsightsWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const { planDemand, demandPlan, isLoading } = usePredictiveIntelligence();

  const handlePlan = async () => {
    if (!trendName) return;
    await planDemand(
      [{ name: trendName, stock: inventoryCount, price: 50 }],
      [{ name: trendName, velocity: "rising", volume: "10K" }]
    );
    setExpanded(true);
  };

  return (
    <Card className={`bg-card/60 backdrop-blur-sm border-border/40 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Demand Planning
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handlePlan} disabled={isLoading || !trendName}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : demandPlan ? (expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <TrendingUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!demandPlan && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{trendName ? `Plan inventory for "${trendName}"` : "Select a trend first"}</p>
            <div className="flex gap-4 text-xs"><span className="text-muted-foreground">SKUs: <span className="font-medium">{inventoryCount}</span></span><span className="text-muted-foreground">Matched: <span className="font-medium">{matchedProducts}</span></span></div>
          </div>
        )}
        {isLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Analyzing demand...</div>}
        {demandPlan && (
          <div className="space-y-3">
            {demandPlan.alerts?.filter(a => a.severity === "critical").slice(0, 2).map((alert, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-destructive/10 rounded px-2 py-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                <span className="truncate">{alert.message}</span>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 rounded p-2"><p className="text-muted-foreground">Stockout Risk</p><p className="font-semibold text-destructive">${demandPlan.summary?.potentialStockoutLoss?.toLocaleString()}</p></div>
              <div className="bg-muted/50 rounded p-2"><p className="text-muted-foreground">Actions</p><p className="font-semibold">{demandPlan.summary?.criticalActions}</p></div>
            </div>
            {expanded && demandPlan.recommendations?.slice(0, 2).map((rec, i) => (
              <div key={i} className="text-xs flex items-start gap-1"><TrendingUp className="h-3 w-3 text-primary mt-0.5" /><span>{rec.productName}: {rec.recommendedAction}</span></div>
            ))}
            {!expanded && <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setExpanded(true)}>Show details</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
