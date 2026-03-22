import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  Loader2, 
  Sparkles, 
  Plus, 
  X, 
  CheckCircle,
  RefreshCw,
  Info
} from "lucide-react";
import { useBrandDNA, ToneSpectrum } from "@/hooks/useBrandDNA";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TONE_LABELS: Record<keyof ToneSpectrum, { left: string; right: string }> = {
  formal: { left: 'Casual', right: 'Formal' },
  playful: { left: 'Serious', right: 'Playful' },
  authoritative: { left: 'Approachable', right: 'Authoritative' },
  friendly: { left: 'Professional', right: 'Friendly' },
  professional: { left: 'Relaxed', right: 'Professional' },
  casual: { left: 'Structured', right: 'Casual' }
};

export function BrandVoiceAnalyzer() {
  const { brandDNA, updateVoice, saving } = useBrandDNA();
  const { organization } = useOrganization();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newPreferredWord, setNewPreferredWord] = useState("");
  const [newAvoidedWord, setNewAvoidedWord] = useState("");

  const handleAnalyze = async () => {
    if (!organization?.website_url) {
      toast.error("Please set your website URL first");
      return;
    }

    setIsAnalyzing(true);
    try {
      // First, scrape website content using Firecrawl
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { 
          url: organization.website_url,
          options: { formats: ['markdown'], onlyMainContent: true }
        }
      });

      if (scrapeError) throw scrapeError;

      const websiteContent = scrapeData?.data?.markdown || scrapeData?.markdown || '';

      if (!websiteContent) {
        toast.error("Couldn't retrieve website content");
        return;
      }

      // Analyze the voice
      const { data, error } = await supabase.functions.invoke('analyze-brand-voice', {
        body: { 
          websiteContent,
          brandName: organization.name
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await updateVoice({
        ...data.voiceAnalysis,
        analyzedAt: data.analyzedAt
      });

      toast.success("Brand voice analyzed successfully!");
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze brand voice");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToneChange = (key: keyof ToneSpectrum, value: number[]) => {
    updateVoice({
      toneSpectrum: {
        ...brandDNA.voice.toneSpectrum,
        [key]: value[0]
      }
    });
  };

  const addPreferredWord = () => {
    if (!newPreferredWord.trim()) return;
    const updated = [...brandDNA.voice.vocabulary.preferred, newPreferredWord.trim()];
    updateVoice({
      vocabulary: { ...brandDNA.voice.vocabulary, preferred: updated }
    });
    setNewPreferredWord("");
  };

  const removePreferredWord = (word: string) => {
    const updated = brandDNA.voice.vocabulary.preferred.filter(w => w !== word);
    updateVoice({
      vocabulary: { ...brandDNA.voice.vocabulary, preferred: updated }
    });
  };

  const addAvoidedWord = () => {
    if (!newAvoidedWord.trim()) return;
    const updated = [...brandDNA.voice.vocabulary.avoided, newAvoidedWord.trim()];
    updateVoice({
      vocabulary: { ...brandDNA.voice.vocabulary, avoided: updated }
    });
    setNewAvoidedWord("");
  };

  const removeAvoidedWord = (word: string) => {
    const updated = brandDNA.voice.vocabulary.avoided.filter(w => w !== word);
    updateVoice({
      vocabulary: { ...brandDNA.voice.vocabulary, avoided: updated }
    });
  };

  return (
    <div className="space-y-6">
      {/* Analysis Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Voice Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Automatically analyze your website content to extract your brand's unique voice, 
            tone patterns, and communication style.
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : brandDNA.voice.analyzedAt ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Re-analyze Voice
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Analyze Brand Voice
                </>
              )}
            </Button>
            
            {brandDNA.voice.analyzedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last analyzed: {new Date(brandDNA.voice.analyzedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {brandDNA.voice.voiceSummary && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-sm font-medium mb-1">Voice Summary</p>
              <p className="text-sm text-muted-foreground">{brandDNA.voice.voiceSummary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tone Spectrum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            Tone Spectrum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(TONE_LABELS).map(([key, labels]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{labels.left}</span>
                <span className="font-medium">{brandDNA.voice.toneSpectrum[key as keyof ToneSpectrum]}%</span>
                <span className="text-muted-foreground">{labels.right}</span>
              </div>
              <Slider
                value={[brandDNA.voice.toneSpectrum[key as keyof ToneSpectrum]]}
                onValueChange={(value) => handleToneChange(key as keyof ToneSpectrum, value)}
                max={100}
                step={1}
                className="cursor-pointer"
                disabled={saving}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vocabulary Bank */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred Words */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Preferred Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Words and phrases that embody your brand voice
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add word or phrase..."
                value={newPreferredWord}
                onChange={(e) => setNewPreferredWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPreferredWord()}
                className="flex-1"
              />
              <Button size="icon" onClick={addPreferredWord} disabled={saving}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {brandDNA.voice.vocabulary.preferred.map((word) => (
                <Badge 
                  key={word} 
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {word}
                  <button
                    onClick={() => removePreferredWord(word)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {brandDNA.voice.vocabulary.preferred.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No preferred words added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avoided Words */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <X className="h-4 w-4 text-destructive" />
              Avoided Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Words and phrases that don't fit your brand
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add word to avoid..."
                value={newAvoidedWord}
                onChange={(e) => setNewAvoidedWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAvoidedWord()}
                className="flex-1"
              />
              <Button size="icon" onClick={addAvoidedWord} disabled={saving}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {brandDNA.voice.vocabulary.avoided.map((word) => (
                <Badge 
                  key={word} 
                  variant="outline"
                  className="gap-1 pr-1 border-destructive/30 text-destructive"
                >
                  {word}
                  <button
                    onClick={() => removeAvoidedWord(word)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {brandDNA.voice.vocabulary.avoided.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No avoided words added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Signature */}
      {brandDNA.voice.emotionalSignature.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emotional Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {brandDNA.voice.emotionalSignature.map((emotion) => (
                <Badge key={emotion} variant="secondary" className="bg-primary/10 text-primary">
                  {emotion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication Patterns */}
      {brandDNA.voice.communicationPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Communication Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {brandDNA.voice.communicationPatterns.map((pattern, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {pattern}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Unique Traits */}
      {brandDNA.voice.uniqueTraits && brandDNA.voice.uniqueTraits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unique Voice Traits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {brandDNA.voice.uniqueTraits.map((trait) => (
                <Badge key={trait} variant="outline" className="border-accent/30">
                  {trait}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
