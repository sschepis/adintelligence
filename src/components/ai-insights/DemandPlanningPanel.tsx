import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, AlertTriangle, TrendingUp, Loader2, ArrowUp, ArrowDown, Minus, XCircle } from "lucide-react";
import { DemandPlanResult, DemandRecommendation, DemandAlert } from "@/hooks/usePredictiveIntelligence";

interface DemandPlanningPanelProps {
  inventory: Array<{ name: string; stock: number; price?: number; category?: string }>;
  trends: Array<{ name: string; velocity?: string; volume?: string }>;
  demandPlan: DemandPlanResult | null;
  isLoading: boolean;
  onPlanDemand: (
    inventory: Array<{ name: string; stock: number; price?: number; category?: string }>,
    trends: Array<{ name: string; velocity?: string; volume?: string }>,
    leadTime: number
  ) => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  reorder: <ArrowUp className="h-4 w-4 text-emerald-600" />,
  reduce: <ArrowDown className="h-4 w-4 text-amber-600" />,
  hold: <Minus className="h-4 w-4 text-slate-600" />,
  discontinue: <XCircle className="h-4 w-4 text-red-600" />,
};

const urgencyColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-700 border-red-500/30",
  high: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  medium: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  low: "bg-slate-500/20 text-slate-700 border-slate-500/30",
};

const alertTypeColors: Record<string, string> = {
  stockout: "border-red-500/30 bg-red-500/5",
  overstock: "border-amber-500/30 bg-amber-500/5",
  opportunity: "border-emerald-500/30 bg-emerald-500/5",
  trend_mismatch: "border-blue-500/30 bg-blue-500/5",
};

function AlertCard({ alert }: { alert: DemandAlert }) {
  return (
    <Card className={alertTypeColors[alert.type]}>
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-4 w-4 mt-0.5 ${
            alert.severity === 'critical' ? 'text-red-600' : 
            alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
          }`} />
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium">{alert.message}</div>
            <div className="flex flex-wrap gap-1">
              {alert.affectedProducts.map((product, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationRow({ rec }: { rec: DemandRecommendation }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {actionIcons[rec.recommendedAction]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{rec.productName}</span>
          <Badge variant="outline" className={urgencyColors[rec.urgency]}>
            {rec.urgency}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground truncate">{rec.reasoning}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm">
          <span className="text-muted-foreground">Stock:</span>{" "}
          <span className="font-medium">{rec.currentStock}</span>
        </div>
        {rec.recommendedAction === 'reorder' && (
          <div className="text-sm text-emerald-600 font-medium">
            +{rec.quantity} units
          </div>
        )}
        {rec.recommendedAction === 'reduce' && (
          <div className="text-sm text-amber-600 font-medium">
            -{rec.quantity} units
          </div>
        )}
      </div>
      <div className="text-right shrink-0 w-24">
        <div className="text-xs text-muted-foreground">Stockout Risk</div>
        <div className={`font-semibold ${rec.stockoutRisk.probability > 70 ? 'text-red-600' : rec.stockoutRisk.probability > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {rec.stockoutRisk.days} days / {rec.stockoutRisk.probability}%
        </div>
      </div>
    </div>
  );
}

export function DemandPlanningPanel({ inventory, trends, demandPlan, isLoading, onPlanDemand }: DemandPlanningPanelProps) {
  const [leadTime, setLeadTime] = useState(14);

  if (inventory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Inventory Data</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Add products to your brand catalog to get AI-powered demand planning recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Demand Planning
              </CardTitle>
              <CardDescription>
                AI analyzes inventory against trends to recommend optimal stock levels and reorder timing
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="leadTime" className="text-sm whitespace-nowrap">Lead Time:</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={leadTime}
                  onChange={(e) => setLeadTime(parseInt(e.target.value) || 14)}
                  className="w-20"
                  min={1}
                  max={90}
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <Button onClick={() => onPlanDemand(inventory, trends, leadTime)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Planning...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Plan Demand
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      )}

      {demandPlan && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className={demandPlan.summary.criticalActions > 0 ? "border-red-500/30 bg-red-500/5" : ""}>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Critical Actions</div>
                <div className={`text-3xl font-bold ${demandPlan.summary.criticalActions > 0 ? 'text-red-600' : ''}`}>
                  {demandPlan.summary.criticalActions}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Reorder Value</div>
                <div className="text-3xl font-bold">
                  ${demandPlan.summary.totalReorderValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Potential Stockout Loss</div>
                <div className="text-3xl font-bold text-amber-600">
                  ${demandPlan.summary.potentialStockoutLoss.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Trend Alignment</div>
                <div className="text-3xl font-bold">{demandPlan.summary.trendAlignmentScore}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {demandPlan.alerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Alerts</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {demandPlan.alerts.map((alert, i) => (
                  <AlertCard key={i} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Recommendations ({demandPlan.recommendations.length})
            </h3>
            <div className="space-y-2">
              {demandPlan.recommendations.map((rec, i) => (
                <RecommendationRow key={i} rec={rec} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
