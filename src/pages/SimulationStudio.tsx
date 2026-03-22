import { useState, useEffect } from "react";
import { PageContainer, PageHeader, ApiStatusIndicator, GlassBoxAssistant, EmptyState } from "@/components/shared";
import { PersonaCard, type Persona } from "@/components/simulation/PersonaCard";
import { PersonaBuilder } from "@/components/simulation/PersonaBuilder";
import { PersonaTemplates } from "@/components/simulation/PersonaTemplates";
import { AdPreview, type AdCreative } from "@/components/simulation/AdPreview";
import { ReactionTimeline, type PersonaReaction, type TimelinePoint } from "@/components/simulation/ReactionTimeline";
import { FeedbackPanel, type FeedbackItem } from "@/components/simulation/FeedbackPanel";
import { SimulationResults } from "@/components/simulation/SimulationResults";
import { SimulationHistoryPanel } from "@/components/simulation/SimulationHistoryPanel";
import { CreativeBriefBuilder } from "@/components/creative/CreativeBriefBuilder";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulateFocusGroup } from "@/hooks/useSimulateFocusGroup";
import { useSimulationResults, SimulationResult } from "@/hooks/useSimulationResults";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { usePersonas } from "@/hooks/usePersonas";
import { Plus, RefreshCw, Wand2, Users, Shield, Sparkles, LayoutTemplate, Trash2 } from "lucide-react";

const emotionMap: Record<string, TimelinePoint["emotion"]> = {
  joy: "joy", interest: "interest", surprise: "surprise", neutral: "neutral",
  confusion: "confusion", skepticism: "skepticism", excited: "joy",
  curious: "interest", impressed: "surprise", doubtful: "skepticism",
};

const SimulationStudio = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [reactions, setReactions] = useState<PersonaReaction[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [aggregateMetrics, setAggregateMetrics] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>();
  const [currentCreative, setCurrentCreative] = useState<AdCreative | null>(null);
  const [personaBuilderOpen, setPersonaBuilderOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Omit<Persona, 'id' | 'selected'> | null>(null);
  const [activeTab, setActiveTab] = useState("focus-group");

  const { simulateFocusGroup, isLoading, simulation } = useSimulateFocusGroup();
  const { saveResult, refetch: refetchHistory } = useSimulationResults();
  const { trackPageView, trackAIGeneration } = useUsageTracking();
  const { brandDNA, loading: brandDNALoading } = useBrandDNA();
  const { personas, loading: personasLoading, savePersona, deletePersona, toggleSelection } = usePersonas();

  useEffect(() => {
    trackPageView("simulation_studio");
  }, []);

  const selectedPersonas = personas.filter(p => p.selected);

  const handleCreatePersona = async (personaData: Omit<Persona, 'id' | 'selected'>) => {
    await savePersona(personaData);
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (template: Omit<Persona, 'id' | 'selected'>) => {
    setSelectedTemplate(template);
    setTemplatesOpen(false);
    setPersonaBuilderOpen(true);
  };

  const resetSimulation = () => {
    setShowResults(false);
    setReactions([]);
    setFeedbackItems([]);
    setCurrentTime(0);
    setIsSaved(false);
    setCurrentCreative(null);
  };

  const runSimulation = async (creative: AdCreative) => {
    setIsRunning(true);
    setShowResults(false);
    setCurrentTime(0);
    setReactions([]);
    setFeedbackItems([]);
    setIsSaved(false);
    setAiRecommendation(undefined);
    setCurrentCreative(creative);

    trackAIGeneration("simulation_studio", "focus_group_simulation", { personaCount: selectedPersonas.length });

    const result = await simulateFocusGroup(`${creative.headline} - ${creative.description}`, creative.headline, selectedPersonas, brandDNA);

    if (result) {
      const mappedReactions: PersonaReaction[] = result.reactions?.map((r: any, index: number) => {
        const persona = selectedPersonas[r.personaIndex ?? index] || selectedPersonas[0];
        const timeline: TimelinePoint[] = (r.emotionalTimeline || []).map((e: any) => ({
          time: e.time || 0,
          emotion: emotionMap[e.emotion?.toLowerCase()] || "neutral",
          intensity: e.intensity || 60,
        }));
        if (timeline.length === 0) {
          timeline.push({ time: 0, emotion: "neutral", intensity: 60 }, { time: 10, emotion: "interest", intensity: 75 }, { time: 20, emotion: "joy", intensity: 85 });
        }
        return { persona, timeline, overallSentiment: r.overallSentiment || 70, likelyToBuy: r.purchaseIntent || 60, feedback: r.feedback || "Positive response overall." };
      }) || [];

      const mappedFeedback: FeedbackItem[] = result.reactions?.map((r: any, index: number) => ({
        persona: selectedPersonas[r.personaIndex ?? index] || selectedPersonas[0],
        sentiment: (r.overallSentiment || 70) >= 70 ? "positive" : (r.overallSentiment || 70) >= 50 ? "neutral" : "negative",
        feedback: r.feedback || "The ad resonated well with my preferences.",
        timestamp: `0:${((r.personaIndex ?? index) + 1) * 7}`,
        keyMoment: r.keyMoment,
        objection: r.objection,
      })) || [];

      setReactions(mappedReactions);
      setFeedbackItems(mappedFeedback);
      setAggregateMetrics(result.aggregateMetrics);
      setAiRecommendation(result.recommendation);
    }

    setIsRunning(false);
    setShowResults(true);
  };

  const handleSaveResults = async () => {
    if (!showResults || !aggregateMetrics || !currentCreative) return;
    setIsSaving(true);
    
    const { success } = await saveResult({
      ad_headline: currentCreative.headline,
      ad_body: currentCreative.description,
      personas: selectedPersonas.map(p => ({ name: p.name, occupation: p.occupation, traits: p.traits })),
      reactions: reactions.map(r => ({ persona: r.persona.name, sentiment: r.overallSentiment, feedback: r.feedback, purchaseIntent: r.likelyToBuy })),
      overall_score: aggregateMetrics?.averageSentiment || 78,
      recommendation: aiRecommendation,
    });

    setIsSaving(false);
    if (success) {
      setIsSaved(true);
      refetchHistory();
    }
  };

  const handleLoadResult = (result: SimulationResult) => {
    setShowResults(true);
    setAggregateMetrics({ averageSentiment: result.overall_score || 0, engagementRate: 80, averagePurchaseIntent: 60 });
    setAiRecommendation(result.recommendation || undefined);
    setIsSaved(true);
    setCurrentCreative({ headline: result.ad_headline, description: result.ad_body || "", type: "video" });
    
    if (result.reactions && Array.isArray(result.reactions)) {
      setFeedbackItems(result.reactions.map((r: any, index: number) => ({
        persona: { id: String(index), name: r.persona || "Unknown", avatar: "👤", age: "", occupation: "", income: "", traits: [], buyingBehavior: "", selected: true },
        sentiment: (r.sentiment || 70) >= 70 ? "positive" : (r.sentiment || 70) >= 50 ? "neutral" : "negative",
        feedback: r.feedback || "",
        timestamp: `0:${(index + 1) * 7}`,
      })));
    }
  };

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => setCurrentTime(prev => prev >= 30 ? 30 : prev + 0.5), 100);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const apiStatuses = [
    { name: "AI Simulation", available: true, icon: "🧠" },
    { name: "Brand DNA", available: !brandDNALoading && !!brandDNA, icon: "🧬" },
  ];

  const headerActions = (
    <>
      <ApiStatusIndicator apis={apiStatuses} />
      <Button variant="glass" size="sm" className="gap-2" onClick={resetSimulation}>
        <RefreshCw className="h-4 w-4" />
        Reset
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setTemplatesOpen(true)}>
        <LayoutTemplate className="h-4 w-4" />
        Templates
      </Button>
      <Button variant="gradient" size="sm" className="gap-2" onClick={() => setPersonaBuilderOpen(true)}>
        <Plus className="h-4 w-4" />
        Create Persona
      </Button>
    </>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Simulation Studio"
        description="AI-powered synthetic focus groups"
        actions={headerActions}
      />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-1">
              <TabsTrigger value="focus-group" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Users className="h-4 w-4" />
                Focus Group
              </TabsTrigger>
              <TabsTrigger value="creative-studio" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Wand2 className="h-4 w-4" />
                AI Creative Studio
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "focus-group" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-6">
                {/* Brand DNA Summary Card */}
                <div className="glass-card rounded-xl p-4 border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Brand DNA Active</h3>
                  </div>
                  
                  {brandDNA.personality?.archetype ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Personality</p>
                        <Badge variant="secondary" className="text-xs">
                          {brandDNA.personality.archetype}
                        </Badge>
                      </div>
                      {brandDNA.personality.traits && brandDNA.personality.traits.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Traits</p>
                          <div className="flex flex-wrap gap-1">
                            {brandDNA.personality.traits.slice(0, 3).map((trait) => (
                              <Badge key={trait} variant="outline" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {brandDNA.guardrails?.forbiddenWords && brandDNA.guardrails.forbiddenWords.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Shield className="h-3 w-3 text-destructive" />
                            <p className="text-xs text-muted-foreground">Guardrails</p>
                          </div>
                          <p className="text-xs text-muted-foreground/70">
                            {brandDNA.guardrails.forbiddenWords.length} forbidden words, {brandDNA.guardrails.avoidTopics?.length || 0} avoided topics
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No Brand DNA configured. Simulations will use default settings.
                    </p>
                  )}
                </div>

                <div>
                  <SectionHeader title="Focus Group" subtitle={`${selectedPersonas.length} selected`} />
                  {personasLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                    </div>
                  ) : personas.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No personas yet"
                      description="Create personas to simulate audience reactions"
                      action={
                        <div className="flex flex-col gap-2">
                          <Button variant="gradient" size="sm" onClick={() => setTemplatesOpen(true)} className="gap-2">
                            <LayoutTemplate className="h-4 w-4" />
                            Start from Template
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setPersonaBuilderOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create from Scratch
                          </Button>
                        </div>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {personas.map((persona, index) => (
                        <div key={persona.id} className="relative group">
                          <PersonaCard persona={persona} onSelect={() => toggleSelection(persona.id)} delay={index * 50} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePersona(persona.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <AdPreview onRunSimulation={runSimulation} isRunning={isLoading} selectedPersonaCount={selectedPersonas.length} />
                {(isLoading || showResults) && reactions.length > 0 && (
                  <ReactionTimeline reactions={reactions} duration={30} currentTime={currentTime} isPlaying={isLoading} />
                )}
                {showResults && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <FeedbackPanel feedbackItems={feedbackItems} />
                    <SimulationResults
                      overallScore={aggregateMetrics?.averageSentiment || 78}
                      engagementRate={aggregateMetrics?.engagementRate || 82}
                      purchaseIntent={aggregateMetrics?.averagePurchaseIntent || 64}
                      estimatedRevenue={`+$${Math.round((aggregateMetrics?.averagePurchaseIntent || 64) * 2)}K`}
                      recommendation={aiRecommendation}
                      onSave={handleSaveResults}
                      isSaving={isSaving}
                      isSaved={isSaved}
                    />
                  </div>
                )}
              </div>

              <div>
                <SimulationHistoryPanel onLoadResult={handleLoadResult} />
              </div>
            </div>
          )}

          {activeTab === "creative-studio" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CreativeBriefBuilder />
              </div>
              <div>
                <SimulationHistoryPanel onLoadResult={handleLoadResult} />
              </div>
            </div>
          )}

      <GlassBoxAssistant />
      <PersonaTemplates open={templatesOpen} onOpenChange={setTemplatesOpen} onSelectTemplate={handleSelectTemplate} />
      <PersonaBuilder 
        open={personaBuilderOpen} 
        onOpenChange={(open) => {
          setPersonaBuilderOpen(open);
          if (!open) setSelectedTemplate(null);
        }} 
        initialData={selectedTemplate}
        onSave={handleCreatePersona} 
      />
    </PageContainer>
  );
};

export default SimulationStudio;
