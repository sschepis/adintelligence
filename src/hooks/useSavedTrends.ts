import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface SavedTrend {
  id: string;
  trend_name: string;
  platform: string | null;
  velocity: string | null;
  volume: string | null;
  sentiment_score: number | null;
  ai_analysis: string | null;
  saved_at: string;
}

export function useSavedTrends() {
  const [savedTrends, setSavedTrends] = useState<SavedTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedTrends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("saved_trends")
      .select("*")
      .order("saved_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved trends:", error);
    } else {
      setSavedTrends(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSavedTrends();
  }, [user]);

  const saveTrend = async (trend: {
    name: string;
    platform: string;
    velocity: string;
    volume: string;
    aiAnalysis?: string;
  }) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save trends.",
        variant: "destructive",
      });
      return { success: false };
    }

    // Check if already saved
    const isAlreadySaved = savedTrends.some(
      (t) => t.trend_name === trend.name
    );

    if (isAlreadySaved) {
      toast({
        title: "Already saved",
        description: `${trend.name} is already in your saved trends.`,
      });
      return { success: false };
    }

    const { error } = await supabase.from("saved_trends").insert({
      user_id: user.id,
      trend_name: trend.name,
      platform: trend.platform,
      velocity: trend.velocity,
      volume: trend.volume,
      ai_analysis: trend.aiAnalysis || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save trend. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }

    toast({
      title: "Trend saved",
      description: `${trend.name} has been added to your saved trends.`,
    });

    await fetchSavedTrends();
    return { success: true };
  };

  const removeTrend = async (trendId: string) => {
    const { error } = await supabase
      .from("saved_trends")
      .delete()
      .eq("id", trendId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove trend. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }

    toast({
      title: "Trend removed",
      description: "The trend has been removed from your saved list.",
    });

    setSavedTrends((prev) => prev.filter((t) => t.id !== trendId));
    return { success: true };
  };

  const isTrendSaved = (trendName: string) => {
    return savedTrends.some((t) => t.trend_name === trendName);
  };

  return {
    savedTrends,
    loading,
    saveTrend,
    removeTrend,
    isTrendSaved,
    refetch: fetchSavedTrends,
  };
}
