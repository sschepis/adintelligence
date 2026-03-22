import { useState } from "react";
import { PageContainer, GlassBoxAssistant, NotificationCenter } from "@/components/shared";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonMetric, SkeletonChart } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Minus,
  DollarSign, 
  Users, 
  Eye,
  MousePointerClick,
  ShoppingCart,
  Download,
  RefreshCw,
  Calendar,
  AlertCircle,
  Layers,
  Building2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { CrossBrandReport } from "@/components/analytics/CrossBrandReport";
import { SocialChannelGrowth } from "@/components/analytics/SocialChannelGrowth";
import { SearchVolumeChart } from "@/components/analytics/SearchVolumeChart";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  const {
    metrics,
    performanceData,
    comparisonData,
    platformData,
    campaignPerformance,
    activeCampaignCount,
    comparisonLabel,
    isLoading,
    brands,
    activeBrand,
    selectedBrandId,
    onBrandFilterChange,
    allCampaigns,
  } = useAnalyticsData(timeRange);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatChange = (changePercent: number, isPercentMetric: boolean = false): string => {
    const sign = changePercent >= 0 ? "+" : "";
    if (isPercentMetric) {
      return `${sign}${changePercent.toFixed(1)}pp`;
    }
    return `${sign}${changePercent.toFixed(1)}%`;
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "neutral" }) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const metricCards = [
    { 
      label: "Total Revenue", 
      metric: metrics.totalRevenue,
      format: (v: number) => formatCurrency(v),
      icon: DollarSign,
      color: "text-primary",
      positiveIsGood: true,
    },
    { 
      label: "Total Spend", 
      metric: metrics.totalSpend,
      format: (v: number) => formatCurrency(v),
      icon: ShoppingCart,
      color: "text-accent",
      positiveIsGood: false, // Higher spend might not be good
    },
    { 
      label: "Avg. ROAS", 
      metric: metrics.avgRoas,
      format: (v: number) => `${v.toFixed(1)}x`,
      icon: TrendingUp,
      color: "text-signal-rising",
      positiveIsGood: true,
    },
    { 
      label: "Total Impressions", 
      metric: metrics.totalImpressions,
      format: (v: number) => formatNumber(v),
      icon: Eye,
      color: "text-muted-foreground",
      positiveIsGood: true,
    },
    { 
      label: "Click Rate", 
      metric: metrics.clickRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      icon: MousePointerClick,
      color: "text-primary",
      positiveIsGood: true,
      isPercentMetric: true,
    },
    { 
      label: "Conversion Rate", 
      metric: metrics.conversionRate,
      format: (v: number) => `${v.toFixed(1)}%`,
      icon: Users,
      color: "text-accent",
      positiveIsGood: true,
      isPercentMetric: true,
    },
  ];

  const hasData = campaignPerformance.length > 0;

  return (
    <PageContainer>
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time performance metrics • {comparisonLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Brand Filter */}
            {brands && brands.length > 1 && (
              <Select 
                value={selectedBrandId || "all"} 
                onValueChange={(val) => onBrandFilterChange(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-40 bg-secondary/50">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-secondary/50">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="glass" 
              size="sm" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="glass" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <NotificationCenter />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonMetric key={index} />
          ))
        ) : (
          metricCards.map((card, index) => {
            const isPositive = card.metric.trend === "up";
            const isNeutral = card.metric.trend === "neutral";
            const showGreen = card.positiveIsGood ? isPositive : !isPositive && !isNeutral;
            const showRed = card.positiveIsGood ? !isPositive && !isNeutral : isPositive;
            
            return (
              <div
                key={card.label}
                className="glass-card rounded-xl p-4 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <card.icon className={cn("h-5 w-5", card.color)} />
                  {card.metric.value > 0 && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs gap-1",
                        isNeutral && "text-muted-foreground border-muted-foreground/30",
                        showGreen && "text-signal-rising border-signal-rising/30",
                        showRed && "text-destructive border-destructive/30"
                      )}
                    >
                      <TrendIcon trend={card.metric.trend} />
                      {formatChange(card.metric.changePercent, card.isPercentMetric)}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-display font-bold">{card.format(card.metric.value)}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </div>
            );
          })
        )}
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Performance Over Time with Comparison */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Performance Over Time</h3>
            <div className="flex items-center gap-4">
              <Button
                variant={showComparison ? "default" : "outline"}
                size="sm"
                className="gap-2 text-xs"
                onClick={() => setShowComparison(!showComparison)}
              >
                <Layers className="h-3.5 w-3.5" />
                {showComparison ? "Hide Comparison" : "Compare Periods"}
              </Button>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Impressions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Conversions</span>
                </div>
                {showComparison && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary/40 border border-primary border-dashed" />
                      <span className="text-muted-foreground">Prev Impressions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-accent/40 border border-accent border-dashed" />
                      <span className="text-muted-foreground">Prev Conversions</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="h-64">
            {isLoading ? (
              <SkeletonChart />
            ) : performanceData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm">No performance data available</p>
                <p className="text-xs">Create campaigns to see analytics</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData.map((current, i) => ({
                  ...current,
                  prevImpressions: comparisonData[i]?.impressions || 0,
                  prevConversions: comparisonData[i]?.conversions || 0,
                }))}>
                  <defs>
                    <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="prevImpressionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number, name: string) => {
                      const labelMap: Record<string, string> = {
                        impressions: "Current Impressions",
                        conversions: "Current Conversions",
                        prevImpressions: "Previous Impressions",
                        prevConversions: "Previous Conversions",
                      };
                      return [value.toLocaleString(), labelMap[name] || name];
                    }}
                  />
                  {/* Previous period data (shown behind) */}
                  {showComparison && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="prevImpressions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#prevImpressionsGradient)"
                      />
                      <Line
                        type="monotone"
                        dataKey="prevConversions"
                        stroke="hsl(var(--accent))"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        opacity={0.5}
                      />
                    </>
                  )}
                  {/* Current period data (shown in front) */}
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#impressionsGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: "250ms" }}>
          <h3 className="font-display font-bold text-lg mb-4">Spend by Platform</h3>
          <div className="h-48">
            {isLoading ? (
              <SkeletonChart />
            ) : platformData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No platform data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {platformData.length > 0 && (
            <div className="space-y-2 mt-2">
              {platformData.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: platform.color }}
                    />
                    <span>{platform.name}</span>
                  </div>
                  <span className="font-medium">{platform.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Social & Search Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SocialChannelGrowth className="animate-slide-up" />
        <SearchVolumeChart className="animate-slide-up" />
      </div>

      {/* Campaign Performance Table */}
      <div className="glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Campaign Performance</h3>
          <Badge variant="outline">
            {activeCampaignCount} active campaign{activeCampaignCount !== 1 ? "s" : ""}
          </Badge>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : campaignPerformance.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No campaigns yet</p>
            <p className="text-xs">Create your first campaign to see performance data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Spend</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">ROAS</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaignPerformance.map((campaign) => (
                  <tr key={campaign.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium">{campaign.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      ${campaign.spend.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${campaign.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={cn(
                        "font-bold",
                        campaign.roas >= 4 ? "text-signal-rising" : campaign.roas >= 3 ? "text-accent" : "text-muted-foreground"
                      )}>
                        {campaign.roas}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cross-Brand Report */}
      {brands && brands.length > 1 && (
        <CrossBrandReport 
          brands={brands} 
          campaigns={allCampaigns} 
          isLoading={isLoading} 
        />
      )}

      <GlassBoxAssistant />
    </PageContainer>
  );
};

export default Analytics;
