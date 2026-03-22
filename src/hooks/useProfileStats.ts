import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProfileStats {
  campaigns: number;
  savedTrends: number;
  simulations: number;
}

export function useProfileStats() {
  const [stats, setStats] = useState<ProfileStats>({ campaigns: 0, savedTrends: 0, simulations: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [campaignsRes, trendsRes, simulationsRes] = await Promise.all([
          supabase.from("campaigns").select("id", { count: "exact", head: true }),
          supabase.from("saved_trends").select("id", { count: "exact", head: true }),
          supabase.from("simulation_results").select("id", { count: "exact", head: true }),
        ]);

        setStats({
          campaigns: campaignsRes.count || 0,
          savedTrends: trendsRes.count || 0,
          simulations: simulationsRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      }
      
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
}
