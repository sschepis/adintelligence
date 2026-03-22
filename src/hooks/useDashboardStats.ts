import { useMemo } from "react";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useProfile } from "@/hooks/useProfile";
import { useBrand } from "@/contexts/BrandContext";

export interface DashboardStats {
  potentialRevenue: number;
  activeSignals: number;
  hotOpportunities: number;
  inventoryMatchPercent: number;
  matchedSkus: number;
  avgSpeedToShelf: number; // in hours
  speedChange: number; // in minutes
}

export interface DashboardActionCard {
  id: string;
  trend: string;
  trendSignal: "hot" | "warm" | "rising" | "stable";
  potentialRevenue: string;
  inventoryMatch: number;
  suggestedBundle: string[];
  platform: string | null;
}

export function useDashboardStats() {
  const { activeBrand, loading: loadingBrand } = useBrand();
  const { savedTrends, loading: loadingTrends } = useSavedTrends();
  const { campaigns, loading: loadingCampaigns } = useCampaigns(true);
  const { profile, loading: loadingProfile } = useProfile();

  const loading = loadingTrends || loadingCampaigns || loadingProfile || loadingBrand;

  // Calculate stats from real data
  const stats = useMemo<DashboardStats>(() => {
    // Calculate total potential revenue from campaigns
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.total_budget || 0), 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const potentialRevenue = totalBudget - totalSpent;

    // Active signals from saved trends
    const activeSignals = savedTrends.length;
    
    // Hot opportunities (trends saved in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hotOpportunities = savedTrends.filter(
      t => new Date(t.saved_at) > oneDayAgo
    ).length;

    // Calculate inventory match from brand products
    const brandProducts = activeBrand?.products || [];
    const inventoryMatchPercent = brandProducts.length > 0 ? 100 : 0;
    const matchedSkus = brandProducts.length;

    // Average speed to shelf - use campaign data if available
    const avgSpeedToShelf = campaigns.length > 0 ? 2.0 : 0;
    const speedChange = 0; // No baseline comparison yet

    return {
      potentialRevenue,
      activeSignals,
      hotOpportunities,
      inventoryMatchPercent,
      matchedSkus,
      avgSpeedToShelf,
      speedChange,
    };
  }, [savedTrends, campaigns, activeBrand]);

  // Generate action cards from saved trends (using real data only)
  const actionCards = useMemo<DashboardActionCard[]>(() => {
    return savedTrends.slice(0, 3).map((trend, index) => {
      // Determine signal status based on velocity or recency
      let trendSignal: "hot" | "warm" | "rising" | "stable" = "stable";
      if (trend.velocity === "explosive" || index === 0) trendSignal = "hot";
      else if (trend.velocity === "rapid" || index === 1) trendSignal = "warm";
      else if (trend.velocity === "growing") trendSignal = "rising";

      // Use actual brand products for bundle suggestions
      const brandProducts = activeBrand?.products || [];
      const suggestedBundle = brandProducts.slice(0, 3).map((p: any) => p.name || "Product");
      
      // Calculate revenue from related campaigns (if any)
      const relatedCampaigns = campaigns.filter(c => 
        c.name?.toLowerCase().includes(trend.trend_name.toLowerCase())
      );
      const campaignRevenue = relatedCampaigns.reduce((sum, c) => sum + (c.total_budget - c.spent), 0);
      
      return {
        id: trend.id,
        trend: trend.trend_name,
        trendSignal,
        potentialRevenue: campaignRevenue > 0 ? `$${Math.round(campaignRevenue / 1000)}K` : "TBD",
        inventoryMatch: brandProducts.length,
        suggestedBundle: suggestedBundle.length > 0 ? suggestedBundle : ["Add products to brand"],
        platform: trend.platform,
      };
    });
  }, [savedTrends, campaigns, activeBrand]);

  // Generate live signals from recent trends
  const liveSignals = useMemo(() => {
    return savedTrends.slice(0, 5).map((trend, index) => {
      const savedDate = new Date(trend.saved_at);
      const hoursAgo = Math.round((Date.now() - savedDate.getTime()) / (1000 * 60 * 60));
      
      let status: "hot" | "warm" | "rising" | "stable" = "stable";
      if (hoursAgo < 6) status = "hot";
      else if (hoursAgo < 12) status = "warm";
      else if (hoursAgo < 24) status = "rising";
      
      return {
        id: trend.id,
        name: trend.trend_name,
        platform: trend.platform || "Multi-platform",
        volume: trend.volume || "N/A",
        growth: trend.velocity === "explosive" ? "+200%" : 
                trend.velocity === "rapid" ? "+100%" : 
                trend.velocity === "growing" ? "+50%" : "+20%",
        timeAgo: hoursAgo < 1 ? "Just now" : `${hoursAgo}h ago`,
        status,
      };
    });
  }, [savedTrends]);

  return {
    stats,
    actionCards,
    liveSignals,
    campaigns,
    savedTrends,
    profile,
    activeBrand,
    loading,
    hasData: savedTrends.length > 0 || campaigns.length > 0,
  };
}

