import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GlassBoxMessage {
  role: "assistant" | "user";
  content: string;
  sources?: string[];
}

export interface GlassBoxConversation {
  id: string;
  messages: GlassBoxMessage[];
  createdAt: Date;
  preview: string;
}

export interface GlassBoxContext {
  currentPage: string;
  pageName: string;
  campaigns?: { name: string; status: string; spent: number; performance_score: number }[];
  savedTrends?: { trend_name: string; platform: string; velocity: string }[];
  recentSimulations?: { ad_headline: string; overall_score: number }[];
  organizationProducts?: { name: string; category: string }[];
}

const STORAGE_KEY = "glassbox_messages";
const HISTORY_KEY = "glassbox_history";

const INITIAL_MESSAGE: GlassBoxMessage = {
  role: "assistant",
  content: "Hello! I'm Glass Box, your AI assistant. I can help you understand trends, analyze campaigns, match inventory to signals, and find opportunities. What would you like to explore?",
  sources: ["Platform Data"],
};

const loadMessagesFromStorage = (): GlassBoxMessage[] => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load Glass Box messages:", e);
  }
  return [INITIAL_MESSAGE];
};

const saveMessagesToStorage = (messages: GlassBoxMessage[]) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save Glass Box messages:", e);
  }
};

const loadHistoryFromStorage = (): GlassBoxConversation[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }));
    }
  } catch (e) {
    console.error("Failed to load Glass Box history:", e);
  }
  return [];
};

const saveHistoryToStorage = (history: GlassBoxConversation[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10))); // Keep last 10 conversations
  } catch (e) {
    console.error("Failed to save Glass Box history:", e);
  }
};

export function useGlassBoxChat() {
  const [messages, setMessages] = useState<GlassBoxMessage[]>(loadMessagesFromStorage);
  const [history, setHistory] = useState<GlassBoxConversation[]>(loadHistoryFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<GlassBoxContext | null>(null);

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  const updateContext = useCallback((newContext: GlassBoxContext) => {
    setContext(newContext);
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: GlassBoxMessage = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("glass-box-chat", {
        body: {
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: GlassBoxMessage = {
        role: "assistant",
        content: data.content,
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("Glass Box error:", error);
      
      if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error("Failed to get response. Please try again.");
      }

      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, context]);

  const startNewConversation = useCallback(() => {
    // Save current conversation to history if it has more than just the initial message
    if (messages.length > 1) {
      const firstUserMessage = messages.find(m => m.role === "user");
      const newConversation: GlassBoxConversation = {
        id: crypto.randomUUID(),
        messages: [...messages],
        createdAt: new Date(),
        preview: firstUserMessage?.content.slice(0, 50) || "New conversation"
      };
      setHistory(prev => [newConversation, ...prev]);
    }
    
    // Clear current messages and start fresh
    setMessages([INITIAL_MESSAGE]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, [messages]);

  const loadConversation = useCallback((conversationId: string) => {
    const conversation = history.find(c => c.id === conversationId);
    if (conversation) {
      // Save current conversation first if it has content
      if (messages.length > 1) {
        const firstUserMessage = messages.find(m => m.role === "user");
        const currentConversation: GlassBoxConversation = {
          id: crypto.randomUUID(),
          messages: [...messages],
          createdAt: new Date(),
          preview: firstUserMessage?.content.slice(0, 50) || "Previous conversation"
        };
        setHistory(prev => [currentConversation, ...prev.filter(c => c.id !== conversationId)]);
      } else {
        // Just remove the loaded conversation from history
        setHistory(prev => prev.filter(c => c.id !== conversationId));
      }
      
      setMessages(conversation.messages);
    }
  }, [history, messages]);

  const clearMessages = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return {
    messages,
    history,
    isLoading,
    sendMessage,
    clearMessages,
    startNewConversation,
    loadConversation,
    clearHistory,
    updateContext,
    context
  };
}
