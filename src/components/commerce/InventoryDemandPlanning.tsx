import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Package,
  Calendar,
  ShoppingCart,
  Target,
} from "lucide-react";
import { InventoryItem, InventoryMovement } from "@/hooks/useInventorySync";
import { Campaign } from "@/hooks/useCampaigns";
import {
  calculateDemandPlanning,
  generateDemandTimeline,
  DemandPlanningResult,
} from "@/lib/inventoryForecasting";

interface InventoryDemandPlanningProps {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  campaigns: Campaign[];
}

export function InventoryDemandPlanning({
  inventory,
  movements,
  campaigns,
}: InventoryDemandPlanningProps) {
  const demandPlan = useMemo(
    () => calculateDemandPlanning(inventory, movements, campaigns, 30),
    [inventory, movements, campaigns]
  );

  const timeline = useMemo(
    () => generateDemandTimeline(inventory, movements, campaigns, 30),
    [inventory, movements, campaigns]
  );

  const summary = useMemo(() => {
    const critical = demandPlan.filter((d) => d.urgency === "critical").length;
    const high = demandPlan.filter((d) => d.urgency === "high").length;
    const totalShortfall = demandPlan.reduce((sum, d) => sum + d.shortfall, 0);
    const totalRestock = demandPlan.reduce(
      (sum, d) => sum + d.recommendedRestock,
      0
    );
    const scheduledCampaigns = campaigns.filter(
      (c) => c.status === "scheduled"
    ).length;

    return { critical, high, totalShortfall, totalRestock, scheduledCampaigns };
  }, [demandPlan, campaigns]);

  const getUrgencyColor = (urgency: DemandPlanningResult["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getUrgencyBg = (urgency: DemandPlanningResult["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "bg-destructive/10 border-destructive/30";
      case "high":
        return "bg-warning/10 border-warning/30";
      case "medium":
        return "bg-secondary/30 border-secondary";
      default:
        return "bg-muted/30 border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Critical Items</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{summary.critical}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">High Priority</span>
            </div>
            <p className="text-2xl font-bold text-warning">{summary.high}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Shortfall</span>
            </div>
            <p className="text-2xl font-bold text-primary">{summary.totalShortfall}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-accent-foreground" />
              <span className="text-xs text-muted-foreground">Restock Needed</span>
            </div>
            <p className="text-2xl font-bold">{summary.totalRestock}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Scheduled Campaigns</span>
            </div>
            <p className="text-2xl font-bold">{summary.scheduledCampaigns}</p>
          </CardContent>
        </Card>
      </div>

      {/* Demand Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            30-Day Demand & Stock Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="projectedStock"
                  name="Projected Stock"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="totalDemand"
                  name="Total Demand"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Demand Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Demand Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline.slice(0, 14)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="baselineDemand"
                  name="Baseline Demand"
                  fill="hsl(var(--muted-foreground))"
                  stackId="demand"
                />
                <Bar
                  dataKey="campaignDemand"
                  name="Campaign Demand"
                  fill="hsl(var(--primary))"
                  stackId="demand"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Planning Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Demand Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Baseline Demand</TableHead>
                <TableHead className="text-right">Campaign Demand</TableHead>
                <TableHead className="text-right">After Demand</TableHead>
                <TableHead className="text-right">Shortfall</TableHead>
                <TableHead className="text-right">Restock</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Affected Campaigns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandPlan.map((item) => (
                <TableRow
                  key={item.productId}
                  className={getUrgencyBg(item.urgency)}
                >
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-right">{item.currentStock}</TableCell>
                  <TableCell className="text-right">{item.projectedDemand}</TableCell>
                  <TableCell className="text-right">
                    {item.scheduledCampaignDemand > 0 ? (
                      <span className="text-primary font-medium">
                        +{item.scheduledCampaignDemand}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.stockAfterDemand < 0
                          ? "text-destructive font-medium"
                          : ""
                      }
                    >
                      {item.stockAfterDemand}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.shortfall > 0 ? (
                      <span className="text-destructive font-medium">
                        {item.shortfall}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.recommendedRestock > 0 ? (
                      <span className="text-primary font-medium">
                        {item.recommendedRestock}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getUrgencyColor(item.urgency)}>
                      {item.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.affectedCampaigns.slice(0, 2).map((name) => (
                        <Badge key={name} variant="outline" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                      {item.affectedCampaigns.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.affectedCampaigns.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Coverage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Coverage Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demandPlan.slice(0, 5).map((item) => {
              const coveragePercent = Math.min(
                100,
                (item.currentStock / Math.max(item.totalProjectedDemand, 1)) * 100
              );
              return (
                <div key={item.productId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(coveragePercent)}% coverage
                    </span>
                  </div>
                  <Progress
                    value={coveragePercent}
                    className={
                      coveragePercent < 50
                        ? "[&>div]:bg-destructive"
                        : coveragePercent < 80
                        ? "[&>div]:bg-warning"
                        : "[&>div]:bg-primary"
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Stock: {item.currentStock}</span>
                    <span>Demand: {item.totalProjectedDemand}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
