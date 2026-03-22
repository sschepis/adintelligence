import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface SimulationResult {
  id: string;
  ad_headline: string;
  ad_body: string | null;
  ad_image_url: string | null;
  personas: any;
  reactions: any;
  overall_score: number | null;
  recommendation: string | null;
  created_at: string;
}

export interface SimulationInput {
  ad_headline: string;
  ad_body?: string;
  ad_image_url?: string;
  personas: any[];
  reactions: any[];
  overall_score: number;
  recommendation?: string;
}

export function useSimulationResults() {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchResults = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("simulation_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching simulation results:", error);
    } else {
      setResults(data as SimulationResult[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [user]);

  const saveResult = async (input: SimulationInput) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save simulation results.",
        variant: "destructive",
      });
      return { success: false, data: null };
    }

    const { data, error } = await supabase
      .from("simulation_results")
      .insert({
        user_id: user.id,
        ad_headline: input.ad_headline,
        ad_body: input.ad_body || null,
        ad_image_url: input.ad_image_url || null,
        personas: input.personas,
        reactions: input.reactions,
        overall_score: input.overall_score,
        recommendation: input.recommendation || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save simulation. Please try again.",
        variant: "destructive",
      });
      return { success: false, data: null };
    }

    toast({
      title: "Simulation saved",
      description: "Your focus group results have been saved.",
    });

    await fetchResults();
    return { success: true, data };
  };

  const deleteResult = async (id: string) => {
    const { error } = await supabase
      .from("simulation_results")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete simulation.",
        variant: "destructive",
      });
      return { success: false };
    }

    toast({
      title: "Simulation deleted",
      description: "The simulation has been removed.",
    });

    setResults((prev) => prev.filter((r) => r.id !== id));
    return { success: true };
  };

  return {
    results,
    loading,
    saveResult,
    deleteResult,
    refetch: fetchResults,
  };
}
