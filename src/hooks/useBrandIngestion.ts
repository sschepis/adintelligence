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

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/brand-ingestion-agent`;

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
  const [rawProfile, setRawProfile] = useState<any>(null);

  const abortRef = useRef<AbortController | null>(null);

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

  const startIngestion = useCallback(async (url: string) => {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    setState(createInitialState(normalizedUrl));
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    setCompleteSummary("");
    setProgressUpdates([]);
    setChatMessages([]);
    setReviewRequest(null);
    setRawProfile(null);

    addProgressUpdate({
      message: "Starting brand ingestion...",
      step: "initializing",
      progress: 5,
    });

    addChatMessage({
      role: "system",
      content: `Starting ingestion for ${normalizedUrl}. You'll see live progress updates as we detect the site platform, fetch products, and extract brand identity.`,
    });

    // Cancel any prior stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(FUNCTIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(apikey ? { apikey } : {}),
        },
        body: JSON.stringify({ action: "start", url: normalizedUrl }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Ingestion request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by a blank line
        let sepIndex: number;
        while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          const parsed = parseSseEvent(rawEvent);
          if (!parsed) continue;
          handleSseEvent(parsed);
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("[useBrandIngestion] SSE error:", error);
      toast.error(error.message || "Failed to ingest brand");
      addProgressUpdate({
        message: `Ingestion failed: ${error.message ?? "Unknown error"}`,
        step: "error",
        progress: currentProgress,
      });
      setIsRunning(false);
    }

    function handleSseEvent(evt: { event: string; data: any }) {
      if (evt.event === "phase") {
        addProgressUpdate({
          message: evt.data.message,
          step: evt.data.step,
          progress: evt.data.progress,
        });
      } else if (evt.event === "partial") {
        // Merge incremental data into current state so the right-side
        // preview populates progressively as fragments come in.
        setState(prev => {
          const base = prev ?? createInitialState("");
          const partial = evt.data ?? {};
          return {
            ...base,
            brandName: partial.brandName ?? base.brandName,
            colors: partial.branding?.colors ?? base.colors,
            taxonomy: partial.taxonomy?.length ? partial.taxonomy : base.taxonomy,
            products: partial.products?.length ? partial.products : base.products,
            brandDNA: partial.brandDNA ? { ...base.brandDNA, ...partial.brandDNA } : base.brandDNA,
            metadata: { ...base.metadata, ...(partial.metadata ?? {}) },
            pagesScanned: partial.metadata?.productCount
              ? Math.max(base.pagesScanned, partial.metadata.productCount + 1)
              : base.pagesScanned,
          };
        });
      } else if (evt.event === "result") {
        if (evt.data.state) setState(evt.data.state);
        if (evt.data.rawProfile) setRawProfile(evt.data.rawProfile);
        const summary = evt.data.completeSummary || "Brand ingestion complete!";
        setCompleteSummary(summary);
        setIsComplete(true);
        setIsRunning(false);
        addChatMessage({ role: "assistant", content: summary });
        addProgressUpdate({ message: "Ingestion complete!", step: "complete", progress: 100 });
      } else if (evt.event === "error") {
        const message = evt.data?.message ?? "Unknown ingestion error";
        toast.error(message);
        addProgressUpdate({ message: `Error: ${message}`, step: "error", progress: currentProgress });
        setIsRunning(false);
      }
    }
  }, [addChatMessage, addProgressUpdate, currentProgress]);

  const pauseIngestion = useCallback(() => {
    setIsPaused(true);
    abortRef.current?.abort();
    addChatMessage({
      role: "system",
      content: "Ingestion paused. The current scan was cancelled.",
    });
  }, [addChatMessage]);

  const resumeIngestion = useCallback(async () => {
    // The new SSE pipeline is one-shot; resume == restart from the same URL.
    setIsPaused(false);
    if (state?.url) {
      await startIngestion(state.url);
    }
  }, [state?.url, startIngestion]);

  const sendChatMessage = useCallback(async (_message: string) => {
    addChatMessage({
      role: "system",
      content: "Chat is read-only during streaming ingestion.",
    });
  }, [addChatMessage]);

  const submitReview = useCallback(async (_section: string, _data: any) => {
    setReviewRequest(null);
    setIsPaused(false);
  }, []);

  const updateStateField = useCallback(<K extends keyof IngestionState>(
    field: K,
    value: IngestionState[K]
  ) => {
    setState(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const stopIngestion = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
    setIsPaused(false);
    addChatMessage({
      role: "system",
      content: "Ingestion stopped.",
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
    rawProfile,
    startIngestion,
    pauseIngestion,
    resumeIngestion,
    stopIngestion,
    sendChatMessage,
    submitReview,
    updateStateField
  };
}

function parseSseEvent(raw: string): { event: string; data: any } | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith(":")) continue; // comment / heartbeat
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (dataLines.length === 0) return null;
  const dataStr = dataLines.join("\n");
  try {
    return { event, data: JSON.parse(dataStr) };
  } catch {
    return { event, data: dataStr };
  }
}
