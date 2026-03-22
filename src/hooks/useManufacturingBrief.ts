import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductRecommendation {
  productName: string;
  category: string;
  description: string;
  keyFeatures: string[];
  materials: string[];
  colorways: string[];
  pricePoint: {
    wholesale: string;
    retail: string;
    margin: string;
  };
  moq: string;
  leadTime: string;
}

export interface ManufacturingBrief {
  trendName: string;
  briefTitle: string;
  executiveSummary: string;
  marketOpportunity: {
    demandSignals: string[];
    targetDemographic: string;
    projectedMargin: string;
    urgencyLevel: 'high' | 'medium' | 'low';
  };
  productRecommendations: ProductRecommendation[];
  designGuidelines: {
    aestheticDirection: string;
    mustHaveElements: string[];
    avoidElements: string[];
    qualityIndicators: string[];
  };
  productionNotes: {
    recommendedManufacturers: string;
    certifications: string[];
    sustainabilityConsiderations: string;
  };
  timelineRecommendation: {
    idealLaunchWindow: string;
    trendLongevity: string;
    seasonality: string;
  };
}

interface GenerateBriefParams {
  trendName: string;
  trendKeywords?: string[];
  trendColors?: string[];
  existingCategories?: string[];
  gapCategories?: string[];
}

export function useManufacturingBrief() {
  const [brief, setBrief] = useState<ManufacturingBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = useCallback(async (params: GenerateBriefParams) => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-manufacturing-brief', {
        body: params
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setBrief(data);
      toast.success('Manufacturing brief generated successfully');
      return data as ManufacturingBrief;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate brief';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearBrief = useCallback(() => {
    setBrief(null);
    setError(null);
  }, []);

  return {
    brief,
    isGenerating,
    error,
    generateBrief,
    clearBrief
  };
}
