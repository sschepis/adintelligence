import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  MousePointer, 
  Eye,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Campaign } from "@/hooks/useCampaigns";
import { cn } from "@/lib/utils";

interface CampaignPerformanceDashboardProps {
  campaigns: Campaign[];
  loading?: boolean;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(160 84% 45%)", "hsl(280 60% 65%)"];

export function CampaignPerformanceDashboard({ campaigns, loading }: CampaignPerformanceDashboardProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalBudget = campaigns.reduce((sum, c) => sum + c.total_budget, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const cpa = totalConversions > 0 ? totalSpent / totalConversions : 0;
    const roas = totalSpent > 0 ? (totalConversions * 50) / totalSpent : 0; // Assume $50 avg order value

    return {
      totalSpent,
      totalBudget,
      totalImpressions,
      totalClicks,
      totalConversions,
      ctr,
      conversionRate,
      cpc,
      cpa,
      roas,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  }, [campaigns]);

  // Generate performance trend data
  const trendData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dayFactor = 0.8 + Math.random() * 0.4;
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        impressions: Math.floor((metrics.totalImpressions / days) * dayFactor),
        clicks: Math.floor((metrics.totalClicks / days) * dayFactor),
        conversions: Math.floor((metrics.totalConversions / days) * dayFactor),
        spend: Math.floor((metrics.totalSpent / days) * dayFactor),
      };
    });
  }, [metrics, timeRange]);

  // Platform breakdown
  const platformData = useMemo(() => {
    const byPlatform = campaigns.reduce((acc, c) => {
      const platform = c.platform || "Unknown";
      if (!acc[platform]) {
        acc[platform] = { spend: 0, conversions: 0, impressions: 0 };
      }
      acc[platform].spend += c.spent;
      acc[platform].conversions += c.conversions;
      acc[platform].impressions += c.impressions;
      return acc;
    }, {} as Record<string, { spend: number; conversions: number; impressions: number }>);

    return Object.entries(byPlatform).map(([name, data]) => ({
      name,
      value: data.spend,
      conversions: data.conversions,
    }));
  }, [campaigns]);

  // Campaign performance ranking
  const rankedCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, 5);
  }, [campaigns]);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon,
    format = "number",
  }: { 
    title: string; 
    value: number; 
    change?: number;
    icon: any;
    format?: "number" | "currency" | "percent";
  }) => {
    const formattedValue = format === "currency" 
      ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString(undefined, { maximumFractionDigits: 0 });

    const isPositive = (change || 0) >= 0;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{title}</span>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-display font-bold">{formattedValue}</span>
            {change !== undefined && (
              <span className={cn(
                "text-xs flex items-center gap-0.5",
                isPositive ? "text-signal-rising" : "text-destructive"
              )}>
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 h-24 animate-pulse bg-secondary/30" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">Performance Overview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === "7d" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("7d")}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === "30d" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("30d")}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === "90d" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("90d")}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Spend" value={metrics.totalSpent} change={12.5} icon={DollarSign} format="currency" />
        <MetricCard title="Impressions" value={metrics.totalImpressions} change={8.2} icon={Eye} />
        <MetricCard title="Clicks" value={metrics.totalClicks} change={15.3} icon={MousePointer} />
        <MetricCard title="Conversions" value={metrics.totalConversions} change={22.1} icon={Target} />
      </div>

      {/* ROI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="CTR" value={metrics.ctr} icon={TrendingUp} format="percent" />
        <MetricCard title="Conversion Rate" value={metrics.conversionRate} icon={Target} format="percent" />
        <MetricCard title="CPC" value={metrics.cpc} icon={DollarSign} format="currency" />
        <MetricCard title="ROAS" value={metrics.roas} change={5.4} icon={TrendingUp} format="percent" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160 84% 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(160 84% 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorImpressions)"
                    name="Impressions"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="hsl(160 84% 45%)" 
                    fill="url(#colorConversions)"
                    name="Conversions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spend by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              {platformData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full text-center text-muted-foreground">
                  No platform data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {rankedCampaigns.length > 0 ? (
            <div className="space-y-3">
              {rankedCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-amber-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-700 text-white" :
                      "bg-secondary text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">{campaign.platform || "Multi-platform"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-medium">{campaign.conversions} conv</p>
                      <p className="text-xs text-muted-foreground">${campaign.spent.toLocaleString()} spent</p>
                    </div>
                    <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                      {campaign.performance_score}% score
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                ${metrics.totalSpent.toLocaleString()} of ${metrics.totalBudget.toLocaleString()}
              </span>
              <span className="font-medium">{metrics.budgetUtilization.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.budgetUtilization} className="h-3" />
            <p className="text-xs text-muted-foreground">
              ${(metrics.totalBudget - metrics.totalSpent).toLocaleString()} remaining
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
