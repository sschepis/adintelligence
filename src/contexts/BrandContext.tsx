import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Brand {
  id: string;
  org_id: string;
  name: string;
  website_url: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  brand_voice: any;
  brand_personality: any;
  brand_story: any;
  brand_guardrails: any;
  brand_dna_score: any;
  products: any[];
  taxonomy: string[];
  metadata: any;
  sidebar_visibility: Record<string, boolean> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BrandContextType {
  brands: Brand[];
  activeBrand: Brand | null;
  loading: boolean;
  switching: boolean;
  switchBrand: (brandId: string) => Promise<void>;
  refetchBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const fetchBrands = useCallback(async () => {
    if (!user) {
      setBrands([]);
      setActiveBrand(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user's accessible brands
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (brandsError) throw brandsError;

      // Parse JSON fields
      const parsedBrands: Brand[] = (brandsData || []).map((brand: any) => ({
        ...brand,
        products: Array.isArray(brand.products) ? brand.products : [],
        taxonomy: Array.isArray(brand.taxonomy) ? brand.taxonomy : [],
      }));

      setBrands(parsedBrands);

      // Get active brand from profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("active_brand_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Set active brand
      if (profileData?.active_brand_id && parsedBrands.length > 0) {
        const active = parsedBrands.find(b => b.id === profileData.active_brand_id);
        setActiveBrand(active || parsedBrands[0]);
      } else if (parsedBrands.length > 0) {
        // Default to first brand if no active brand set
        setActiveBrand(parsedBrands[0]);
        
        // Update profile with default brand
        await supabase
          .from("profiles")
          .update({ active_brand_id: parsedBrands[0].id })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const switchBrand = useCallback(async (brandId: string) => {
    if (!user) return;

    const targetBrand = brands.find(b => b.id === brandId);
    if (!targetBrand) {
      toast.error("Brand not found");
      return;
    }

    try {
      setSwitching(true);

      // Update profile with new active brand
      const { error } = await supabase
        .from("profiles")
        .update({ active_brand_id: brandId })
        .eq("user_id", user.id);

      if (error) throw error;

      setActiveBrand(targetBrand);
      toast.success(`Switched to ${targetBrand.name}`);
    } catch (error) {
      console.error("Error switching brand:", error);
      toast.error("Failed to switch brand");
    } finally {
      setSwitching(false);
    }
  }, [user, brands]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return (
    <BrandContext.Provider
      value={{
        brands,
        activeBrand,
        loading,
        switching,
        switchBrand,
        refetchBrands: fetchBrands,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
