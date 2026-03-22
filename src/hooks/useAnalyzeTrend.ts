import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrendAnalysis {
  summary: string;
  demographics: {
    primaryAge: string;
    gender: string;
    income: string;
  };
  visualElements: string[];
  productCategories: string[];
  peakTiming: string;
  longevity: string;
  brandOpportunity: string;
  riskFactors: string[];
  confidenceScore: number;
}

export function useAnalyzeTrend() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeTrend = async (trendName: string, platform: string, hashtags?: string[]) => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-trend", {
        body: { trendName, platform, hashtags },
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analysis Complete",
          description: `AI insights generated for "${trendName}"`,
        });
        return data.analysis;
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error analyzing trend:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze trend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeTrend, isLoading, analysis };
}
