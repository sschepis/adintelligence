import { useMemo, useState, useCallback } from "react";
import { useCampaigns } from "./useCampaigns";
import { useUsageAnalytics } from "./useUsageAnalytics";
import { useBrand } from "@/contexts/BrandContext";
import { subDays, format, isWithinInterval, subWeeks, subMonths } from "date-fns";
import { DEFAULT_AVG_ORDER_VALUE } from "@/lib/dataIndicators";

interface PerformanceDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

interface PlatformData {
  name: string;
  value: number;
  color: string;
}

interface CampaignPerformance {
  name: string;
  roas: number;
  spend: number;
  revenue: number;
  status: string;
}

interface MetricWithTrend {
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
}

interface AnalyticsMetrics {
  totalRevenue: MetricWithTrend;
  totalSpend: MetricWithTrend;
  avgRoas: MetricWithTrend;
  totalImpressions: MetricWithTrend;
  totalClicks: MetricWithTrend;
  totalConversions: MetricWithTrend;
  clickRate: MetricWithTrend;
  conversionRate: MetricWithTrend;
}

const PLATFORM_COLORS: Record<string, string> = {
  meta: "hsl(var(--primary))",
  google: "hsl(var(--accent))",
  tiktok: "hsl(var(--signal-rising))",
  pinterest: "hsl(280, 70%, 50%)",
  instagram: "hsl(330, 80%, 55%)",
  facebook: "hsl(220, 80%, 55%)",
  other: "hsl(var(--muted-foreground))",
};

function calculateTrend(current: number, previous: number): MetricWithTrend {
  const change = current - previous;
  const changePercent = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
  
  return {
    value: current,
    previousValue: previous,
    change,
    changePercent,
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

export function useAnalyticsData(timeRange: string) {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { brands, activeBrand } = useBrand();
  
  // Brand filter state - null means "All Brands"
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  // Filter campaigns by selected brand
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    if (!selectedBrandId) return campaigns;
    return campaigns.filter(c => c.brand_id === selectedBrandId);
  }, [campaigns, selectedBrandId]);
  
  const handleBrandFilterChange = useCallback((brandId: string | null) => {
    setSelectedBrandId(brandId);
  }, []);
  
  // Calculate date range based on timeRange
  const { currentRange, previousRange } = useMemo(() => {
    const now = new Date();
    let currentFrom: Date;
    let previousFrom: Date;
    let previousTo: Date;
    
    switch (timeRange) {
      case "24h":
        currentFrom = subDays(now, 1);
        previousTo = currentFrom;
        previousFrom = subDays(previousTo, 1);
        break;
      case "7d":
        currentFrom = subDays(now, 7);
        previousTo = currentFrom;
        previousFrom = subWeeks(currentFrom, 1);
        break;
      case "30d":
        currentFrom = subDays(now, 30);
        previousTo = currentFrom;
        previousFrom = subMonths(currentFrom, 1);
        break;
      case "90d":
        currentFrom = subDays(now, 90);
        previousTo = currentFrom;
        previousFrom = subMonths(currentFrom, 3);
        break;
      default:
        currentFrom = subDays(now, 7);
        previousTo = currentFrom;
        previousFrom = subWeeks(currentFrom, 1);
    }
    
    return {
      currentRange: { from: currentFrom, to: now },
      previousRange: { from: previousFrom, to: previousTo },
    };
  }, [timeRange]);
  
  const { stats: usageStats, isLoading: usageLoading } = useUsageAnalytics(currentRange);

  // Filter campaigns by selected brand
  const campaignsForMetrics = useMemo(() => {
    if (!campaigns) return [];
    if (!selectedBrandId) return campaigns; // All brands
    return campaigns.filter(c => c.brand_id === selectedBrandId);
  }, [campaigns, selectedBrandId]);

  // Filter campaigns by date range
  const filterCampaignsByRange = (range: { from: Date; to: Date }) => {
    if (!campaignsForMetrics) return [];
    return campaignsForMetrics.filter((campaign) => {
      const createdAt = new Date(campaign.created_at);
      return isWithinInterval(createdAt, { start: range.from, end: range.to });
    });
  };

  // Calculate metrics from campaign data
  const calculateMetricsFromCampaigns = (campaignList: typeof campaigns) => {
    if (!campaignList || campaignList.length === 0) {
      return {
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgRoas: 0,
        clickRate: 0,
        conversionRate: 0,
      };
    }

    const totalSpend = campaignList.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalImpressions = campaignList.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = campaignList.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalConversions = campaignList.reduce((sum, c) => sum + (c.conversions || 0), 0);
    
    const avgOrderValue = DEFAULT_AVG_ORDER_VALUE;
    const totalRevenue = totalConversions * avgOrderValue;
    const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const clickRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      totalRevenue,
      avgRoas,
      clickRate,
      conversionRate,
    };
  };

  // Calculate metrics with trend comparison using actual previous-period data
  const metrics = useMemo<AnalyticsMetrics>(() => {
    const currentMetrics = calculateMetricsFromCampaigns(campaignsForMetrics);
    const previousCampaigns = filterCampaignsByRange(previousRange);
    const previousMetrics = calculateMetricsFromCampaigns(previousCampaigns);

    return {
      totalRevenue: calculateTrend(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
      totalSpend: calculateTrend(currentMetrics.totalSpend, previousMetrics.totalSpend),
      avgRoas: calculateTrend(currentMetrics.avgRoas, previousMetrics.avgRoas),
      totalImpressions: calculateTrend(currentMetrics.totalImpressions, previousMetrics.totalImpressions),
      totalClicks: calculateTrend(currentMetrics.totalClicks, previousMetrics.totalClicks),
      totalConversions: calculateTrend(currentMetrics.totalConversions, previousMetrics.totalConversions),
      clickRate: calculateTrend(currentMetrics.clickRate, previousMetrics.clickRate),
      conversionRate: calculateTrend(currentMetrics.conversionRate, previousMetrics.conversionRate),
    };
  }, [campaignsForMetrics, previousRange]);

  // Generate performance data over time from campaigns with comparison data
  const { performanceData, comparisonData } = useMemo<{ 
    performanceData: PerformanceDataPoint[]; 
    comparisonData: PerformanceDataPoint[];
  }>(() => {
    if (!campaignsForMetrics || campaignsForMetrics.length === 0) return { performanceData: [], comparisonData: [] };

    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const currentDataPoints: PerformanceDataPoint[] = [];
    const previousDataPoints: PerformanceDataPoint[] = [];

    const totalImpressions = campaignsForMetrics.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = campaignsForMetrics.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalConversions = campaignsForMetrics.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const totalSpend = campaignsForMetrics.reduce((sum, c) => sum + (c.spent || 0), 0);

    // Count campaigns per day for weighted distribution
    const dayCounts: Record<string, number> = {};
    campaignsForMetrics.forEach((c) => {
      const d = format(new Date(c.created_at), days <= 7 ? "EEE" : "MMM d");
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });

    const previousCampaigns = filterCampaignsByRange(previousRange);
    const prevTotalImpressions = previousCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const prevTotalClicks = previousCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const prevTotalConversions = previousCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const prevTotalSpend = previousCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, days <= 7 ? "EEE" : "MMM d");

      const dayFactor = 1 / days;

      currentDataPoints.push({
        date: dateStr,
        impressions: Math.round(totalImpressions * dayFactor),
        clicks: Math.round(totalClicks * dayFactor),
        conversions: Math.round(totalConversions * dayFactor),
        spend: Math.round(totalSpend * dayFactor),
      });

      previousDataPoints.push({
        date: dateStr,
        impressions: Math.round(prevTotalImpressions * dayFactor),
        clicks: Math.round(prevTotalClicks * dayFactor),
        conversions: Math.round(prevTotalConversions * dayFactor),
        spend: Math.round(prevTotalSpend * dayFactor),
      });
    }

    return { performanceData: currentDataPoints, comparisonData: previousDataPoints };
  }, [campaignsForMetrics, timeRange]);

  // Calculate platform distribution from filtered campaigns
  const platformData = useMemo<PlatformData[]>(() => {
    if (!campaignsForMetrics || campaignsForMetrics.length === 0) return [];

    const platformSpend: Record<string, number> = {};
    let totalSpend = 0;

    campaignsForMetrics.forEach((campaign) => {
      const platform = (campaign.platform || "other").toLowerCase();
      const spend = campaign.spent || 0;
      platformSpend[platform] = (platformSpend[platform] || 0) + spend;
      totalSpend += spend;
    });

    if (totalSpend === 0) return [];

    return Object.entries(platformSpend)
      .map(([name, spend]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((spend / totalSpend) * 100),
        color: PLATFORM_COLORS[name] || PLATFORM_COLORS.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [campaignsForMetrics]);

  // Get campaign performance data
  const campaignPerformance = useMemo<CampaignPerformance[]>(() => {
    if (!campaignsForMetrics || campaignsForMetrics.length === 0) return [];

    return campaignsForMetrics.map((campaign) => {
      const spend = campaign.spent || 0;
      const conversions = campaign.conversions || 0;
      const avgOrderValue = DEFAULT_AVG_ORDER_VALUE;
      const revenue = conversions * avgOrderValue;
      const roas = spend > 0 ? revenue / spend : 0;

      return {
        name: campaign.name,
        roas: Math.round(roas * 10) / 10,
        spend,
        revenue,
        status: campaign.status,
      };
    }).sort((a, b) => b.roas - a.roas);
  }, [campaignsForMetrics]);

  const activeCampaignCount = campaignsForMetrics?.filter(c => c.status === "active").length || 0;

  // Get comparison period label
  const comparisonLabel = useMemo(() => {
    switch (timeRange) {
      case "24h": return "vs previous day";
      case "7d": return "vs previous week";
      case "30d": return "vs previous month";
      case "90d": return "vs previous quarter";
      default: return "vs previous period";
    }
  }, [timeRange]);

  return {
    metrics,
    performanceData,
    comparisonData,
    platformData,
    campaignPerformance,
    activeCampaignCount,
    usageStats,
    comparisonLabel,
    isLoading: campaignsLoading || usageLoading,
    // Brand filtering
    brands,
    activeBrand,
    selectedBrandId,
    onBrandFilterChange: handleBrandFilterChange,
    // Cross-brand data
    allCampaigns: campaigns || [],
  };
}
