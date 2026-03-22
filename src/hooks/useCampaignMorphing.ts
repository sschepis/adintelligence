import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MorphSuggestion {
  id: string;
  type: "color" | "audio" | "headline" | "imagery" | "format";
  priority: "high" | "medium" | "low";
  suggestion: string;
  reason: string;
  expectedImpact: string;
  trendSource: string;
  applied?: boolean;
  abTestActive?: boolean;
  abTestTrafficPercent?: number;
}

export interface MorphData {
  morphSuggestions: MorphSuggestion[];
  overallScore: number;
  urgentActions: string[];
  trendAlignment: {
    aligned: string[];
    missing: string[];
  };
}

export interface ABTestConfig {
  suggestionId: string;
  trafficPercent: number;
  startedAt: Date;
  status: "running" | "concluded" | "cancelled";
  controlMetrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
  };
  variantMetrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
  };
  winner?: "control" | "variant" | "inconclusive";
}

export interface MorphHistoryEntry {
  id: string;
  suggestion: MorphSuggestion;
  appliedAt: Date;
  campaignId?: string;
  campaignName: string;
  beforeState: {
    overallScore: number;
    description: string;
  };
  afterState: {
    overallScore: number;
    description: string;
  };
}

export function useCampaignMorphing() {
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [morphData, setMorphData] = useState<MorphData | null>(null);
  const [morphHistory, setMorphHistory] = useState<MorphHistoryEntry[]>([]);
  const [abTests, setAbTests] = useState<ABTestConfig[]>([]);

  const generateSuggestions = useCallback(async (
    campaignName: string,
    currentTrends: any[],
    campaignType?: string,
    currentCreative?: any
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("campaign-morph-suggestions", {
        body: {
          campaignName,
          currentTrends,
          campaignType,
          currentCreative
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.data) {
        setMorphData(data.data);
        toast.success("Morph suggestions generated");
        return data.data;
      } else {
        throw new Error(data?.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error("Campaign morph error:", error);
      toast.error("Failed to generate morph suggestions");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applySuggestion = useCallback(async (
    suggestionId: string,
    campaignId?: string,
    campaignName: string = "Current Campaign"
  ) => {
    setIsApplying(suggestionId);
    try {
      const suggestion = morphData?.morphSuggestions.find(s => s.id === suggestionId);
      if (!suggestion) throw new Error("Suggestion not found");

      const beforeScore = morphData?.overallScore || 0;
      
      // Simulate applying the morph suggestion to the campaign
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newScore = Math.min(100, beforeScore + 5);
      
      // Create history entry
      const historyEntry: MorphHistoryEntry = {
        id: `history-${Date.now()}`,
        suggestion: { ...suggestion },
        appliedAt: new Date(),
        campaignId,
        campaignName,
        beforeState: {
          overallScore: beforeScore,
          description: getStateDescription(suggestion.type, "before")
        },
        afterState: {
          overallScore: newScore,
          description: getStateDescription(suggestion.type, "after", suggestion.suggestion)
        }
      };
      
      setMorphHistory(prev => [historyEntry, ...prev].slice(0, 50));
      
      // Mark suggestion as applied
      setMorphData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          morphSuggestions: prev.morphSuggestions.map(s => 
            s.id === suggestionId ? { ...s, applied: true } : s
          ),
          overallScore: newScore
        };
      });
      
      toast.success("Morph applied to campaign");
      return true;
    } catch (error) {
      console.error("Apply morph error:", error);
      toast.error("Failed to apply morph");
      return false;
    } finally {
      setIsApplying(null);
    }
  }, [morphData]);

  const applyAllHighPriority = useCallback(async (
    campaignId?: string,
    campaignName: string = "Current Campaign"
  ) => {
    if (!morphData) return false;
    
    const highPriority = morphData.morphSuggestions.filter(
      s => s.priority === "high" && !s.applied
    );
    
    setIsApplying("all");
    try {
      const beforeScore = morphData.overallScore;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newScore = Math.min(100, beforeScore + (highPriority.length * 5));
      
      // Create history entries for all applied morphs
      const historyEntries: MorphHistoryEntry[] = highPriority.map((suggestion, index) => ({
        id: `history-${Date.now()}-${index}`,
        suggestion: { ...suggestion },
        appliedAt: new Date(),
        campaignId,
        campaignName,
        beforeState: {
          overallScore: beforeScore + (index * 5),
          description: getStateDescription(suggestion.type, "before")
        },
        afterState: {
          overallScore: beforeScore + ((index + 1) * 5),
          description: getStateDescription(suggestion.type, "after", suggestion.suggestion)
        }
      }));
      
      setMorphHistory(prev => [...historyEntries, ...prev].slice(0, 50));
      
      setMorphData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          morphSuggestions: prev.morphSuggestions.map(s => 
            s.priority === "high" ? { ...s, applied: true } : s
          ),
          overallScore: newScore
        };
      });
      
      toast.success(`Applied ${highPriority.length} high-priority morphs`);
      return true;
    } catch (error) {
      console.error("Apply all morphs error:", error);
      toast.error("Failed to apply morphs");
      return false;
    } finally {
      setIsApplying(null);
    }
  }, [morphData]);

  const clearSuggestions = useCallback(() => {
    setMorphData(null);
  }, []);

  const clearHistory = useCallback(() => {
    setMorphHistory([]);
  }, []);

  const revertMorph = useCallback(async (historyEntryId: string) => {
    const entry = morphHistory.find(h => h.id === historyEntryId);
    if (!entry) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from history and mark as unapplied in current suggestions
      setMorphHistory(prev => prev.filter(h => h.id !== historyEntryId));
      
      setMorphData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          morphSuggestions: prev.morphSuggestions.map(s => 
            s.id === entry.suggestion.id ? { ...s, applied: false } : s
          ),
          overallScore: Math.max(0, prev.overallScore - 5)
        };
      });
      
      toast.success("Morph reverted");
      return true;
    } catch (error) {
      console.error("Revert morph error:", error);
      toast.error("Failed to revert morph");
      return false;
    }
  }, [morphHistory]);

  const startABTest = useCallback(async (
    suggestionId: string,
    trafficPercent: number = 50,
    campaignId?: string,
    campaignName: string = "Current Campaign"
  ) => {
    const suggestion = morphData?.morphSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) {
      toast.error("Suggestion not found");
      return false;
    }

    // Check if already in A/B test
    if (abTests.some(t => t.suggestionId === suggestionId && t.status === "running")) {
      toast.error("A/B test already running for this morph");
      return false;
    }

    setIsApplying(suggestionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newTest: ABTestConfig = {
        suggestionId,
        trafficPercent,
        startedAt: new Date(),
        status: "running",
        controlMetrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0
        },
        variantMetrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0
        }
      };

      setAbTests(prev => [...prev, newTest]);

      // Mark suggestion as in A/B test
      setMorphData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          morphSuggestions: prev.morphSuggestions.map(s => 
            s.id === suggestionId 
              ? { ...s, abTestActive: true, abTestTrafficPercent: trafficPercent } 
              : s
          )
        };
      });

      toast.success(`A/B test started with ${trafficPercent}% traffic to variant`);
      return true;
    } catch (error) {
      console.error("Start A/B test error:", error);
      toast.error("Failed to start A/B test");
      return false;
    } finally {
      setIsApplying(null);
    }
  }, [morphData, abTests]);

  const concludeABTest = useCallback(async (
    suggestionId: string,
    applyWinner: boolean = true
  ) => {
    const testIndex = abTests.findIndex(t => t.suggestionId === suggestionId && t.status === "running");
    if (testIndex === -1) {
      toast.error("No running A/B test found");
      return null;
    }

    setIsApplying(suggestionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate final metrics
      const controlMetrics = {
        impressions: Math.floor(Math.random() * 10000) + 5000,
        clicks: Math.floor(Math.random() * 500) + 200,
        conversions: Math.floor(Math.random() * 50) + 10,
        ctr: 0
      };
      controlMetrics.ctr = (controlMetrics.clicks / controlMetrics.impressions) * 100;

      const variantMetrics = {
        impressions: Math.floor(Math.random() * 10000) + 5000,
        clicks: Math.floor(Math.random() * 600) + 250,
        conversions: Math.floor(Math.random() * 60) + 15,
        ctr: 0
      };
      variantMetrics.ctr = (variantMetrics.clicks / variantMetrics.impressions) * 100;

      const winner = variantMetrics.ctr > controlMetrics.ctr * 1.05 
        ? "variant" 
        : controlMetrics.ctr > variantMetrics.ctr * 1.05 
          ? "control" 
          : "inconclusive";

      setAbTests(prev => prev.map((t, i) => 
        i === testIndex 
          ? { ...t, status: "concluded", controlMetrics, variantMetrics, winner }
          : t
      ));

      // Update suggestion
      setMorphData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          morphSuggestions: prev.morphSuggestions.map(s => 
            s.id === suggestionId 
              ? { 
                  ...s, 
                  abTestActive: false,
                  applied: applyWinner && winner === "variant"
                } 
              : s
          ),
          overallScore: applyWinner && winner === "variant" 
            ? Math.min(100, prev.overallScore + 5) 
            : prev.overallScore
        };
      });

      const resultMessage = winner === "variant" 
        ? "Variant wins! " + (applyWinner ? "Applied to campaign." : "")
        : winner === "control"
          ? "Control wins. Variant not applied."
          : "Results inconclusive. No change applied.";

      toast.success(`A/B test concluded: ${resultMessage}`);
      return { winner, controlMetrics, variantMetrics };
    } catch (error) {
      console.error("Conclude A/B test error:", error);
      toast.error("Failed to conclude A/B test");
      return null;
    } finally {
      setIsApplying(null);
    }
  }, [abTests]);

  const cancelABTest = useCallback(async (suggestionId: string) => {
    const testIndex = abTests.findIndex(t => t.suggestionId === suggestionId && t.status === "running");
    if (testIndex === -1) {
      toast.error("No running A/B test found");
      return false;
    }

    try {
      setAbTests(prev => prev.map((t, i) => 
        i === testIndex ? { ...t, status: "cancelled" } : t
      ));

      setMorphData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          morphSuggestions: prev.morphSuggestions.map(s => 
            s.id === suggestionId 
              ? { ...s, abTestActive: false, abTestTrafficPercent: undefined } 
              : s
          )
        };
      });

      toast.info("A/B test cancelled");
      return true;
    } catch (error) {
      console.error("Cancel A/B test error:", error);
      toast.error("Failed to cancel A/B test");
      return false;
    }
  }, [abTests]);

  const getABTestForSuggestion = useCallback((suggestionId: string) => {
    return abTests.find(t => t.suggestionId === suggestionId);
  }, [abTests]);

  return {
    morphData,
    morphHistory,
    abTests,
    isLoading,
    isApplying,
    generateSuggestions,
    applySuggestion,
    applyAllHighPriority,
    clearSuggestions,
    clearHistory,
    revertMorph,
    startABTest,
    concludeABTest,
    cancelABTest,
    getABTestForSuggestion
  };
}

function getStateDescription(type: string, state: "before" | "after", suggestion?: string): string {
  const descriptions: Record<string, { before: string; after: string }> = {
    color: {
      before: "Original color grading with neutral tones",
      after: suggestion || "Warmer color grading aligned with trending aesthetics"
    },
    audio: {
      before: "Standard background audio track",
      after: suggestion || "Trending audio track with higher engagement potential"
    },
    headline: {
      before: "Original headline copy",
      after: suggestion || "Optimized headline with trend-aligned messaging"
    },
    imagery: {
      before: "Original visual composition",
      after: suggestion || "Enhanced imagery matching current visual trends"
    },
    format: {
      before: "Standard ad format",
      after: suggestion || "Optimized format for better platform engagement"
    }
  };
  
  return descriptions[type]?.[state] || `${state === "before" ? "Original" : "Updated"} ${type} settings`;
}
