import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";


export type OnboardingStep = 'input' | 'scanning' | 'analyzing' | 'rejected' | 'success';

export interface BrandVoice {
  toneSpectrum: {
    formal: number;
    casual: number;
    professional: number;
    friendly: number;
    authoritative: number;
    playful: number;
  };
  vocabulary: {
    preferred: string[];
    avoided: string[];
  };
  emotionalSignature: string[];
  communicationPatterns: string[];
  sentenceStyle: string;
}

export interface BrandPersonality {
  archetype: string | null;
  secondaryArchetype: string | null;
  traits: string[];
  values: string[];
  emotionalTone: string | null;
}

export interface BrandStory {
  mission: string | null;
  vision: string | null;
  tagline: string | null;
  origin: string | null;
  enemyStatement: string | null;
  transformationPromise: string | null;
}

export interface BrandGuardrails {
  forbiddenWords: string[];
  avoidTopics: string[];
  toneAvoid: string[];
  visualAvoid: string[];
  competitorMentions: boolean;
  enabled: boolean;
}

export interface BrandDNA {
  voice: BrandVoice;
  personality: BrandPersonality;
  story: BrandStory;
  guardrails: BrandGuardrails;
}

export interface ScanResult {
  isBrand: boolean;
  brandName: string;
  confidence: number;
  reason: string;
  branding: {
    logo: string | null;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
  };
  taxonomy: string[];
  products: { name: string; category: string }[];
  brandDNA?: BrandDNA;
}

export function useLandingOnboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [brandUrl, setBrandUrl] = useState("");
  const [step, setStep] = useState<OnboardingStep>('input');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAccessRequestForm, setShowAccessRequestForm] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      checkExistingOrg();
    }
  }, [user, authLoading]);

  const checkExistingOrg = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile?.org_id) {
      navigate('/dashboard');
    }
  };

  const handleScanWebsite = async () => {
    if (!brandUrl.trim()) {
      toast.error("Please enter your brand's website URL");
      return;
    }

    setStep('scanning');

    try {
      const { data, error } = await supabase.functions.invoke('scan-website', {
        body: { url: brandUrl }
      });

      if (error) throw error;

      setStep('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!data.isBrand || !data.products || data.products.length === 0) {
        setScanResult({
          ...data,
          isBrand: false,
          reason: data.reason || "We couldn't identify this as a brand with products or services for sale."
        });
        setStep('rejected');
        return;
      }

      setScanResult(data);
      setStep('success');
      setShowRegistrationModal(true);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error("Failed to scan website. Please try again.");
      setStep('input');
    }
  };

  const handleRegister = async (email: string, password: string, brandName?: string, editedBrandDNA?: BrandDNA) => {
    if (!scanResult) return;
    
    // Use edited DNA if provided, otherwise use original scan result
    const finalDNA = editedBrandDNA || scanResult.brandDNA;

    // Domain validation disabled for testing
    // if (!emailMatchesDomain(email, brandUrl)) {
    //   toast.error("Please use an email from your brand's domain");
    //   return;
    // }

    setIsRegistering(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      await new Promise(resolve => setTimeout(resolve, 500));

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          owner_id: authData.user.id,
          name: brandName || scanResult.brandName || 'My Brand',
          website_url: brandUrl,
          logo_url: scanResult.branding.logo,
          primary_color: scanResult.branding.colors.primary || '#6366f1',
          secondary_color: scanResult.branding.colors.secondary || '#8b5cf6',
          accent_color: scanResult.branding.colors.accent || '#ec4899',
          background_color: scanResult.branding.colors.background || '#0a0a0a',
          text_color: scanResult.branding.colors.text || '#ffffff',
          taxonomy: scanResult.taxonomy || [],
          products: scanResult.products || [],
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Build Brand DNA objects for database using finalDNA
      const brandVoice = finalDNA?.voice ? {
        analyzedAt: new Date().toISOString(),
        toneSpectrum: finalDNA.voice.toneSpectrum,
        vocabulary: finalDNA.voice.vocabulary,
        emotionalSignature: finalDNA.voice.emotionalSignature,
        communicationPatterns: finalDNA.voice.communicationPatterns,
        sentenceStyle: finalDNA.voice.sentenceStyle,
      } : undefined;

      const brandPersonality = finalDNA?.personality ? {
        archetype: finalDNA.personality.archetype,
        secondaryArchetype: finalDNA.personality.secondaryArchetype,
        traits: finalDNA.personality.traits,
        values: finalDNA.personality.values,
        emotionalTone: finalDNA.personality.emotionalTone,
        completedAt: finalDNA.personality.archetype ? new Date().toISOString() : null,
      } : undefined;

      const brandStory = finalDNA?.story || undefined;

      const brandGuardrails = finalDNA?.guardrails ? {
        ...finalDNA.guardrails,
        enabled: true,
      } : undefined;

      // Create brand from scan result with Brand DNA
      const brandInsertData: any = {
        org_id: orgData.id,
        name: brandName || scanResult.brandName || 'My Brand',
        website_url: brandUrl,
        logo_url: scanResult.branding.logo,
        primary_color: scanResult.branding.colors.primary || '#6366f1',
        secondary_color: scanResult.branding.colors.secondary || '#8b5cf6',
        accent_color: scanResult.branding.colors.accent || '#ec4899',
        background_color: scanResult.branding.colors.background || '#0a0a0a',
        text_color: scanResult.branding.colors.text || '#ffffff',
        taxonomy: scanResult.taxonomy || [],
        products: scanResult.products || [],
      };

      if (brandVoice) brandInsertData.brand_voice = brandVoice;
      if (brandPersonality) brandInsertData.brand_personality = brandPersonality;
      if (brandStory) brandInsertData.brand_story = brandStory;
      if (brandGuardrails) brandInsertData.brand_guardrails = brandGuardrails;

      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .insert(brandInsertData)
        .select()
        .single();

      if (brandError) {
        console.error('Brand creation error:', brandError);
        // Continue even if brand creation fails - we can create it later
      }

      // Update profile with org_id and active_brand_id
      await supabase
        .from('profiles')
        .update({ 
          org_id: orgData.id,
          active_brand_id: brandData?.id || null,
        })
        .eq('user_id', authData.user.id);

      // Create owner membership
      if (brandData) {
        await supabase
          .from('user_org_memberships')
          .insert({
            user_id: authData.user.id,
            org_id: orgData.id,
            role: 'owner',
            brand_access: [brandData.id],
          });
      }

      toast.success("Welcome aboard! Please verify your email to continue.");
      setShowRegistrationModal(false);
      navigate('/verify-email');
    } catch (error: any) {
      console.error('Account creation error:', error);
      if (error.message?.includes('already registered')) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setBrandUrl("");
    setScanResult(null);
    setShowRegistrationModal(false);
    setShowAccessRequestForm(false);
  };

  return {
    brandUrl,
    setBrandUrl,
    step,
    scanResult,
    isRegistering,
    showRegistrationModal,
    setShowRegistrationModal,
    showAccessRequestForm,
    setShowAccessRequestForm,
    handleScanWebsite,
    handleRegister,
    handleReset,
  };
}
