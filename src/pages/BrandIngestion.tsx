import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Globe, Palette, Package, Brain, MessageSquare, 
  Play, Pause, Send, Check, ChevronRight, AlertCircle,
  Edit3, Save, X, Plus, Trash2, RefreshCw, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBrandIngestion, IngestionProduct, IngestionState } from "@/hooks/useBrandIngestion";
import { cn } from "@/lib/utils";

// Progress Steps Definition
const INGESTION_STEPS = [
  { id: "initializing", label: "Starting", icon: Sparkles },
  { id: "homepage", label: "Homepage", icon: Globe },
  { id: "mapping", label: "Site Map", icon: Globe },
  { id: "products", label: "Products", icon: Package },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "voice", label: "Brand Voice", icon: Brain },
  { id: "complete", label: "Complete", icon: Check },
];

export default function BrandIngestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get("url") || "";
  
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [activeTab, setActiveTab] = useState("progress");
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
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
  } = useBrandIngestion();

  // Auto-start if URL is provided
  useEffect(() => {
    if (initialUrl && !state && !isRunning) {
      startIngestion(initialUrl);
    }
  }, [initialUrl, state, isRunning, startIngestion]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleStart = () => {
    if (!urlInput.trim()) return;
    startIngestion(urlInput);
  };

  const handleChatSend = () => {
    const value = chatInputRef.current?.value?.trim();
    if (!value) return;
    sendChatMessage(value);
    if (chatInputRef.current) chatInputRef.current.value = "";
  };

  // If no URL and no state, show URL input
  if (!state && !isRunning) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl"
        >
          <Card className="border-border/50 bg-card/90 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-display">Brand Ingestion</CardTitle>
              <p className="text-muted-foreground mt-2">
                Enter your brand's website URL to begin the comprehensive ingestion process
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="yourbrand.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  className="flex-1 h-12 text-lg"
                />
                <Button 
                  size="lg" 
                  variant="gradient"
                  onClick={handleStart}
                  className="h-12 px-6"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              </div>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-lg">
                {state?.brandName || "Brand Ingestion"}
              </h1>
              <p className="text-sm text-muted-foreground">{state?.url}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isRunning && !isPaused && (
              <Button variant="outline" onClick={pauseIngestion}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button variant="gradient" onClick={resumeIngestion}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            {isComplete && (
              <Button variant="gradient" onClick={() => navigate("/dashboard")}>
                <Check className="w-4 h-4 mr-2" />
                Finish
              </Button>
            )}
            {(isRunning || isPaused) && !isComplete && (
              <Button variant="ghost" onClick={stopIngestion}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        {/* Progress Bar */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2 mb-4" />
            
            <div className="flex items-center justify-between">
              {INGESTION_STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isPast = INGESTION_STEPS.findIndex(s => s.id === currentStep) > index;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                      isActive && "bg-primary text-primary-foreground",
                      isPast && "bg-primary/20 text-primary",
                      !isActive && !isPast && "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {index < INGESTION_STEPS.length - 1 && (
                      <ChevronRight className={cn(
                        "w-4 h-4 mx-1",
                        isPast ? "text-primary/50" : "text-muted-foreground/30"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Chat */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="progress">Progress Log</TabsTrigger>
                <TabsTrigger value="chat">
                  AI Chat
                  {reviewRequest && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="progress" className="mt-4">
                <Card className="h-[500px] flex flex-col">
                  <CardHeader className="py-3 border-b border-border/50">
                    <CardTitle className="text-sm font-medium">Ingestion Progress</CardTitle>
                  </CardHeader>
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                      <AnimatePresence mode="popLayout">
                        {progressUpdates.map((update, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                              update.step === "error" ? "bg-destructive" : "bg-primary"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{update.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {update.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {update.progress}%
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {isRunning && !isPaused && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-4">
                <Card className="h-[500px] flex flex-col">
                  <CardHeader className="py-3 border-b border-border/50">
                    <CardTitle className="text-sm font-medium">Chat with AI Assistant</CardTitle>
                  </CardHeader>
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            message.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : message.role === "system"
                              ? "bg-muted text-muted-foreground italic"
                              : "bg-secondary border border-border/50"
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-border/50">
                    <div className="flex gap-2">
                      <Input
                        ref={chatInputRef}
                        placeholder="Ask about the ingestion or give instructions..."
                        onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                        disabled={!isRunning && !isPaused}
                      />
                      <Button 
                        size="icon" 
                        variant="gradient"
                        onClick={handleChatSend}
                        disabled={!isRunning && !isPaused}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Data Preview & Edit */}
          <div className="space-y-6">
            {/* Review Request Alert */}
            {reviewRequest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      Review Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-3">{reviewRequest.message}</p>
                    <Button 
                      size="sm" 
                      variant="gradient"
                      onClick={() => submitReview(reviewRequest.section, reviewRequest.data)}
                    >
                      Approve & Continue
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Brand Colors */}
            {state?.colors && Object.keys(state.colors).length > 0 && (
              <DataCard
                title="Brand Colors"
                icon={Palette}
                live={isRunning}
              >
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(state.colors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <div 
                        className="w-6 h-6 rounded border border-border"
                        style={{ backgroundColor: value }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium capitalize truncate">{key}</p>
                        <p className="text-xs text-muted-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DataCard>
            )}

            {/* Products Summary */}
            {state?.products && state.products.length > 0 && (
              <DataCard
                title={`Products (${state.products.length})`}
                icon={Package}
                live={isRunning}
              >
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                  {state.products.slice(0, 5).map((product, index) => (
                    <motion.div
                      key={`${product.name}-${index}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                    >
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.price ? `$${product.price}` : "No price"} · {product.category}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                  {state.products.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{state.products.length - 5} more products
                    </p>
                  )}
                </div>
              </DataCard>
            )}

            {/* Brand DNA Preview */}
            {state?.brandDNA && (
              <DataCard
                title="Brand DNA"
                icon={Brain}
                live={isRunning}
              >
                <div className="space-y-3">
                  {state.brandDNA.personality.archetype && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Archetype</p>
                      <Badge variant="secondary">{state.brandDNA.personality.archetype}</Badge>
                    </div>
                  )}
                  
                  {state.brandDNA.personality.traits.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Traits</p>
                      <div className="flex flex-wrap gap-1">
                        <AnimatePresence initial={false}>
                        {state.brandDNA.personality.traits.slice(0, 5).map((trait, i) => (
                          <motion.div key={trait} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
                            <Badge variant="outline" className="text-xs">{trait}</Badge>
                          </motion.div>
                        ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {state.brandDNA.voice.emotionalSignature.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Emotional Signature</p>
                      <div className="flex flex-wrap gap-1">
                        <AnimatePresence initial={false}>
                        {state.brandDNA.voice.emotionalSignature.slice(0, 3).map((sig, i) => (
                          <motion.div key={sig} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
                            <Badge variant="outline" className="text-xs">{sig}</Badge>
                          </motion.div>
                        ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              </DataCard>
            )}

            {/* Taxonomy */}
            {state?.taxonomy && state.taxonomy.length > 0 && (
              <DataCard
                title="Categories"
                icon={Package}
                live={isRunning}
              >
                <div className="flex flex-wrap gap-1">
                  <AnimatePresence initial={false}>
                  {state.taxonomy.map((cat, index) => (
                    <motion.div key={cat} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
                      <Badge variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              </DataCard>
            )}

            {/* Stats */}
            <DataCard
              title="Statistics"
              icon={Sparkles}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-2xl font-display font-bold">{state?.pagesScanned || 0}</p>
                  <p className="text-xs text-muted-foreground">Pages Scanned</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-2xl font-display font-bold">{state?.products?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Products Found</p>
                </div>
              </div>
            </DataCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for data cards
function DataCard({
  title,
  icon: Icon,
  children,
  live = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  live?: boolean;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="py-3 border-b border-border/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="flex-1">{title}</span>
          {live && (
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        {children}
      </CardContent>
    </Card>
  );
}
