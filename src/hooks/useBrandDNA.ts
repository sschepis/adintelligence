import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/contexts/BrandContext";
import { toast } from "sonner";

export interface ToneSpectrum {
  formal: number;
  playful: number;
  authoritative: number;
  friendly: number;
  professional: number;
  casual: number;
}

export interface BrandVoice {
  toneSpectrum: ToneSpectrum;
  vocabulary: {
    preferred: string[];
    avoided: string[];
  };
  sentenceStyle: "short" | "medium" | "long";
  emotionalSignature: string[];
  communicationPatterns: string[];
  voiceSummary?: string;
  uniqueTraits?: string[];
  analyzedAt: string | null;
}

export interface BrandPersonality {
  archetype: string | null;
  secondaryArchetype: string | null;
  traits: string[];
  values: string[];
  emotionalTone: string | null;
  completedAt: string | null;
}

export interface BrandStory {
  origin: string | null;
  mission: string | null;
  vision: string | null;
  enemyStatement: string | null;
  transformationPromise: string | null;
  tagline: string | null;
}

export interface BrandGuardrails {
  forbiddenWords: string[];
  avoidTopics: string[];
  visualAvoid: string[];
  toneAvoid: string[];
  competitorMentions: boolean;
  enabled: boolean;
}

export interface BrandDNAScore {
  overall: number | null;
  voiceAlignment: number | null;
  personalityAlignment: number | null;
  guardrailsCompliance: number | null;
  lastCalculated: string | null;
  scoreHistory: Array<{ date: string; score: number }>;
  driftAlerts: Array<{ date: string; message: string; severity: string }>;
}

export interface BrandDNA {
  voice: BrandVoice;
  personality: BrandPersonality;
  story: BrandStory;
  guardrails: BrandGuardrails;
  score: BrandDNAScore;
}

const defaultBrandDNA: BrandDNA = {
  voice: {
    toneSpectrum: { formal: 50, playful: 50, authoritative: 50, friendly: 50, professional: 50, casual: 50 },
    vocabulary: { preferred: [], avoided: [] },
    sentenceStyle: "medium",
    emotionalSignature: [],
    communicationPatterns: [],
    analyzedAt: null
  },
  personality: {
    archetype: null,
    secondaryArchetype: null,
    traits: [],
    values: [],
    emotionalTone: null,
    completedAt: null
  },
  story: {
    origin: null,
    mission: null,
    vision: null,
    enemyStatement: null,
    transformationPromise: null,
    tagline: null
  },
  guardrails: {
    forbiddenWords: [],
    avoidTopics: [],
    visualAvoid: [],
    toneAvoid: [],
    competitorMentions: false,
    enabled: true
  },
  score: {
    overall: null,
    voiceAlignment: null,
    personalityAlignment: null,
    guardrailsCompliance: null,
    lastCalculated: null,
    scoreHistory: [],
    driftAlerts: []
  }
};

export function useBrandDNA() {
  const { activeBrand } = useBrand();
  const [brandDNA, setBrandDNA] = useState<BrandDNA>(defaultBrandDNA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBrandDNA = useCallback(async () => {
    if (!activeBrand) {
      setLoading(false);
      return;
    }

    try {
      setBrandDNA({
        voice: (activeBrand.brand_voice as unknown as BrandVoice) || defaultBrandDNA.voice,
        personality: (activeBrand.brand_personality as unknown as BrandPersonality) || defaultBrandDNA.personality,
        story: (activeBrand.brand_story as unknown as BrandStory) || defaultBrandDNA.story,
        guardrails: (activeBrand.brand_guardrails as unknown as BrandGuardrails) || defaultBrandDNA.guardrails,
        score: (activeBrand.brand_dna_score as unknown as BrandDNAScore) || defaultBrandDNA.score
      });
    } catch (error) {
      console.error('Error fetching brand DNA:', error);
    } finally {
      setLoading(false);
    }
  }, [activeBrand]);

  useEffect(() => {
    fetchBrandDNA();
  }, [fetchBrandDNA]);

  const updateVoice = async (voice: Partial<BrandVoice>) => {
    if (!activeBrand) return;
    setSaving(true);
    try {
      const updatedVoice = { ...brandDNA.voice, ...voice };
      const { error } = await supabase
        .from('brands')
        .update({ brand_voice: updatedVoice as any })
        .eq('id', activeBrand.id);

      if (error) throw error;
      setBrandDNA(prev => ({ ...prev, voice: updatedVoice }));
      toast.success('Brand voice updated');
    } catch (error) {
      console.error('Error updating voice:', error);
      toast.error('Failed to update brand voice');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonality = async (personality: Partial<BrandPersonality>) => {
    if (!activeBrand) return;
    setSaving(true);
    try {
      const updatedPersonality = { ...brandDNA.personality, ...personality };
      const { error } = await supabase
        .from('brands')
        .update({ brand_personality: updatedPersonality as any })
        .eq('id', activeBrand.id);

      if (error) throw error;
      setBrandDNA(prev => ({ ...prev, personality: updatedPersonality }));
      toast.success('Brand personality updated');
    } catch (error) {
      console.error('Error updating personality:', error);
      toast.error('Failed to update brand personality');
    } finally {
      setSaving(false);
    }
  };

  const updateStory = async (story: Partial<BrandStory>) => {
    if (!activeBrand) return;
    setSaving(true);
    try {
      const updatedStory = { ...brandDNA.story, ...story };
      const { error } = await supabase
        .from('brands')
        .update({ brand_story: updatedStory as any })
        .eq('id', activeBrand.id);

      if (error) throw error;
      setBrandDNA(prev => ({ ...prev, story: updatedStory }));
      toast.success('Brand story updated');
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update brand story');
    } finally {
      setSaving(false);
    }
  };

  const updateGuardrails = async (guardrails: Partial<BrandGuardrails>) => {
    if (!activeBrand) return;
    setSaving(true);
    try {
      const updatedGuardrails = { ...brandDNA.guardrails, ...guardrails };
      const { error } = await supabase
        .from('brands')
        .update({ brand_guardrails: updatedGuardrails as any })
        .eq('id', activeBrand.id);

      if (error) throw error;
      setBrandDNA(prev => ({ ...prev, guardrails: updatedGuardrails }));
      toast.success('Brand guardrails updated');
    } catch (error) {
      console.error('Error updating guardrails:', error);
      toast.error('Failed to update brand guardrails');
    } finally {
      setSaving(false);
    }
  };

  const updateScore = async (score: Partial<BrandDNAScore>) => {
    if (!activeBrand) return;
    try {
      const updatedScore = { ...brandDNA.score, ...score };
      const { error } = await supabase
        .from('brands')
        .update({ brand_dna_score: updatedScore as any })
        .eq('id', activeBrand.id);

      if (error) throw error;
      setBrandDNA(prev => ({ ...prev, score: updatedScore }));
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const analyzeVoice = async (websiteContent: string, socialContent?: string, brandName?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-brand-voice', {
        body: { websiteContent, socialContent, brandName }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const voiceAnalysis = data.voiceAnalysis;
      await updateVoice({
        ...voiceAnalysis,
        analyzedAt: data.analyzedAt
      });

      return voiceAnalysis;
    } catch (error: any) {
      console.error('Error analyzing voice:', error);
      toast.error(error.message || 'Failed to analyze brand voice');
      throw error;
    }
  };

  const scoreConsistency = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('score-brand-consistency', {
        body: { content, brandDNA }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const consistencyScore = data.consistencyScore;
      
      // Update score history
      const newHistory = [
        ...(brandDNA.score.scoreHistory || []),
        { date: data.scoredAt, score: consistencyScore.overall }
      ].slice(-30); // Keep last 30 scores

      await updateScore({
        overall: consistencyScore.overall,
        voiceAlignment: consistencyScore.voiceAlignment,
        personalityAlignment: consistencyScore.personalityAlignment,
        guardrailsCompliance: consistencyScore.guardrailsCompliance,
        lastCalculated: data.scoredAt,
        scoreHistory: newHistory
      });

      return consistencyScore;
    } catch (error: any) {
      console.error('Error scoring consistency:', error);
      toast.error(error.message || 'Failed to score consistency');
      throw error;
    }
  };

  const getDNACompleteness = () => {
    let total = 0;
    let completed = 0;

    // Voice (20%)
    total += 20;
    if (brandDNA.voice.analyzedAt) completed += 20;

    // Personality (25%)
    total += 25;
    if (brandDNA.personality.archetype) completed += 25;

    // Story (25%)
    total += 25;
    const storyFields = ['origin', 'mission', 'vision', 'transformationPromise'];
    const filledStory = storyFields.filter(f => brandDNA.story[f as keyof BrandStory]).length;
    completed += (filledStory / storyFields.length) * 25;

    // Guardrails (30%)
    total += 30;
    const hasGuardrails = brandDNA.guardrails.forbiddenWords.length > 0 || 
                         brandDNA.guardrails.avoidTopics.length > 0;
    if (hasGuardrails) completed += 30;

    return Math.round((completed / total) * 100);
  };

  return {
    brandDNA,
    loading,
    saving,
    updateVoice,
    updatePersonality,
    updateStory,
    updateGuardrails,
    updateScore,
    analyzeVoice,
    scoreConsistency,
    getDNACompleteness,
    refetch: fetchBrandDNA
  };
}
