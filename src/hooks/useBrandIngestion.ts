import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IngestionProduct {
  name: string;
  category: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  description?: string;
  image?: string;
  images?: string[];
  inStock?: boolean;
  variants?: string[];
  tags?: string[];
  url?: string;
}

export interface IngestionBrandDNA {
  voice: {
    toneSpectrum: Record<string, number>;
    vocabulary: { preferred: string[]; avoided: string[] };
    emotionalSignature: string[];
    communicationPatterns: string[];
    sentenceStyle: string;
  };
  personality: {
    archetype: string | null;
    secondaryArchetype: string | null;
    traits: string[];
    values: string[];
    emotionalTone: string | null;
  };
  story: {
    mission: string | null;
    vision: string | null;
    tagline: string | null;
    origin: string | null;
    enemyStatement: string | null;
    transformationPromise: string | null;
  };
  guardrails: {
    forbiddenWords: string[];
    avoidTopics: string[];
    toneAvoid: string[];
    visualAvoid: string[];
    competitorMentions: boolean;
    enabled: boolean;
  };
}

export interface IngestionState {
  url: string;
  phase: string;
  brandName: string | null;
  colors: Record<string, string>;
  products: IngestionProduct[];
  taxonomy: string[];
  brandDNA: IngestionBrandDNA;
  metadata: Record<string, any>;
  pagesScanned: number;
  errors: string[];
}

export interface ProgressUpdate {
  message: string;
  step: string;
  progress: number;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolResults?: any[];
}

export interface ReviewRequest {
  section: string;
  message: string;
  data: any;
}

const createInitialState = (url: string): IngestionState => ({
  url,
  phase: "initializing",
  brandName: null,
  colors: {},
  products: [],
  taxonomy: [],
  brandDNA: {
    voice: {
      toneSpectrum: { formal: 50, casual: 50, professional: 50, friendly: 50, authoritative: 50, playful: 50 },
      vocabulary: { preferred: [], avoided: [] },
      emotionalSignature: [],
      communicationPatterns: [],
      sentenceStyle: "medium"
    },
    personality: { archetype: null, secondaryArchetype: null, traits: [], values: [], emotionalTone: null },
    story: { mission: null, vision: null, tagline: null, origin: null, enemyStatement: null, transformationPromise: null },
    guardrails: { forbiddenWords: [], avoidTopics: [], toneAvoid: [], visualAvoid: [], competitorMentions: false, enabled: true }
  },
  metadata: {},
  pagesScanned: 0,
  errors: []
});

export function useBrandIngestion() {
  const [state, setState] = useState<IngestionState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [reviewRequest, setReviewRequest] = useState<ReviewRequest | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [completeSummary, setCompleteSummary] = useState("");
  
  const conversationRef = useRef<any[]>([]);
  const abortRef = useRef(false);

  const addProgressUpdate = useCallback((update: Omit<ProgressUpdate, "timestamp">) => {
    const fullUpdate = { ...update, timestamp: new Date() };
    setProgressUpdates(prev => [...prev, fullUpdate]);
    setCurrentProgress(update.progress);
    setCurrentStep(update.step);
  }, []);

  const addChatMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    const fullMessage = { 
      ...message, 
      id: crypto.randomUUID(),
      timestamp: new Date() 
    };
    setChatMessages(prev => [...prev, fullMessage]);
  }, []);

  const callAgent = useCallback(async (
    action: "start" | "continue",
    url?: string,
    userInput?: string,
    reviewedData?: { section: string; data: any }
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("brand-ingestion-agent", {
        body: {
          action,
          url,
          messages: conversationRef.current,
          state: state || (url ? createInitialState(url) : null),
          userInput,
          reviewedData
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Agent call failed");

      // Update state
      if (data.state) {
        setState(data.state);
      }

      // Update conversation history
      if (data.conversationMessages) {
        conversationRef.current = data.conversationMessages;
      }

      // Add assistant message to chat
      if (data.assistantMessage) {
        addChatMessage({ role: "assistant", content: data.assistantMessage });
      }

      // Handle progress updates
      if (data.progressUpdates) {
        for (const update of data.progressUpdates) {
          addProgressUpdate({
            message: update.message,
            step: update.step,
            progress: update.progress
          });
        }
      }

      // Handle review request
      if (data.requiresUserAction && data.reviewRequest) {
        setReviewRequest(data.reviewRequest);
        setIsPaused(true);
        addChatMessage({
          role: "assistant",
          content: data.reviewRequest.message
        });
      }

      // Handle completion
      if (data.isComplete) {
        setIsComplete(true);
        setCompleteSummary(data.completeSummary || "Brand ingestion complete!");
        setIsRunning(false);
        addProgressUpdate({
          message: "Ingestion complete!",
          step: "complete",
          progress: 100
        });
      }

      return data;
    } catch (error: any) {
      console.error("Agent call error:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error(error.message || "Failed to process ingestion step");
      }
      throw error;
    }
  }, [state, addChatMessage, addProgressUpdate]);

  const startIngestion = useCallback(async (url: string) => {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    // Reset state
    setState(createInitialState(normalizedUrl));
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    setCompleteSummary("");
    setProgressUpdates([]);
    setChatMessages([]);
    setReviewRequest(null);
    conversationRef.current = [];
    abortRef.current = false;

    addProgressUpdate({
      message: "Starting brand ingestion...",
      step: "initializing",
      progress: 5
    });

    addChatMessage({
      role: "system",
      content: `Starting ingestion for ${normalizedUrl}. I'll guide you through each step and pause for your review at key checkpoints.`
    });

    try {
      await callAgent("start", normalizedUrl);
      
      // Continue the agentic loop until paused, complete, or aborted
      while (!abortRef.current && !isPaused && !isComplete) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between steps
        
        if (abortRef.current || isPaused || isComplete) break;
        
        const result = await callAgent("continue");
        
        if (result.requiresUserAction || result.isComplete) {
          break;
        }
      }
    } catch (error) {
      setIsRunning(false);
      addProgressUpdate({
        message: "Ingestion failed. Check console for details.",
        step: "error",
        progress: currentProgress
      });
    }
  }, [callAgent, addProgressUpdate, addChatMessage, currentProgress, isPaused, isComplete]);

  const pauseIngestion = useCallback(() => {
    setIsPaused(true);
    abortRef.current = true;
    addChatMessage({
      role: "system",
      content: "Ingestion paused. You can review and edit the data, then click continue to resume."
    });
  }, [addChatMessage]);

  const resumeIngestion = useCallback(async () => {
    setIsPaused(false);
    setReviewRequest(null);
    abortRef.current = false;

    addChatMessage({
      role: "system",
      content: "Resuming ingestion..."
    });

    try {
      const result = await callAgent("continue");
      
      // Continue the loop
      while (!abortRef.current && !result.requiresUserAction && !result.isComplete) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (abortRef.current) break;
        
        const nextResult = await callAgent("continue");
        if (nextResult.requiresUserAction || nextResult.isComplete) break;
      }
    } catch (error) {
      console.error("Resume error:", error);
    }
  }, [callAgent, addChatMessage]);

  const sendChatMessage = useCallback(async (message: string) => {
    addChatMessage({ role: "user", content: message });
    
    try {
      await callAgent("continue", undefined, message);
    } catch (error) {
      console.error("Chat message error:", error);
    }
  }, [callAgent, addChatMessage]);

  const submitReview = useCallback(async (section: string, data: any) => {
    setReviewRequest(null);
    setIsPaused(false);

    addChatMessage({
      role: "user",
      content: `I've reviewed and updated the ${section}. Please continue.`
    });

    // Update local state with reviewed data
    setState(prev => {
      if (!prev) return prev;
      
      switch (section) {
        case "colors":
          return { ...prev, colors: data };
        case "products":
          return { ...prev, products: data };
        case "taxonomy":
          return { ...prev, taxonomy: data };
        case "brandVoice":
          return { ...prev, brandDNA: { ...prev.brandDNA, voice: data } };
        case "brandStory":
          return { ...prev, brandDNA: { ...prev.brandDNA, story: data } };
        case "brandPersonality":
          return { ...prev, brandDNA: { ...prev.brandDNA, personality: data } };
        case "guardrails":
          return { ...prev, brandDNA: { ...prev.brandDNA, guardrails: data } };
        default:
          return prev;
      }
    });

    try {
      await callAgent("continue", undefined, undefined, { section, data });
      
      // Continue the loop
      while (!abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (abortRef.current) break;
        
        const result = await callAgent("continue");
        if (result.requiresUserAction || result.isComplete) break;
      }
    } catch (error) {
      console.error("Submit review error:", error);
    }
  }, [callAgent, addChatMessage]);

  const updateStateField = useCallback(<K extends keyof IngestionState>(
    field: K, 
    value: IngestionState[K]
  ) => {
    setState(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const stopIngestion = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
    addChatMessage({
      role: "system",
      content: "Ingestion stopped."
    });
  }, [addChatMessage]);

  return {
    state,
    isRunning,
    isPaused,
    isComplete,
    completeSummary,
    progressUpdates,
    chatMessages,
    currentProgress,
    currentStep,
    reviewRequest,
    startIngestion,
    pauseIngestion,
    resumeIngestion,
    stopIngestion,
    sendChatMessage,
    submitReview,
    updateStateField
  };
}
