import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface GeneratedAsset {
  id: string;
  url: string;
  prompt: string;
  assetType?: string;
  style?: string;
  generatedAt: string;
}

export function useCreativeAssetGeneration() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);

  const generateAsset = useCallback(async (
    prompt: string,
    options?: {
      assetType?: string;
      style?: string;
      brandColors?: string[];
      brandDNA?: {
        voice?: any;
        personality?: any;
        guardrails?: any;
      };
    }
  ) => {
    if (!user) {
      toast.error("Please sign in to generate assets");
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-asset", {
        body: {
          prompt,
          assetType: options?.assetType,
          style: options?.style,
          brandColors: options?.brandColors,
          brandDNA: options?.brandDNA,
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Failed to generate asset");
      }

      const newAssets = data.images as GeneratedAsset[];
      setGeneratedAssets(prev => [...newAssets, ...prev]);
      
      toast.success(`Generated ${newAssets.length} creative asset(s)`);
      return newAssets;
    } catch (error: any) {
      console.error("Asset generation error:", error);
      
      if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (error.message?.includes("402") || error.message?.includes("Payment")) {
        toast.error("Please add credits to generate assets.");
      } else {
        toast.error(error.message || "Failed to generate asset");
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  const clearAssets = useCallback(() => {
    setGeneratedAssets([]);
  }, []);

  return {
    isGenerating,
    generatedAssets,
    generateAsset,
    clearAssets,
  };
}
