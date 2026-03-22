import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CachedAnalysis {
  productId: string;
  imageUrl: string;
  dominantColors: string[];
  colorHexCodes: string[];
  patterns: string[];
  aestheticStyle: string;
  luxuryScore: number;
  colorMatchScore: number;
  trendColors: string[];
}

interface VisualScoreData {
  colorMatchScore: number;
  dominantColors?: string[];
  colorHexCodes?: string[];
  patterns?: string[];
  aestheticStyle?: string;
  luxuryScore?: number;
}

export function useVisualAnalysisCache() {
  const { user } = useAuth();
  const [visualScores, setVisualScores] = useState<Record<string, VisualScoreData>>({});
  const [loading, setLoading] = useState(true);

  // Load cached analysis on mount
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadCache = async () => {
      try {
        const { data, error } = await supabase
          .from('visual_analysis_cache')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const scores: Record<string, VisualScoreData> = {};
        data?.forEach((item: any) => {
          scores[item.product_id] = {
            colorMatchScore: item.color_match_score,
            dominantColors: item.dominant_colors,
            colorHexCodes: item.color_hex_codes,
            patterns: item.patterns,
            aestheticStyle: item.aesthetic_style,
            luxuryScore: item.luxury_score,
          };
        });
        setVisualScores(scores);
      } catch (err) {
        console.error('Failed to load visual analysis cache:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCache();
  }, [user]);

  // Save analysis result to cache
  const saveAnalysis = useCallback(async (
    productId: string,
    imageUrl: string,
    analysis: VisualScoreData,
    trendColors: string[] = []
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('visual_analysis_cache')
        .upsert({
          user_id: user.id,
          product_id: productId,
          image_url: imageUrl,
          dominant_colors: analysis.dominantColors || [],
          color_hex_codes: analysis.colorHexCodes || [],
          patterns: analysis.patterns || [],
          aesthetic_style: analysis.aestheticStyle || '',
          luxury_score: analysis.luxuryScore || 0,
          color_match_score: analysis.colorMatchScore,
          trend_colors: trendColors,
        }, {
          onConflict: 'user_id,product_id,image_url'
        });

      if (error) throw error;

      // Update local state
      setVisualScores(prev => ({
        ...prev,
        [productId]: analysis
      }));
    } catch (err) {
      console.error('Failed to save visual analysis:', err);
    }
  }, [user]);

  // Update a single score (for real-time updates)
  const updateScore = useCallback((productId: string, score: VisualScoreData) => {
    setVisualScores(prev => ({
      ...prev,
      [productId]: score
    }));
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('visual_analysis_cache')
        .delete()
        .eq('user_id', user.id);

      setVisualScores({});
    } catch (err) {
      console.error('Failed to clear visual analysis cache:', err);
    }
  }, [user]);

  return {
    visualScores,
    loading,
    saveAnalysis,
    updateScore,
    clearCache,
    hasScore: (productId: string) => !!visualScores[productId],
    getScore: (productId: string) => visualScores[productId]?.colorMatchScore || 0,
  };
}
