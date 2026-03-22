import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Calendar,
  Package,
  Activity,
} from "lucide-react";
import { InventoryItem, InventoryMovement } from "@/hooks/useInventorySync";
import { Campaign } from "@/hooks/useCampaigns";
import { calculateForecast, generateForecastChartData, ForecastResult } from "@/lib/inventoryForecasting";
import { format } from "date-fns";

interface InventoryForecastProps {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  campaigns: Campaign[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--signal-rising))",
  "hsl(350, 85%, 55%)",
  "hsl(200, 70%, 50%)",
];

export function InventoryForecast({ inventory, movements, campaigns }: InventoryForecastProps) {
  const forecasts = useMemo(
    () => calculateForecast(inventory, movements, campaigns),
    [inventory, movements, campaigns]
  );

  const chartData = useMemo(
    () => generateForecastChartData(forecasts, 14),
    [forecasts]
  );

  const criticalItems = forecasts.filter(f => f.riskLevel === "critical");
  const warningItems = forecasts.filter(f => f.riskLevel === "warning");

  const getRiskBadge = (risk: ForecastResult["riskLevel"]) => {
    switch (risk) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Warning</Badge>;
      default:
        return <Badge variant="secondary">Safe</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: ForecastResult["confidence"]) => {
    switch (confidence) {
      case "high":
        return <Badge variant="outline" className="text-signal-rising border-signal-rising/30">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-amber-500 border-amber-500/30">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      {(criticalItems.length > 0 || warningItems.length > 0) && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Inventory Alerts</p>
                <p className="text-sm text-muted-foreground">
                  {criticalItems.length} products at critical risk, {warningItems.length} need attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Risk</p>
                <p className="text-xl font-bold">{criticalItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warning Level</p>
                <p className="text-xl font-bold">{warningItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-signal-rising/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-signal-rising" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Safe Stock</p>
                <p className="text-xl font-bold">{forecasts.filter(f => f.riskLevel === "safe").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Usage</p>
                <p className="text-xl font-bold">
                  {Math.round(forecasts.reduce((sum, f) => sum + f.averageDailyUsage, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            14-Day Stock Level Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 && forecasts.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  {forecasts.slice(0, 5).map((forecast, idx) => (
                    <Line
                      key={forecast.productId}
                      type="monotone"
                      dataKey={forecast.productName}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              No forecast data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Stockout Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecasts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {forecasts.map((forecast) => (
                <div
                  key={forecast.productId}
                  className={`p-4 rounded-xl border ${
                    forecast.riskLevel === "critical"
                      ? "border-destructive/50 bg-destructive/5"
                      : forecast.riskLevel === "warning"
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-border bg-secondary/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{forecast.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRiskBadge(forecast.riskLevel)}
                        {getConfidenceBadge(forecast.confidence)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{forecast.currentStock}</p>
                      <p className="text-xs text-muted-foreground">units available</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily Usage</p>
                      <p className="font-medium">{forecast.averageDailyUsage} units/day</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Until Stockout</p>
                      <p className="font-medium">
                        {forecast.daysUntilStockout !== null
                          ? `${forecast.daysUntilStockout} days`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Predicted Stockout</p>
                      <p className="font-medium">
                        {forecast.predictedStockoutDate
                          ? format(forecast.predictedStockoutDate, "MMM dd, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reorder By</p>
                      <p className="font-medium">
                        {forecast.recommendedReorderDate
                          ? format(forecast.recommendedReorderDate, "MMM dd")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {forecast.linkedCampaigns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Linked Campaigns:</p>
                      <div className="flex flex-wrap gap-1">
                        {forecast.linkedCampaigns.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Level Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Stock Level</span>
                      <span>{Math.round((forecast.currentStock / (forecast.currentStock + (forecast.averageDailyUsage * 14))) * 100)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (forecast.currentStock / (forecast.currentStock + (forecast.averageDailyUsage * 14))) * 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No inventory data available for forecasting
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
