import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ABVariant {
  id: string;
  name: string;
  headline: string;
  body: string;
  cta: string;
  visualSuggestion: string;
  hypothesis: string;
  predictedLift: number;
}

export interface TestingStrategy {
  recommendedDuration: string;
  minimumSampleSize: number;
  primaryMetric: string;
  confidenceTarget: number;
}

export interface SmartABResult {
  variants: ABVariant[];
  testingStrategy: TestingStrategy;
}

export interface PricingFactor {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
}

export interface DynamicPricingResult {
  recommendedPrice: number;
  priceRange: { floor: number; ceiling: number };
  strategy: "premium" | "competitive" | "penetration" | "dynamic";
  confidence: number;
  reasoning: string;
  factors: PricingFactor[];
  projectedImpact: {
    revenueChange: number;
    marginChange: number;
    volumeChange: number;
  };
  timingRecommendation: string;
}

export interface OptimalTime {
  day: string;
  time: string;
  timezone: string;
  engagementPrediction: number;
  confidence: number;
}

export interface TimingRecommendation {
  platform: string;
  optimalTimes: OptimalTime[];
  peakWindow: { start: string; end: string; days: string[] };
  avoidTimes: { day: string; time: string; reason: string }[];
}

export interface OptimalTimingResult {
  recommendations: TimingRecommendation[];
  insights: { insight: string; actionable: boolean }[];
  weeklySchedule: Record<string, string[]>;
}

export function useAutomatedOptimization() {
  const [isLoading, setIsLoading] = useState(false);
  const [abVariants, setAbVariants] = useState<SmartABResult | null>(null);
  const [pricingResult, setPricingResult] = useState<DynamicPricingResult | null>(null);
  const [timingResult, setTimingResult] = useState<OptimalTimingResult | null>(null);

  const generateABVariants = useCallback(async (
    originalCreative: { headline?: string; body?: string; cta?: string; visualStyle?: string },
    winningPatterns?: { pattern: string; improvement: number }[],
    targetAudience?: string,
    variantCount = 3
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("smart-ab-variants", {
        body: { originalCreative, winningPatterns, targetAudience, variantCount }
      });

      if (error) throw error;
      setAbVariants(data);
      toast.success(`Generated ${data.variants?.length || 0} A/B variants`);
      return data as SmartABResult;
    } catch (err) {
      console.error("Error generating A/B variants:", err);
      toast.error("Failed to generate A/B variants");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateDynamicPricing = useCallback(async (
    product: { name: string; currentPrice: number; cost?: number },
    demandSignals?: { searchTrend?: string; socialMentions?: number; trafficTrend?: string },
    competitorPrices?: { competitor: string; price: number }[],
    inventoryLevel?: number,
    trendData?: { trendName: string; alignment: number }
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dynamic-pricing", {
        body: { product, demandSignals, competitorPrices, inventoryLevel, trendData }
      });

      if (error) throw error;
      setPricingResult(data);
      toast.success("Pricing recommendation calculated");
      return data as DynamicPricingResult;
    } catch (err) {
      console.error("Error calculating pricing:", err);
      toast.error("Failed to calculate dynamic pricing");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictOptimalTiming = useCallback(async (
    platform: string,
    targetAudience?: string,
    contentType?: string,
    historicalPerformance?: { day: string; time: string; engagement: number }[],
    timezone?: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("optimal-timing", {
        body: { platform, targetAudience, contentType, historicalPerformance, timezone }
      });

      if (error) throw error;
      setTimingResult(data);
      toast.success("Optimal timing calculated");
      return data as OptimalTimingResult;
    } catch (err) {
      console.error("Error predicting timing:", err);
      toast.error("Failed to predict optimal timing");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    abVariants,
    pricingResult,
    timingResult,
    generateABVariants,
    calculateDynamicPricing,
    predictOptimalTiming,
  };
}
