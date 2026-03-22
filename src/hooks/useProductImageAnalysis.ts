import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageAnalysis {
  dominantColors: string[];
  colorHexCodes: string[];
  patterns: string[];
  aestheticStyle: string;
  luxuryScore: number;
  colorMatchScore: number;
  imageUrl: string;
}

interface AnalysisCache {
  [key: string]: ImageAnalysis;
}

export function useProductImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCache, setAnalysisCache] = useState<AnalysisCache>({});

  const analyzeProductImage = useCallback(async (
    imageUrl: string,
    trendColors?: string[]
  ): Promise<ImageAnalysis | null> => {
    // Check cache first
    const cacheKey = `${imageUrl}-${trendColors?.join(',') || 'none'}`;
    if (analysisCache[cacheKey]) {
      return analysisCache[cacheKey];
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product-image', {
        body: { imageUrl, trendColors }
      });

      if (error) {
        console.error('Image analysis error:', error);
        toast.error('Failed to analyze product image');
        return null;
      }

      // Cache the result
      setAnalysisCache(prev => ({
        ...prev,
        [cacheKey]: data
      }));

      return data as ImageAnalysis;
    } catch (err) {
      console.error('Image analysis exception:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisCache]);

  const analyzeMultipleProducts = useCallback(async (
    products: Array<{ id: string; imageUrl: string }>,
    trendColors?: string[]
  ): Promise<Map<string, ImageAnalysis>> => {
    const results = new Map<string, ImageAnalysis>();
    
    // Process in batches of 3 to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const promises = batch.map(async (product) => {
        const analysis = await analyzeProductImage(product.imageUrl, trendColors);
        if (analysis) {
          results.set(product.id, analysis);
        }
      });
      await Promise.all(promises);
    }

    return results;
  }, [analyzeProductImage]);

  const clearCache = useCallback(() => {
    setAnalysisCache({});
  }, []);

  return {
    analyzeProductImage,
    analyzeMultipleProducts,
    isAnalyzing,
    clearCache
  };
}
