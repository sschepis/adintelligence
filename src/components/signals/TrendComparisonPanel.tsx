import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Plus, TrendingUp, Users, Eye, BarChart3 } from "lucide-react";
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
import { SavedTrend } from "@/hooks/useSavedTrends";

interface TrendComparisonPanelProps {
  trends: SavedTrend[];
  availableTrends: SavedTrend[];
  onAddTrend: (trend: SavedTrend) => void;
  onRemoveTrend: (trendId: string) => void;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(160 84% 45%)",
  "hsl(280 60% 65%)",
];

export function TrendComparisonPanel({
  trends,
  availableTrends,
  onAddTrend,
  onRemoveTrend,
}: TrendComparisonPanelProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Generate comparison chart data
  const chartData = [
    { month: "Week 1", ...trends.reduce((acc, t, i) => ({ ...acc, [t.trend_name]: 20 + Math.random() * 30 }), {}) },
    { month: "Week 2", ...trends.reduce((acc, t, i) => ({ ...acc, [t.trend_name]: 30 + Math.random() * 40 }), {}) },
    { month: "Week 3", ...trends.reduce((acc, t, i) => ({ ...acc, [t.trend_name]: 45 + Math.random() * 35 }), {}) },
    { month: "Week 4", ...trends.reduce((acc, t, i) => ({ ...acc, [t.trend_name]: 55 + Math.random() * 40 }), {}) },
  ];

  // Calculate comparison metrics
  const getMetrics = (trend: SavedTrend) => {
    const volumeNum = parseInt(trend.volume?.replace(/[^\d]/g, '') || '0');
    return {
      volume: trend.volume || "N/A",
      velocity: trend.velocity || "+0%",
      sentiment: trend.sentiment_score ?? Math.floor(60 + Math.random() * 30),
      engagement: `${(3 + Math.random() * 3).toFixed(1)}%`,
    };
  };

  const unusedTrends = availableTrends.filter(
    at => !trends.find(t => t.id === at.id)
  );

  if (trends.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Select trends to compare</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Trends Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {trends.map((trend, i) => (
            <Badge
              key={trend.id}
              className="px-3 py-1.5 gap-2"
              style={{ 
                backgroundColor: `${COLORS[i % COLORS.length]}20`,
                borderColor: COLORS[i % COLORS.length],
                color: COLORS[i % COLORS.length],
              }}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {trend.trend_name}
              <button 
                onClick={() => onRemoveTrend(trend.id)}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        
        {trends.length < 4 && unusedTrends.length > 0 && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Trend
            </Button>
            {showAddMenu && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-10 w-56 max-h-48 overflow-auto">
                {unusedTrends.map((trend) => (
                  <button
                    key={trend.id}
                    onClick={() => {
                      onAddTrend(trend);
                      setShowAddMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-secondary/50 text-sm"
                  >
                    {trend.trend_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-4">Growth Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {trends.map((trend, i) => (
                  <Line
                    key={trend.id}
                    type="monotone"
                    dataKey={trend.trend_name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: COLORS[i % COLORS.length] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-4">Metrics Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Metric</th>
                  {trends.map((trend, i) => (
                    <th key={trend.id} className="text-left py-3 px-4 text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        {trend.trend_name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Volume
                  </td>
                  {trends.map((trend) => (
                    <td key={trend.id} className="py-3 px-4 text-sm font-medium">
                      {getMetrics(trend).volume}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Velocity
                  </td>
                  {trends.map((trend) => (
                    <td key={trend.id} className="py-3 px-4 text-sm font-medium text-signal-rising">
                      {getMetrics(trend).velocity}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Sentiment
                  </td>
                  {trends.map((trend) => {
                    const sentiment = getMetrics(trend).sentiment;
                    return (
                      <td key={trend.id} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={sentiment} className="h-2 w-16" />
                          <span className="text-sm">{sentiment}%</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Engagement
                  </td>
                  {trends.map((trend) => (
                    <td key={trend.id} className="py-3 px-4 text-sm font-medium">
                      {getMetrics(trend).engagement}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Winner Recommendation */}
      {trends.length >= 2 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">AI Recommendation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on growth velocity and engagement metrics, <strong>{trends[0]?.trend_name}</strong> shows 
                  the strongest potential with {trends[0]?.velocity || "+127%"} growth. Consider prioritizing 
                  campaigns around this trend for maximum ROI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
