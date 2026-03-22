import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/hooks/use-toast";

export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "scheduled" | "draft";
  daily_budget: number;
  total_budget: number;
  spent: number;
  platform: string | null;
  performance_score: number;
  conversions: number;
  clicks: number;
  impressions: number;
  brand_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignInput {
  name: string;
  status?: "active" | "paused" | "scheduled" | "draft";
  daily_budget: number;
  total_budget: number;
  platform?: string;
  brand_id?: string;
}

export function useCampaigns(filterByBrand: boolean = false) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { activeBrand } = useBrand();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    if (!user) return;

    let query = supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    
    // Filter by active brand if requested
    if (filterByBrand && activeBrand) {
      query = query.eq("brand_id", activeBrand.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load campaigns.",
        variant: "destructive",
      });
    } else {
      setCampaigns(data as Campaign[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user, activeBrand, filterByBrand]);

  const createCampaign = async (input: CampaignInput) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create campaigns.",
        variant: "destructive",
      });
      return { success: false, data: null };
    }

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        brand_id: input.brand_id || activeBrand?.id || null,
        name: input.name,
        status: input.status || "draft",
        daily_budget: input.daily_budget,
        total_budget: input.total_budget,
        platform: input.platform || null,
        spent: 0,
        performance_score: 0,
        conversions: 0,
        clicks: 0,
        impressions: 0,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
      return { success: false, data: null };
    }

    toast({
      title: "Campaign created",
      description: `${input.name} has been created successfully.`,
    });

    await fetchCampaigns();
    return { success: true, data };
  };

  const updateCampaign = async (id: string, updates: Partial<CampaignInput>) => {
    const { error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }

    toast({
      title: "Campaign updated",
      description: "Changes have been saved.",
    });

    await fetchCampaigns();
    return { success: true };
  };

  const toggleCampaignStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    
    const { error } = await supabase
      .from("campaigns")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign status.",
        variant: "destructive",
      });
      return { success: false };
    }

    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus as Campaign["status"] } : c))
    );

    toast({
      title: newStatus === "active" ? "Campaign activated" : "Campaign paused",
      description: `Campaign has been ${newStatus === "active" ? "activated" : "paused"}.`,
    });

    return { success: true };
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign.",
        variant: "destructive",
      });
      return { success: false };
    }

    toast({
      title: "Campaign deleted",
      description: "The campaign has been removed.",
    });

    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    toggleCampaignStatus,
    deleteCampaign,
    refetch: fetchCampaigns,
  };
}
