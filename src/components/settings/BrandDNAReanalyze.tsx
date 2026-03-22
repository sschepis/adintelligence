import { useState } from "react";
import { Dna, RefreshCw, Loader2, CheckCircle2, AlertTriangle, Brain, Mic, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { supabase } from "@/integrations/supabase/client";
import { SettingsSection } from "@/components/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AnalyzeStep = 'idle' | 'scanning' | 'analyzing' | 'comparing' | 'complete' | 'error';

interface AnalyzedDNA {
  voice?: any;
  personality?: any;
  story?: any;
  guardrails?: any;
}

export function BrandDNAReanalyze() {
  const { toast } = useToast();
  const { activeBrand, refetchBrands } = useBrand();
  const { brandDNA, refetch: refetchDNA } = useBrandDNA();
  
  const [step, setStep] = useState<AnalyzeStep>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [analyzedDNA, setAnalyzedDNA] = useState<AnalyzedDNA | null>(null);
  const [selections, setSelections] = useState({
    voice: true,
    personality: true,
    story: true,
    guardrails: true,
  });

  const handleReanalyze = async () => {
    if (!activeBrand?.website_url) {
      toast({
        title: "No website configured",
        description: "Please configure a website URL first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Scanning
      setStep('scanning');
      setProgress(20);
      setMessage('Scanning website content...');
      
      // Step 2: Analyzing with AI
      setStep('analyzing');
      setProgress(50);
      setMessage('Extracting brand DNA with AI...');
      
      const { data, error } = await supabase.functions.invoke('scan-website', {
        body: { url: activeBrand.website_url }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to scan website');
      }

      const brandData = data.brandData || {};
      const extractedDNA = brandData.brandDNA || {};
      
      // Step 3: Show comparison
      setStep('comparing');
      setProgress(75);
      setMessage('Review extracted Brand DNA...');
      setAnalyzedDNA(extractedDNA);

    } catch (error: any) {
      console.error('Re-analyze error:', error);
      setStep('error');
      setMessage(error.message || 'Analysis failed');
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to re-analyze brand DNA",
        variant: "destructive",
      });
      
      setTimeout(() => {
        setStep('idle');
        setProgress(0);
        setMessage('');
      }, 3000);
    }
  };

  const handleApplyChanges = async () => {
    if (!activeBrand || !analyzedDNA) return;

    setStep('analyzing');
    setProgress(90);
    setMessage('Applying selected changes...');

    try {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (selections.voice && analyzedDNA.voice) {
        updatePayload.brand_voice = {
          ...brandDNA?.voice,
          ...analyzedDNA.voice,
          analyzedAt: new Date().toISOString(),
        };
      }

      if (selections.personality && analyzedDNA.personality) {
        updatePayload.brand_personality = {
          ...brandDNA?.personality,
          ...analyzedDNA.personality,
          completedAt: analyzedDNA.personality.archetype ? new Date().toISOString() : null,
        };
      }

      if (selections.story && analyzedDNA.story) {
        updatePayload.brand_story = {
          ...brandDNA?.story,
          ...analyzedDNA.story,
        };
      }

      if (selections.guardrails && analyzedDNA.guardrails) {
        updatePayload.brand_guardrails = {
          ...brandDNA?.guardrails,
          ...analyzedDNA.guardrails,
          enabled: true,
        };
      }

      const { error } = await supabase
        .from('brands')
        .update(updatePayload)
        .eq('id', activeBrand.id);

      if (error) throw error;

      setStep('complete');
      setProgress(100);
      setMessage('Brand DNA updated successfully!');
      
      await refetchBrands();
      await refetchDNA();
      
      toast({
        title: "Brand DNA updated",
        description: "Selected sections have been updated with fresh analysis.",
      });

      setTimeout(() => {
        setStep('idle');
        setProgress(0);
        setMessage('');
        setAnalyzedDNA(null);
      }, 2000);

    } catch (error: any) {
      console.error('Update error:', error);
      setStep('error');
      setMessage(error.message || 'Update failed');
      toast({
        title: "Update failed",
        description: error.message || "Failed to apply changes",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setStep('idle');
    setProgress(0);
    setMessage('');
    setAnalyzedDNA(null);
  };

  const isProcessing = ['scanning', 'analyzing'].includes(step);

  const dnaFields = [
    { key: 'voice', label: 'Brand Voice', icon: Mic, description: 'Tone, vocabulary, emotional signature' },
    { key: 'personality', label: 'Personality', icon: Brain, description: 'Archetype, traits, values' },
    { key: 'story', label: 'Brand Story', icon: BookOpen, description: 'Mission, vision, tagline' },
    { key: 'guardrails', label: 'Guardrails', icon: Shield, description: 'Content boundaries' },
  ];

  return (
    <SettingsSection icon={Dna} title="Re-analyze Brand DNA" animationDelay="100ms">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Rescan your website to extract fresh brand voice, personality, story, and guardrails using AI analysis.
        </p>

        {/* Progress indicator */}
        {step !== 'idle' && step !== 'comparing' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {step === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : step === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              <span className="text-sm">{message}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Comparison view */}
        {step === 'comparing' && analyzedDNA && (
          <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Select sections to update</h4>
              <Badge variant="secondary">AI-Extracted</Badge>
            </div>

            <div className="space-y-3">
              {dnaFields.map(({ key, label, icon: Icon, description }) => {
                const hasNewData = analyzedDNA[key as keyof AnalyzedDNA];
                return (
                  <div 
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      hasNewData ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30 border border-transparent'
                    }`}
                  >
                    <Checkbox
                      id={`select-${key}`}
                      checked={selections[key as keyof typeof selections]}
                      onCheckedChange={(checked) => 
                        setSelections(prev => ({ ...prev, [key]: !!checked }))
                      }
                      disabled={!hasNewData}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`select-${key}`}
                        className={`flex items-center gap-2 cursor-pointer ${!hasNewData ? 'opacity-50' : ''}`}
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{label}</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                      {!hasNewData && (
                        <p className="text-xs text-muted-foreground italic mt-1">No new data detected</p>
                      )}
                    </div>
                    {hasNewData && (
                      <Badge variant="outline" className="text-xs shrink-0">New</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
              <Button 
                onClick={handleApplyChanges} 
                size="sm"
                disabled={!Object.values(selections).some(v => v)}
              >
                Apply Selected Changes
              </Button>
            </div>
          </div>
        )}

        {/* Action button */}
        {step === 'idle' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Re-analyze Brand DNA
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Re-analyze Brand DNA?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will scan your website again and extract updated brand voice, personality, story, and guardrails. 
                  You'll be able to review and selectively apply the changes before they take effect.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReanalyze}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isProcessing && (
          <Button variant="outline" size="sm" disabled className="gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </Button>
        )}
      </div>
    </SettingsSection>
  );
}
