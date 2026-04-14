import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, AlertTriangle, Target, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { RevenueForecastResult } from "@/hooks/usePredictiveIntelligence";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueForecastPanelProps {
  savedTrends: Array<{ id: string; trend_name: string }>;
  inventory: Array<{ name: string; stock: number; price?: number; category?: string }>;
  forecast: RevenueForecastResult | null;
  isLoading: boolean;
  onForecast: (matches: Array<{ trendName: string; matchScore: number; products: Array<{ name: string; price?: number; stock?: number }> }>, weeks: number) => void;
}

export function RevenueForecastPanel({ savedTrends, inventory, forecast, isLoading, onForecast }: RevenueForecastPanelProps) {
  const [timeframe, setTimeframe] = useState("4");
  const [expandedTrend, setExpandedTrend] = useState<string | null>(null);

  const handleForecast = () => {
    // Build trend-product matches from actual inventory data
    const matches = savedTrends.slice(0, 5).map((trend) => {
      // Find products whose category or name relate to this trend
      const matchingProducts = inventory
        .filter(p =>
          p.category?.toLowerCase().includes(trend.trend_name.toLowerCase().split(' ')[0]) ||
          p.name.toLowerCase().includes(trend.trend_name.toLowerCase().split(' ')[0])
        )
        .slice(0, 3);

      const productsToUse = matchingProducts.length > 0 ? matchingProducts : inventory.slice(0, 3);

      return {
        trendName: trend.trend_name,
        matchScore: matchingProducts.length > 0 ? 75 : 50,
        products: productsToUse.map(p => ({
          name: p.name,
          price: p.price,
          stock: p.stock,
        })),
      };
    });

    onForecast(matches, parseInt(timeframe));
  };

  if (savedTrends.length === 0 || inventory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Data Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {savedTrends.length === 0 
              ? "Save trends from Signal Intelligence to forecast revenue." 
              : "Add products to your brand catalog to forecast revenue."}
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
                <DollarSign className="h-5 w-5 text-primary" />
                Revenue Forecast
              </CardTitle>
              <CardDescription>
                AI projects revenue based on trend alignment, inventory levels, and market patterns
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 weeks</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleForecast} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Forecasting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Forecast
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      )}

      {forecast && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Projected Revenue (Moderate)</div>
                <div className="text-3xl font-bold text-emerald-600">
                  ${forecast.summary.totalProjectedRevenue.moderate.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Range: ${forecast.summary.totalProjectedRevenue.conservative.toLocaleString()} - ${forecast.summary.totalProjectedRevenue.optimistic.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <div className="text-sm text-muted-foreground">Top Opportunity</div>
                </div>
                <div className="font-semibold mt-2">{forecast.summary.topOpportunity}</div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <div className="text-sm text-muted-foreground">Biggest Risk</div>
                </div>
                <div className="font-semibold mt-2">{forecast.summary.biggestRisk}</div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Revenue Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.weeklyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" tickFormatter={(v) => `Week ${v}`} className="text-xs" />
                    <YAxis tickFormatter={(v) => `$${v}`} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      labelFormatter={(label) => `Week ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue.conservative" 
                      name="Conservative"
                      stroke="hsl(var(--muted-foreground))" 
                      fill="hsl(var(--muted))" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue.moderate" 
                      name="Moderate"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.5}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue.optimistic" 
                      name="Optimistic"
                      stroke="hsl(142, 76%, 36%)" 
                      fill="hsl(142, 76%, 36%)" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trend Forecasts */}
          <div className="space-y-3">
            {forecast.forecasts.map((f, i) => (
              <Card key={i}>
                <CardHeader 
                  className="cursor-pointer py-4"
                  onClick={() => setExpandedTrend(expandedTrend === f.trendName ? null : f.trendName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{f.trendName}</CardTitle>
                      <Badge variant="secondary">Peak Week {f.peakWeek}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">${f.totalRevenue.moderate.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">projected</div>
                      </div>
                      {expandedTrend === f.trendName ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {expandedTrend === f.trendName && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="grid gap-3">
                        {f.products.map((p, j) => (
                          <div key={j} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {p.projectedUnits.moderate} units projected
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${p.projectedRevenue.moderate.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{p.confidenceScore}% confidence</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {f.riskFactors.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {f.riskFactors.map((risk, k) => (
                            <Badge key={k} variant="outline" className="text-xs">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
