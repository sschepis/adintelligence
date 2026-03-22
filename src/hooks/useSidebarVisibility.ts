import { useBrand } from "@/contexts/BrandContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SidebarVisibility {
  commandCenter: boolean;
  signalIntelligence: boolean;
  commerceLoop: boolean;
  brandCatalog: boolean;
  simulationStudio: boolean;
  visualForge: boolean;
  writingForge: boolean;
  aiDashboard: boolean;
  aiInsights: boolean;
  optimization: boolean;
  competitiveIntel: boolean;
  activeDeployment: boolean;
  analytics: boolean;
  brandDna: boolean;
  brandTheme: boolean;
  documentation: boolean;
  categories: boolean;
  products: boolean;
}

export const defaultSidebarVisibility: SidebarVisibility = {
  commandCenter: true,
  signalIntelligence: true,
  commerceLoop: true,
  brandCatalog: true,
  simulationStudio: true,
  visualForge: true,
  writingForge: true,
  aiDashboard: true,
  aiInsights: true,
  optimization: true,
  competitiveIntel: true,
  activeDeployment: true,
  analytics: true,
  brandDna: true,
  brandTheme: true,
  documentation: true,
  categories: true,
  products: true,
};

export const sidebarItemLabels: Record<keyof SidebarVisibility, string> = {
  commandCenter: "Command Center",
  signalIntelligence: "Signal Intelligence",
  commerceLoop: "Commerce Loop",
  brandCatalog: "Brand Catalog",
  simulationStudio: "Simulation Studio",
  visualForge: "Visual Forge",
  writingForge: "Writing Forge",
  aiDashboard: "AI Dashboard",
  aiInsights: "AI Insights",
  optimization: "Optimization",
  competitiveIntel: "Competitive Intel",
  activeDeployment: "Active Deployment",
  analytics: "Analytics",
  brandDna: "Brand DNA",
  brandTheme: "Brand Theme",
  documentation: "Documentation",
  categories: "Categories Section",
  products: "Products Section",
};

export function useSidebarVisibility() {
  const { activeBrand, refetchBrands } = useBrand();
  const { toast } = useToast();

  const visibility: SidebarVisibility = {
    ...defaultSidebarVisibility,
    ...(activeBrand?.sidebar_visibility as Partial<SidebarVisibility> || {}),
  };

  const updateVisibility = async (updates: Partial<SidebarVisibility>) => {
    if (!activeBrand?.id) return;

    const newVisibility = { ...visibility, ...updates };

    const { error } = await supabase
      .from("brands")
      .update({ sidebar_visibility: newVisibility })
      .eq("id", activeBrand.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update sidebar visibility",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Updated",
      description: "Sidebar visibility settings saved",
    });

    refetchBrands();
  };

  const toggleItem = (key: keyof SidebarVisibility) => {
    updateVisibility({ [key]: !visibility[key] });
  };

  const isVisible = (key: keyof SidebarVisibility): boolean => {
    return visibility[key] ?? true;
  };

  return {
    visibility,
    updateVisibility,
    toggleItem,
    isVisible,
  };
}
