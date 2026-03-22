import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "./useNotifications";
export interface CompetitorProfile {
  name: string;
  positioning: string;
  primaryMessage: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
}

export interface MarketOpportunity {
  opportunity: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  actionableSteps: string[];
}

export interface CompetitorAnalysisResult {
  competitorProfiles: CompetitorProfile[];
  marketPatterns: {
    commonThemes: string[];
    dominantCTAs: string[];
    visualTrends: string[];
    pricingStrategies: string[];
  };
  opportunities: MarketOpportunity[];
  differentiationSuggestions: {
    area: string;
    suggestion: string;
    competitiveAdvantage: string;
  }[];
  threatAssessment: {
    immediateThreats: string[];
    emergingCompetitors: string[];
    marketShifts: string[];
  };
}

export interface ShareOfVoiceResult {
  overallShareOfVoice: {
    brand: number;
    competitors: { name: string; share: number }[];
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    trend: "improving" | "stable" | "declining";
  };
  mentionsByPlatform: {
    platform: string;
    mentions: number;
    share: number;
    sentiment: number;
    trending: boolean;
  }[];
  topTopics: {
    topic: string;
    mentions: number;
    sentiment: number;
    brandAssociation: number;
  }[];
  competitorComparison: {
    competitor: string;
    shareOfVoice: number;
    sentimentDiff: number;
    trend: "gaining" | "stable" | "losing";
  }[];
  alerts: {
    type: "opportunity" | "threat" | "trend";
    message: string;
    priority: "high" | "medium" | "low";
  }[];
  recommendations: string[];
}

export interface MarketGap {
  id: string;
  type: "product" | "price" | "feature" | "service" | "audience";
  title: string;
  description: string;
  marketSize: string;
  urgency: "high" | "medium" | "low";
  confidence: number;
  evidence: string[];
  competitorsCovering: number;
  actionPlan: {
    shortTerm: string[];
    longTerm: string[];
  };
}

export interface MarketGapResult {
  gaps: MarketGap[];
  emergingOpportunities: {
    opportunity: string;
    timeframe: string;
    investmentLevel: "low" | "medium" | "high";
    potentialReturn: string;
  }[];
  riskAssessment: {
    marketRisks: string[];
    competitiveRisks: string[];
    mitigationStrategies: string[];
  };
  priorityMatrix: {
    quickWins: string[];
    strategicBets: string[];
    avoid: string[];
  };
}

export function useCompetitiveIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysisResult | null>(null);
  const [shareOfVoice, setShareOfVoice] = useState<ShareOfVoiceResult | null>(null);
  const [marketGaps, setMarketGaps] = useState<MarketGapResult | null>(null);
  
  const { addNotification } = useNotifications();

  const analyzeCompetitors = useCallback(async (
    competitorDomains: string[],
    competitorAds?: { competitor: string; headline: string; body: string; cta: string; platform: string }[],
    industry?: string,
    brandContext?: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("competitor-analysis", {
        body: { competitorDomains, competitorAds, industry, brandContext }
      });

      if (error) throw error;
      setCompetitorAnalysis(data);
      toast.success("Competitor analysis complete");
      
      // Notify about significant findings
      const threatCount = data.threatAssessment?.immediateThreats?.length || 0;
      addNotification({
        type: "ai",
        title: "Competitor Analysis Complete",
        message: threatCount > 0 
          ? `${threatCount} immediate threats detected! Review competitive intelligence.`
          : `Analysis of ${competitorDomains.length} competitors complete.`,
        actionUrl: "/competitive",
        priority: threatCount > 0 ? "high" : "medium"
      });
      
      return data as CompetitorAnalysisResult;
    } catch (err) {
      console.error("Error analyzing competitors:", err);
      toast.error("Failed to analyze competitors");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateShareOfVoice = useCallback(async (
    brandName: string,
    competitors?: string[],
    keywords?: string[],
    socialData?: { platform: string; mentions: number; sentiment: number }[],
    searchData?: { keyword: string; brandRank: number; competitorRank: number }[]
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("share-of-voice", {
        body: { brandName, competitors, keywords, socialData, searchData }
      });

      if (error) throw error;
      setShareOfVoice(data);
      toast.success("Share of voice calculated");
      
      // Notify about significant changes
      const highPriorityAlerts = data.alerts?.filter((a: { priority: string }) => a.priority === "high") || [];
      if (highPriorityAlerts.length > 0) {
        addNotification({
          type: "alert",
          title: "Competitive Intelligence Alert",
          message: highPriorityAlerts[0].message,
          actionUrl: "/competitive",
          priority: "high"
        });
      }
      
      return data as ShareOfVoiceResult;
    } catch (err) {
      console.error("Error calculating share of voice:", err);
      toast.error("Failed to calculate share of voice");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectMarketGaps = useCallback(async (
    industry: string,
    trendData?: { name: string; volume: number; growth: number }[],
    competitorOfferings?: { competitor: string; products: string[] }[],
    currentInventory?: { category: string; count: number }[],
    searchDemand?: { keyword: string; volume: number; competition: string }[]
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-gap-detection", {
        body: { industry, trendData, competitorOfferings, currentInventory, searchDemand }
      });

      if (error) throw error;
      setMarketGaps(data);
      toast.success(`Detected ${data.gaps?.length || 0} market gaps`);
      
      // Notify about high-urgency gaps
      const urgentGaps = data.gaps?.filter((g: MarketGap) => g.urgency === "high") || [];
      if (urgentGaps.length > 0) {
        addNotification({
          type: "ai",
          title: "Market Opportunity Detected",
          message: `${urgentGaps.length} high-urgency market gaps identified. Review for quick wins!`,
          actionUrl: "/competitive",
          priority: "high"
        });
      }
      
      return data as MarketGapResult;
    } catch (err) {
      console.error("Error detecting market gaps:", err);
      toast.error("Failed to detect market gaps");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    competitorAnalysis,
    shareOfVoice,
    marketGaps,
    analyzeCompetitors,
    calculateShareOfVoice,
    detectMarketGaps,
  };
}
