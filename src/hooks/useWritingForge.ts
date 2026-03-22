import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContentVersion {
  version: number;
  content: any;
  createdAt: string;
  label?: string;
}

export interface ContentVariant {
  id: string;
  name: string;
  content: any;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  content_type: string;
  title: string;
  brief: string | null;
  tone: string | null;
  target_audience: string | null;
  keywords: string[] | null;
  generated_content: any;
  status: string;
  created_at: string;
}

export interface ContentFormData {
  title: string;
  brief: string;
  tone: string;
  targetAudience: string;
  keywords: string;
}

const initialFormData: ContentFormData = {
  title: "",
  brief: "",
  tone: "Professional",
  targetAudience: "",
  keywords: "",
};

export function useWritingForge() {
  const { user } = useAuth();
  const { trackPageView, trackAIGeneration } = useUsageTracking();
  const { brandDNA } = useBrandDNA();
  
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"list" | "create" | "view">("list");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [generatingVariant, setGeneratingVariant] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeVariant, setActiveVariant] = useState<string>("original");
  const [compareMode, setCompareMode] = useState(false);
  const [compareLeft, setCompareLeft] = useState<string>("original");
  const [compareRight, setCompareRight] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ContentFormData>(initialFormData);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [contentVersions, setContentVersions] = useState<ContentVersion[]>([]);
  const [contentVariants, setContentVariants] = useState<ContentVariant[]>([]);

  useEffect(() => {
    trackPageView("writing_forge");
    if (user) {
      fetchContents();
    }
  }, [user]);

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from("writing_forge_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error("Error fetching contents:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user || !selectedType || !formData.title || !formData.brief) return;

    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          contentType: selectedType,
          title: formData.title,
          brief: formData.brief,
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean),
          brandDNA: brandDNA.guardrails.enabled ? brandDNA : undefined,
        },
      });

      if (error) throw error;

      if (generatedContent) {
        const newVersion: ContentVersion = {
          version: contentVersions.length + 1,
          content: generatedContent,
          createdAt: new Date().toISOString(),
          label: `Version ${contentVersions.length + 1}`,
        };
        setContentVersions(prev => [...prev, newVersion]);
      }

      setGeneratedContent(data.content);
      trackAIGeneration("writing_forge", "content_generation", { contentType: selectedType });
      toast.success("Content generated successfully!");
    } catch (error: any) {
      console.error("Error generating content:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (error.message?.includes("402")) {
        toast.error("Usage limit reached. Please add credits.");
      } else {
        toast.error("Failed to generate content");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateVariant = async (variantType: 'A' | 'B' | 'casual' | 'formal' | 'short' | 'detailed') => {
    if (!user || !selectedType || !formData.title || !formData.brief) return;

    setGeneratingVariant(true);

    const variantPrompts: Record<string, string> = {
      'A': 'Create an alternative version with a different hook and call-to-action approach.',
      'B': 'Create a contrasting version with different emotional appeal and messaging angle.',
      'casual': 'Rewrite in a more casual, conversational tone while maintaining the key message.',
      'formal': 'Rewrite in a more formal, professional tone suitable for enterprise audiences.',
      'short': 'Create a condensed version that is 50% shorter but retains the core message.',
      'detailed': 'Create an expanded version with more details, examples, and supporting points.',
    };

    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          contentType: selectedType,
          title: formData.title,
          brief: `${formData.brief}\n\nVARIANT INSTRUCTION: ${variantPrompts[variantType]}`,
          tone: variantType === 'casual' ? 'Casual' : variantType === 'formal' ? 'Professional' : formData.tone,
          targetAudience: formData.targetAudience,
          keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean),
          brandDNA: brandDNA.guardrails.enabled ? brandDNA : undefined,
        },
      });

      if (error) throw error;

      const variantName = variantType === 'A' ? 'Variant A' : 
                          variantType === 'B' ? 'Variant B' : 
                          `${variantType.charAt(0).toUpperCase() + variantType.slice(1)} Version`;

      const newVariant: ContentVariant = {
        id: crypto.randomUUID(),
        name: variantName,
        content: data.content,
        createdAt: new Date().toISOString(),
      };

      setContentVariants(prev => [...prev, newVariant]);
      setActiveVariant(newVariant.id);
      toast.success(`${variantName} generated!`);
    } catch (error: any) {
      console.error("Error generating variant:", error);
      toast.error("Failed to generate variant");
    } finally {
      setGeneratingVariant(false);
    }
  };

  const restoreVersion = (version: ContentVersion) => {
    if (generatedContent) {
      const newVersion: ContentVersion = {
        version: contentVersions.length + 1,
        content: generatedContent,
        createdAt: new Date().toISOString(),
        label: `Before restore from v${version.version}`,
      };
      setContentVersions(prev => [...prev, newVersion]);
    }
    
    setGeneratedContent(version.content);
    setActiveVariant("original");
    toast.success(`Restored to version ${version.version}`);
  };

  const deleteVariant = (variantId: string) => {
    setContentVariants(prev => prev.filter(v => v.id !== variantId));
    if (activeVariant === variantId) {
      setActiveVariant("original");
    }
    toast.success("Variant deleted");
  };

  const getActiveContent = () => {
    if (activeVariant === "original") {
      return generatedContent;
    }
    const variant = contentVariants.find(v => v.id === activeVariant);
    return variant?.content;
  };

  const getContentById = (id: string) => {
    if (id === "original") {
      return generatedContent;
    }
    const variant = contentVariants.find(v => v.id === id);
    return variant?.content;
  };

  const getContentLabel = (id: string) => {
    if (id === "original") {
      return "Original";
    }
    const variant = contentVariants.find(v => v.id === id);
    return variant?.name || "Unknown";
  };

  const toggleCompareMode = () => {
    if (!compareMode && contentVariants.length > 0) {
      setCompareLeft("original");
      setCompareRight(contentVariants[0].id);
    }
    setCompareMode(!compareMode);
  };

  const handleSave = async () => {
    if (!user || !selectedType || !generatedContent) return;

    try {
      const savedContent = JSON.parse(JSON.stringify({
        main: generatedContent,
        versions: contentVersions,
        variants: contentVariants,
      }));

      const { error } = await supabase
        .from("writing_forge_content")
        .insert([{
          user_id: user.id,
          content_type: selectedType,
          title: formData.title,
          brief: formData.brief,
          tone: formData.tone,
          target_audience: formData.targetAudience,
          keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean),
          generated_content: savedContent,
          status: "saved",
        }]);

      if (error) throw error;

      toast.success("Content saved with all versions and variants!");
      resetCreateState();
      fetchContents();
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    }
  };

  const resetCreateState = () => {
    setActiveView("list");
    setSelectedType(null);
    setFormData(initialFormData);
    setGeneratedContent(null);
    setContentVersions([]);
    setContentVariants([]);
    setActiveVariant("original");
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("writing_forge_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Content deleted");
      setSelectedContent(null);
      setActiveView("list");
      fetchContents();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  return {
    // State
    contents,
    loading,
    activeView,
    selectedType,
    generating,
    selectedContent,
    copiedField,
    generatingVariant,
    showVersionHistory,
    activeVariant,
    compareMode,
    compareLeft,
    compareRight,
    formData,
    generatedContent,
    contentVersions,
    contentVariants,
    user,
    
    // Setters
    setActiveView,
    setSelectedType,
    setSelectedContent,
    setShowVersionHistory,
    setActiveVariant,
    setCompareLeft,
    setCompareRight,
    setFormData,
    
    // Actions
    handleGenerate,
    handleGenerateVariant,
    restoreVersion,
    deleteVariant,
    getActiveContent,
    getContentById,
    getContentLabel,
    toggleCompareMode,
    handleSave,
    handleCopy,
    handleDelete,
    resetCreateState,
  };
}
