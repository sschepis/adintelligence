import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Volume2, Save, Loader2, RotateCcw } from "lucide-react";

interface ToneSettings {
  formality: number;
  humor: number;
  technicalLevel: number;
  enthusiasm: number;
  directness: number;
}

interface BrandToneOfVoiceProps {
  initialSettings?: Partial<ToneSettings>;
  onSettingsChange: (settings: ToneSettings) => void;
}

const DEFAULT_SETTINGS: ToneSettings = {
  formality: 50,
  humor: 30,
  technicalLevel: 40,
  enthusiasm: 60,
  directness: 50,
};

const SLIDER_CONFIG = [
  {
    key: "formality" as const,
    label: "Formality",
    leftLabel: "Casual",
    rightLabel: "Formal",
    description: "How formal or casual the language should be",
  },
  {
    key: "humor" as const,
    label: "Humor",
    leftLabel: "Serious",
    rightLabel: "Playful",
    description: "How much humor and wit to include",
  },
  {
    key: "technicalLevel" as const,
    label: "Technical Level",
    leftLabel: "Simple",
    rightLabel: "Technical",
    description: "Complexity of vocabulary and concepts",
  },
  {
    key: "enthusiasm" as const,
    label: "Enthusiasm",
    leftLabel: "Reserved",
    rightLabel: "Energetic",
    description: "Energy level and excitement in the tone",
  },
  {
    key: "directness" as const,
    label: "Directness",
    leftLabel: "Soft",
    rightLabel: "Direct",
    description: "How straightforward the messaging is",
  },
];

export function BrandToneOfVoice({ initialSettings, onSettingsChange }: BrandToneOfVoiceProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ToneSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings((prev) => ({ ...prev, ...initialSettings }));
    }
  }, [initialSettings]);

  const handleSliderChange = (key: keyof ToneSettings, value: number[]) => {
    const newSettings = { ...settings, [key]: value[0] };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSettingsChange(settings);
      setHasChanges(false);
      toast({
        title: "Tone settings saved",
        description: "Your brand tone of voice has been updated.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save tone settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const getToneDescription = (): string => {
    const parts: string[] = [];
    
    if (settings.formality > 70) parts.push("professional");
    else if (settings.formality < 30) parts.push("conversational");
    
    if (settings.humor > 70) parts.push("witty");
    else if (settings.humor < 30) parts.push("straightforward");
    
    if (settings.technicalLevel > 70) parts.push("expert-level");
    else if (settings.technicalLevel < 30) parts.push("accessible");
    
    if (settings.enthusiasm > 70) parts.push("energetic");
    else if (settings.enthusiasm < 30) parts.push("measured");
    
    if (settings.directness > 70) parts.push("assertive");
    else if (settings.directness < 30) parts.push("gentle");
    
    return parts.length > 0 
      ? `Your brand voice is ${parts.join(", ")}.`
      : "Your brand voice is balanced and versatile.";
  };

  return (
    <Card 
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      role="region"
      aria-labelledby="tone-of-voice-title"
    >
      <CardHeader className="pb-3">
        <CardTitle id="tone-of-voice-title" className="text-sm font-medium flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Tone of Voice
        </CardTitle>
        <CardDescription className="text-xs">
          Configure how AI-generated content should sound for your brand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tone preview */}
        <div 
          className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm"
          role="status"
          aria-live="polite"
        >
          {getToneDescription()}
        </div>

        {/* Sliders */}
        <div className="space-y-5" role="group" aria-label="Tone of voice sliders">
          {SLIDER_CONFIG.map((config) => (
            <div key={config.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor={`slider-${config.key}`}
                  className="text-sm font-medium"
                >
                  {config.label}
                </Label>
                <span 
                  className="text-xs text-muted-foreground tabular-nums"
                  aria-label={`${config.label} value: ${settings[config.key]}%`}
                >
                  {settings[config.key]}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span 
                  className="text-xs text-muted-foreground w-16 text-right"
                  aria-hidden="true"
                >
                  {config.leftLabel}
                </span>
                <Slider
                  id={`slider-${config.key}`}
                  value={[settings[config.key]]}
                  onValueChange={(value) => handleSliderChange(config.key, value)}
                  max={100}
                  min={0}
                  step={5}
                  className="flex-1"
                  aria-label={`${config.label}: ${config.leftLabel} to ${config.rightLabel}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={settings[config.key]}
                  aria-valuetext={`${settings[config.key]}% - ${
                    settings[config.key] < 33 
                      ? config.leftLabel 
                      : settings[config.key] > 66 
                        ? config.rightLabel 
                        : "Balanced"
                  }`}
                />
                <span 
                  className="text-xs text-muted-foreground w-16"
                  aria-hidden="true"
                >
                  {config.rightLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/70 sr-only">
                {config.description}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleReset}
            aria-label="Reset all tone settings to default values"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            aria-label={hasChanges ? "Save tone settings" : "No changes to save"}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
