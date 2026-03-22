import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, Mic, Brain, BookOpen, Shield, Download, 
  Sparkles, AlertTriangle, Wand2, Dna
} from "lucide-react";
import { BrandDNAHealthDashboard } from "@/components/brand/BrandDNAHealthDashboard";
import { BrandVoiceAnalyzer } from "@/components/brand/BrandVoiceAnalyzer";
import { BrandPersonalityQuiz } from "@/components/brand/BrandPersonalityQuiz";
import { BrandGuardrailsManager } from "@/components/brand/BrandGuardrailsManager";
import { BrandStoryEditor } from "@/components/brand/BrandStoryEditor";
import { BrandDNAExport } from "@/components/brand/BrandDNAExport";
import { BrandDNAOnboardingWizard } from "@/components/brand/BrandDNAOnboardingWizard";
import { BrandDNADriftMonitor } from "@/components/brand/BrandDNADriftMonitor";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { useBrandDNADrift } from "@/hooks/useBrandDNADrift";

export default function BrandDNA() {
  const [activeTab, setActiveTab] = useState("health");
  const [showWizard, setShowWizard] = useState(false);
  const { loading, getDNACompleteness } = useBrandDNA();
  const { getAlertsSummary } = useBrandDNADrift();
  
  const completeness = getDNACompleteness();
  const alertsSummary = getAlertsSummary();

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (showWizard) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[80vh]">
          <BrandDNAOnboardingWizard 
            onComplete={() => setShowWizard(false)}
            onSkip={() => setShowWizard(false)}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            icon={Dna}
            title="Brand DNA"
            description="Define and protect your brand's unique identity across all AI-generated content"
          />
          <div className="flex items-center gap-2">
            <Badge variant={completeness >= 80 ? "default" : completeness >= 50 ? "secondary" : "outline"}>
              {completeness}% Complete
            </Badge>
            {alertsSummary.high > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {alertsSummary.high} Alerts
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowWizard(true)}>
              <Wand2 className="h-4 w-4 mr-2" />
              Setup Wizard
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 w-full max-w-4xl">
            <TabsTrigger value="health" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="drift" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Drift</span>
              {alertsSummary.total > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {alertsSummary.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="personality" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Personality</span>
            </TabsTrigger>
            <TabsTrigger value="story" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Story</span>
            </TabsTrigger>
            <TabsTrigger value="guardrails" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Guardrails</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-6">
            <BrandDNAHealthDashboard />
          </TabsContent>

          <TabsContent value="drift" className="mt-6">
            <BrandDNADriftMonitor />
          </TabsContent>

          <TabsContent value="voice" className="mt-6">
            <BrandVoiceAnalyzer />
          </TabsContent>

          <TabsContent value="personality" className="mt-6">
            <BrandPersonalityQuiz />
          </TabsContent>

          <TabsContent value="story" className="mt-6">
            <BrandStoryEditor />
          </TabsContent>

          <TabsContent value="guardrails" className="mt-6">
            <BrandGuardrailsManager />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <BrandDNAExport />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
