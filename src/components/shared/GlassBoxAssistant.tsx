import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, X, Minimize2, Loader2, Trash2, Plus, History, TrendingUp, BarChart3, Package, Zap, User, Bot } from "lucide-react";
import { useGlassBoxChat, GlassBoxContext } from "@/hooks/useGlassBoxChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Command Center",
  "/signals": "Signal Intelligence",
  "/commerce": "Commerce Loop",
  "/deployment": "Active Deployment",
  "/simulation": "Simulation Studio",
  "/writing-forge": "Writing Forge",
  "/visual-forge": "Visual Forge",
  "/settings": "Settings",
  "/profile": "Profile",
  "/brand-settings": "Brand Settings",
  "/analytics": "Analytics",
};

export function GlassBoxAssistant() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  
  const { messages, history, isLoading, sendMessage, clearMessages, startNewConversation, loadConversation, updateContext, context } = useGlassBoxChat();
  const { campaigns } = useCampaigns();
  const { savedTrends } = useSavedTrends();
  const { organization } = useOrganization();

  // Update context when page or data changes
  useEffect(() => {
    const fetchSimulations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from("simulation_results")
        .select("ad_headline, overall_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      return data || [];
    };

    const buildContext = async () => {
      const simulations = await fetchSimulations();
      
      const products = organization?.products as any[] || [];
      
      const newContext: GlassBoxContext = {
        currentPage: location.pathname,
        pageName: PAGE_NAMES[location.pathname] || "Unknown Page",
        campaigns: campaigns?.slice(0, 5).map(c => ({
          name: c.name,
          status: c.status,
          spent: c.spent,
          performance_score: c.performance_score || 0
        })),
        savedTrends: savedTrends?.slice(0, 5).map(t => ({
          trend_name: t.trend_name,
          platform: t.platform || "unknown",
          velocity: t.velocity || "unknown"
        })),
        recentSimulations: simulations.map(s => ({
          ad_headline: s.ad_headline,
          overall_score: s.overall_score || 0
        })),
        organizationProducts: products.slice(0, 10).map((p: any) => ({
          name: p.name || p.title || "Unknown",
          category: p.category || "Uncategorized"
        }))
      };
      
      updateContext(newContext);
    };

    buildContext();
  }, [location.pathname, campaigns, savedTrends, organization, updateContext]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen && isMinimized) {
          setIsMinimized(false);
        } else {
          setIsOpen(!isOpen);
        }
        return;
      }
      
      // Escape to close/minimize
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        if (!isMinimized) {
          setIsMinimized(true);
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary animate-scale-in hover:scale-105 transition-transform z-50 group"
        title="Open Glass Box (⌘K)"
      >
        <Sparkles className="h-6 w-6 text-primary-foreground" />
        <span className="absolute -top-8 right-0 px-2 py-1 text-xs font-medium bg-card border border-border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          ⌘K to open
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50 animate-scale-in overflow-hidden",
        isMinimized && "h-14"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-foreground">Glass Box</p>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Thinking..." : "AI Assistant"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* New Conversation Button */}
          <button
            onClick={startNewConversation}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title="New conversation"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* History Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md hover:bg-secondary transition-colors relative"
                title="Conversation history"
              >
                <History className="h-4 w-4 text-muted-foreground" />
                {history.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                    {history.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {history.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No previous conversations
                </div>
              ) : (
                <>
                  {history.slice(0, 5).map((conv) => (
                    <DropdownMenuItem 
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className="flex flex-col items-start gap-0.5 cursor-pointer"
                    >
                      <span className="text-sm font-medium truncate w-full">
                        {conv.preview}...
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conv.messages.length} messages
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {history.length > 5 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        +{history.length - 5} more conversations
                      </div>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button
            onClick={clearMessages}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <Minimize2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "animate-slide-up flex gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                    message.role === "assistant"
                      ? "bg-secondary/80 text-foreground border border-border/50"
                      : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-foreground/10">
                      <p className="text-xs text-foreground/60 mb-1.5">Sources:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {message.sources.map((source, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-md bg-background/80 text-foreground/80 font-medium border border-border/50"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="animate-slide-up flex gap-2 justify-start">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-secondary/80 border border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {context?.pageName || "Thinking"}...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Top trends", query: "What are the top trending signals right now?", icon: TrendingUp },
                { label: "Campaign status", query: "Show me my campaign performance summary", icon: BarChart3 },
                { label: "Inventory alerts", query: "Are there any inventory opportunities I should know about?", icon: Package },
                { label: "Quick wins", query: "What quick wins can I act on today?", icon: Zap },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    if (!isLoading) {
                      sendMessage(action.query);
                    }
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any data point..."
                disabled={isLoading}
                className="flex-1 h-10 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <Button 
                size="icon" 
                variant="gradient" 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
