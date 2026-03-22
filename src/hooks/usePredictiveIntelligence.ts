import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "./useNotifications";

export interface TrendPrediction {
  trendName: string;
  currentStage: "emerging" | "growing" | "peak" | "declining" | "stable";
  daysUntilPeak: number | null;
  daysOfRelevance: number;
  confidence: number;
  keyFactors: string[];
  recommendedAction: string;
  optimalActionWindow: string;
  riskLevel: "low" | "medium" | "high";
}

export interface TrendPredictionResult {
  predictions: TrendPrediction[];
  summary: {
    hottest: string;
    mostUrgent: string;
    bestLongTerm: string;
  };
  analyzedAt: string;
}

export interface RevenueForecast {
  trendName: string;
  products: Array<{
    name: string;
    projectedUnits: { conservative: number; moderate: number; optimistic: number };
    projectedRevenue: { conservative: number; moderate: number; optimistic: number };
    confidenceScore: number;
  }>;
  totalRevenue: { conservative: number; moderate: number; optimistic: number };
  peakWeek: number;
  riskFactors: string[];
}

export interface RevenueForecastResult {
  forecasts: RevenueForecast[];
  summary: {
    totalProjectedRevenue: { conservative: number; moderate: number; optimistic: number };
    topOpportunity: string;
    biggestRisk: string;
    recommendedFocus: string;
  };
  weeklyBreakdown: Array<{
    week: number;
    revenue: { conservative: number; moderate: number; optimistic: number };
  }>;
  generatedAt: string;
}

export interface DemandRecommendation {
  productName: string;
  currentStock: number;
  recommendedAction: "reorder" | "reduce" | "hold" | "discontinue";
  urgency: "critical" | "high" | "medium" | "low";
  quantity: number;
  reasoning: string;
  trendAlignment: "strong" | "moderate" | "weak" | "none";
  estimatedDemand: { weekly: number; monthly: number };
  stockoutRisk: { days: number; probability: number };
}

export interface DemandAlert {
  type: "stockout" | "overstock" | "opportunity" | "trend_mismatch";
  severity: "critical" | "warning" | "info";
  message: string;
  affectedProducts: string[];
}

export interface DemandPlanResult {
  recommendations: DemandRecommendation[];
  alerts: DemandAlert[];
  summary: {
    criticalActions: number;
    totalReorderValue: number;
    potentialStockoutLoss: number;
    trendAlignmentScore: number;
    topPriority: string;
  };
  generatedAt: string;
}

export function usePredictiveIntelligence() {
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [isLoadingDemandPlan, setIsLoadingDemandPlan] = useState(false);
  
  const [trendPredictions, setTrendPredictions] = useState<TrendPredictionResult | null>(null);
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecastResult | null>(null);
  const [demandPlan, setDemandPlan] = useState<DemandPlanResult | null>(null);
  
  const { addNotification } = useNotifications();

  const predictTrendLifecycle = useCallback(async (
    trends: Array<{ name: string; volume?: string; velocity?: string; platform?: string; sentiment_score?: number }>,
    brandContext?: Record<string, unknown>
  ) => {
    if (!trends.length) {
      toast.error("No trends to analyze");
      return null;
    }

    setIsLoadingPredictions(true);
    try {
      const { data, error } = await supabase.functions.invoke("predict-trend-lifecycle", {
        body: { trends, brandContext }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setTrendPredictions(data);
      toast.success(`Analyzed ${data.predictions?.length || 0} trends`);
      
      // Send notification for completed prediction
      addNotification({
        type: "ai",
        title: "Trend Prediction Complete",
        message: `Analyzed ${data.predictions?.length || 0} trends. ${data.summary?.hottest ? `Hottest: ${data.summary.hottest}` : ''}`,
        actionUrl: "/ai-insights",
        priority: data.predictions?.some((p: TrendPrediction) => p.riskLevel === "high") ? "high" : "medium"
      });
      
      return data as TrendPredictionResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to predict trends";
      toast.error(message);
      return null;
    } finally {
      setIsLoadingPredictions(false);
    }
  }, []);

  const forecastRevenue = useCallback(async (
    trendMatches: Array<{ trendName: string; matchScore: number; products: Array<{ name: string; price?: number; stock?: number }> }>,
    timeframeWeeks: number = 4,
    historicalData?: Record<string, unknown>
  ) => {
    if (!trendMatches.length) {
      toast.error("No trend matches to forecast");
      return null;
    }

    setIsLoadingForecast(true);
    try {
      const { data, error } = await supabase.functions.invoke("forecast-revenue", {
        body: { trendMatches, timeframeWeeks, historicalData }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setRevenueForecast(data);
      toast.success("Revenue forecast generated");
      
      // Send notification for completed forecast
      const totalRevenue = data.summary?.totalProjectedRevenue?.moderate || 0;
      addNotification({
        type: "ai",
        title: "Revenue Forecast Ready",
        message: `Projected revenue: $${totalRevenue.toLocaleString()} (moderate scenario)`,
        actionUrl: "/ai-insights",
        priority: "medium"
      });
      
      return data as RevenueForecastResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to forecast revenue";
      toast.error(message);
      return null;
    } finally {
      setIsLoadingForecast(false);
    }
  }, []);

  const planDemand = useCallback(async (
    inventory: Array<{ name: string; stock: number; price?: number; category?: string }>,
    trends?: Array<{ name: string; velocity?: string; volume?: string }>,
    leadTimeDays: number = 14
  ) => {
    if (!inventory.length) {
      toast.error("No inventory data provided");
      return null;
    }

    setIsLoadingDemandPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke("plan-demand", {
        body: { inventory, trends, leadTimeDays }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setDemandPlan(data);
      toast.success(`Generated ${data.recommendations?.length || 0} recommendations`);
      
      // Send notification for demand plan with alerts
      const criticalAlerts = data.alerts?.filter((a: DemandAlert) => a.severity === "critical") || [];
      addNotification({
        type: "ai",
        title: "Demand Plan Generated",
        message: criticalAlerts.length > 0 
          ? `${criticalAlerts.length} critical alerts require attention!`
          : `${data.recommendations?.length || 0} inventory recommendations ready.`,
        actionUrl: "/ai-insights",
        priority: criticalAlerts.length > 0 ? "high" : "medium"
      });
      
      return data as DemandPlanResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to plan demand";
      toast.error(message);
      return null;
    } finally {
      setIsLoadingDemandPlan(false);
    }
  }, []);

  return {
    // Loading states
    isLoadingPredictions,
    isLoadingForecast,
    isLoadingDemandPlan,
    isLoading: isLoadingPredictions || isLoadingForecast || isLoadingDemandPlan,
    
    // Results
    trendPredictions,
    revenueForecast,
    demandPlan,
    
    // Actions
    predictTrendLifecycle,
    forecastRevenue,
    planDemand,
    
    // Clear functions
    clearPredictions: () => setTrendPredictions(null),
    clearForecast: () => setRevenueForecast(null),
    clearDemandPlan: () => setDemandPlan(null),
  };
}
