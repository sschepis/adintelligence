import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/contexts/BrandContext";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { toast } from "sonner";

export interface AnalyticsQuery {
  query: string;
  timestamp: Date;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral' | 'mixed';
  score: number; // -1 to 1
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: Array<{ word: string; sentiment: 'positive' | 'negative' | 'neutral' }>;
  summary: string;
}

export interface CompetitorSentiment {
  competitor: string;
  sentiment: SentimentAnalysis;
  comparison: {
    vsYourBrand: 'better' | 'worse' | 'similar';
    strengthAreas: string[];
    weaknessAreas: string[];
  };
  recentMentions: Array<{
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    source: string;
  }>;
}

export interface CompetitorSentimentReport {
  yourBrand: SentimentAnalysis;
  competitors: CompetitorSentiment[];
  marketInsights: string[];
  recommendations: string[];
}

export interface AnalyticsResponse {
  answer: string;
  data?: {
    trends?: Array<{ name: string; matchScore: number; reason: string }>;
    products?: Array<{ name: string; stock: number; suggestion: string }>;
    insights?: string[];
    sentiment?: SentimentAnalysis;
    competitorSentiment?: CompetitorSentimentReport;
  };
  sources?: string[];
}

export function useConversationalAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AnalyticsResponse | null>(null);
  const [queryHistory, setQueryHistory] = useState<AnalyticsQuery[]>([]);
  const [competitorReport, setCompetitorReport] = useState<CompetitorSentimentReport | null>(null);
  const { activeBrand } = useBrand();
  const { savedTrends } = useSavedTrends();

  const inventory = (activeBrand?.products as Array<{
    name: string;
    stock: number;
    price?: number;
    category?: string;
  }>) || [];

  const askQuestion = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setQueryHistory(prev => [...prev, { query, timestamp: new Date() }]);

    try {
      const context = {
        inventory: inventory.map(p => ({
          name: p.name,
          stock: p.stock,
          price: p.price,
          category: p.category,
          isSlowMoving: p.stock > 50
        })),
        trends: savedTrends.map(t => ({
          name: t.trend_name,
          platform: t.platform,
          volume: t.volume,
          velocity: t.velocity,
          sentiment: t.sentiment_score
        })),
        brandName: activeBrand?.name,
        includeSentiment: true
      };

      const { data, error } = await supabase.functions.invoke('conversational-analytics', {
        body: { query, context }
      });

      if (error) throw error;

      setResponse(data);
      return data;
    } catch (error) {
      console.error('Analytics query error:', error);
      toast.error('Failed to process query');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSentiment = async (text: string) => {
    if (!text.trim()) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('conversational-analytics', {
        body: { 
          query: `Analyze the sentiment of this text and provide detailed emotional tone analysis: "${text}"`,
          context: {
            brandName: activeBrand?.name,
            includeSentiment: true,
            sentimentOnly: true
          }
        }
      });

      if (error) throw error;
      return data?.data?.sentiment || null;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      toast.error('Failed to analyze sentiment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCompetitorSentiment = async (competitors: string[]) => {
    if (!competitors.length) {
      toast.error('Please provide competitor names');
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('conversational-analytics', {
        body: { 
          query: `Analyze customer sentiment for ${activeBrand?.name || 'our brand'} compared to competitors: ${competitors.join(', ')}. Include recent mention examples, strength/weakness areas, and recommendations.`,
          context: {
            brandName: activeBrand?.name,
            competitors,
            competitorAnalysis: true
          }
        }
      });

      if (error) throw error;
      
      if (data?.data?.competitorSentiment) {
        setCompetitorReport(data.data.competitorSentiment);
      }
      
      setResponse(data);
      return data?.data?.competitorSentiment || null;
    } catch (error) {
      console.error('Competitor sentiment error:', error);
      toast.error('Failed to analyze competitor sentiment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = [
    "Show me trends matching my slow-moving inventory",
    "Which products should I promote based on current trends?",
    "What's the sentiment around our brand mentions?",
    "Compare customer sentiment vs our top competitors",
    "Analyze customer feedback sentiment for trending products",
    "What are customers saying about our category?"
  ];

  const clearHistory = () => {
    setQueryHistory([]);
    setResponse(null);
    setCompetitorReport(null);
  };

  return {
    isLoading,
    response,
    queryHistory,
    competitorReport,
    askQuestion,
    analyzeSentiment,
    analyzeCompetitorSentiment,
    suggestedQueries,
    clearHistory
  };
}
