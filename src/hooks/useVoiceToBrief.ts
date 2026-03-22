import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/contexts/BrandContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface CampaignBrief {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  channels: string[];
  budget?: string;
  timeline?: string;
  creativeDirection: string;
  callToAction: string;
}

export interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  brief: CampaignBrief;
  createdAt: Date;
  category: 'product-launch' | 'seasonal' | 'awareness' | 'conversion' | 'engagement' | 'custom';
}

export interface SharedBrief {
  id: string;
  shareCode: string;
  title: string;
  brief: CampaignBrief;
  feedback: BriefFeedback[];
  createdAt: Date;
  expiresAt: Date;
  viewCount: number;
}

export interface BriefFeedback {
  id: string;
  author: string;
  comment: string;
  createdAt: Date;
  section?: string;
}

const STORAGE_KEY = 'brief-templates';

export function useVoiceToBrief() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [brief, setBrief] = useState<CampaignBrief | null>(null);
  const [templates, setTemplates] = useState<BriefTemplate[]>([]);
  const [sharedBriefs, setSharedBriefs] = useState<SharedBrief[]>([]);
  const [currentSharedBrief, setCurrentSharedBrief] = useState<SharedBrief | null>(null);
  const recognitionRef = useRef<any>(null);
  const { activeBrand } = useBrand();
  const { user } = useAuth();

  // Load templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setTemplates(parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      })));
    } else {
      setTemplates(getDefaultTemplates());
    }
  }, []);

  // Load user's shared briefs
  useEffect(() => {
    if (user) {
      loadSharedBriefs();
    }
  }, [user]);

  const loadSharedBriefs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shared_briefs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSharedBriefs(data?.map(sb => ({
        id: sb.id,
        shareCode: sb.share_code,
        title: sb.title,
        brief: sb.brief as unknown as CampaignBrief,
        feedback: (sb.feedback as unknown as BriefFeedback[]) || [],
        createdAt: new Date(sb.created_at),
        expiresAt: new Date(sb.expires_at || ''),
        viewCount: sb.view_count || 0
      })) || []);
    } catch (error) {
      console.error('Failed to load shared briefs:', error);
    }
  };

  const saveTemplates = (newTemplates: BriefTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
  };

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript + interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error(`Speech recognition error: ${event.error}`);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const generateBrief = async (input?: string) => {
    const textToProcess = input || transcript;
    if (!textToProcess.trim()) {
      toast.error('No input to process');
      return null;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-to-brief', {
        body: { 
          transcript: textToProcess,
          brandContext: {
            name: activeBrand?.name,
            voice: activeBrand?.brand_voice,
            personality: activeBrand?.brand_personality
          }
        }
      });

      if (error) throw error;

      setBrief(data.brief);
      toast.success('Campaign brief generated!');
      return data.brief;
    } catch (error) {
      console.error('Brief generation error:', error);
      toast.error('Failed to generate brief');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAsTemplate = (name: string, description: string, category: BriefTemplate['category'] = 'custom') => {
    if (!brief) {
      toast.error('No brief to save');
      return;
    }

    const newTemplate: BriefTemplate = {
      id: crypto.randomUUID(),
      name,
      description,
      brief: { ...brief },
      createdAt: new Date(),
      category
    };

    saveTemplates([newTemplate, ...templates]);
    toast.success('Template saved!');
    return newTemplate;
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setBrief({ ...template.brief });
      toast.success(`Loaded template: ${template.name}`);
    }
  };

  const deleteTemplate = (templateId: string) => {
    const updated = templates.filter(t => t.id !== templateId);
    saveTemplates(updated);
    toast.success('Template deleted');
  };

  const updateTemplate = (templateId: string, updates: Partial<BriefTemplate>) => {
    const updated = templates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    );
    saveTemplates(updated);
    toast.success('Template updated');
  };

  // Generate a short share code
  const generateShareCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const shareBrief = async (title?: string) => {
    if (!brief || !user) {
      toast.error('No brief to share or not logged in');
      return null;
    }

    try {
      const shareCode = generateShareCode();
      const { data, error } = await supabase
        .from('shared_briefs')
        .insert([{
          share_code: shareCode,
          user_id: user.id,
          org_id: activeBrand?.org_id,
          title: title || brief.title,
          brief: JSON.parse(JSON.stringify(brief))
        }])
        .select()
        .single();

      if (error) throw error;

      const sharedBrief: SharedBrief = {
        id: data.id,
        shareCode: data.share_code,
        title: data.title,
        brief: data.brief as unknown as CampaignBrief,
        feedback: [],
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at || ''),
        viewCount: 0
      };

      setSharedBriefs(prev => [sharedBrief, ...prev]);
      setCurrentSharedBrief(sharedBrief);
      
      const shareUrl = `${window.location.origin}/brief/${shareCode}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
      
      return sharedBrief;
    } catch (error) {
      console.error('Failed to share brief:', error);
      toast.error('Failed to create share link');
      return null;
    }
  };

  const loadSharedBrief = async (shareCode: string) => {
    try {
      const { data, error } = await supabase
        .from('shared_briefs')
        .select('*')
        .eq('share_code', shareCode)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('shared_briefs')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      const sharedBrief: SharedBrief = {
        id: data.id,
        shareCode: data.share_code,
        title: data.title,
        brief: data.brief as unknown as CampaignBrief,
        feedback: (data.feedback as unknown as BriefFeedback[]) || [],
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at || ''),
        viewCount: (data.view_count || 0) + 1
      };

      setBrief(sharedBrief.brief);
      setCurrentSharedBrief(sharedBrief);
      
      return sharedBrief;
    } catch (error) {
      console.error('Failed to load shared brief:', error);
      toast.error('Brief not found or has expired');
      return null;
    }
  };

  const addFeedback = async (shareCode: string, author: string, comment: string, section?: string) => {
    try {
      // Get current brief
      const { data: currentData, error: fetchError } = await supabase
        .from('shared_briefs')
        .select('feedback')
        .eq('share_code', shareCode)
        .single();

      if (fetchError) throw fetchError;

      const currentFeedback = (currentData.feedback as unknown as BriefFeedback[]) || [];
      const newFeedback: BriefFeedback = {
        id: crypto.randomUUID(),
        author,
        comment,
        createdAt: new Date(),
        section
      };

      const updatedFeedback = [...currentFeedback, newFeedback];

      const { error } = await supabase
        .from('shared_briefs')
        .update({ feedback: JSON.parse(JSON.stringify(updatedFeedback)) })
        .eq('share_code', shareCode);

      if (error) throw error;

      if (currentSharedBrief?.shareCode === shareCode) {
        setCurrentSharedBrief(prev => prev ? {
          ...prev,
          feedback: updatedFeedback
        } : null);
      }

      toast.success('Feedback added!');
      return newFeedback;
    } catch (error) {
      console.error('Failed to add feedback:', error);
      toast.error('Failed to add feedback');
      return null;
    }
  };

  const deleteSharedBrief = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_briefs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSharedBriefs(prev => prev.filter(sb => sb.id !== id));
      toast.success('Shared brief deleted');
    } catch (error) {
      console.error('Failed to delete shared brief:', error);
      toast.error('Failed to delete');
    }
  };

  const getShareUrl = (shareCode: string) => {
    return `${window.location.origin}/brief/${shareCode}`;
  };

  const clearBrief = () => {
    setBrief(null);
    setTranscript("");
    setCurrentSharedBrief(null);
  };

  return {
    isListening,
    isProcessing,
    transcript,
    brief,
    templates,
    sharedBriefs,
    currentSharedBrief,
    startListening,
    stopListening,
    generateBrief,
    saveAsTemplate,
    loadTemplate,
    deleteTemplate,
    updateTemplate,
    shareBrief,
    loadSharedBrief,
    addFeedback,
    deleteSharedBrief,
    getShareUrl,
    clearBrief,
    setTranscript,
    setBrief
  };
}

function getDefaultTemplates(): BriefTemplate[] {
  return [
    {
      id: 'default-product-launch',
      name: 'Product Launch',
      description: 'Template for launching new products',
      category: 'product-launch',
      createdAt: new Date(),
      brief: {
        title: 'New Product Launch Campaign',
        objective: 'Drive awareness and initial sales for new product launch',
        targetAudience: 'Early adopters and existing customers interested in innovation',
        keyMessages: ['Introducing the next generation', 'Be the first to experience', 'Limited launch offer'],
        channels: ['Instagram', 'TikTok', 'Email', 'Paid Social'],
        budget: '$5,000 - $10,000',
        timeline: '4 weeks',
        creativeDirection: 'Bold, innovative visuals showcasing product features with lifestyle imagery',
        callToAction: 'Shop Now'
      }
    },
    {
      id: 'default-seasonal',
      name: 'Seasonal Promotion',
      description: 'Template for holiday and seasonal campaigns',
      category: 'seasonal',
      createdAt: new Date(),
      brief: {
        title: 'Seasonal Sale Campaign',
        objective: 'Maximize sales during peak seasonal period',
        targetAudience: 'Gift buyers and bargain hunters',
        keyMessages: ['Seasonal savings', 'Perfect gift ideas', 'Limited time offer'],
        channels: ['Email', 'Paid Search', 'Social Media', 'Display Ads'],
        budget: '$3,000 - $8,000',
        timeline: '2-3 weeks',
        creativeDirection: 'Festive, warm imagery with clear promotional messaging',
        callToAction: 'Shop the Sale'
      }
    },
    {
      id: 'default-awareness',
      name: 'Brand Awareness',
      description: 'Template for building brand recognition',
      category: 'awareness',
      createdAt: new Date(),
      brief: {
        title: 'Brand Awareness Campaign',
        objective: 'Increase brand recognition and reach new audiences',
        targetAudience: 'Potential customers who fit brand demographics but are unfamiliar with the brand',
        keyMessages: ['Discover our story', 'Join our community', 'Experience the difference'],
        channels: ['YouTube', 'Instagram', 'Influencer Partnerships', 'PR'],
        budget: '$10,000+',
        timeline: '8-12 weeks',
        creativeDirection: 'Storytelling-focused content highlighting brand values and lifestyle',
        callToAction: 'Learn More'
      }
    }
  ];
}

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
