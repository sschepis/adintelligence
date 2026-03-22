import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  Image, 
  Video, 
  FileText, 
  Sparkles, 
  Palette,
  Type,
  Music,
  Loader2,
  Check,
  Copy,
  Download
} from "lucide-react";

interface CreativeBrief {
  trendName: string;
  targetAudience: string;
  keyMessages: string[];
  visualStyle: string;
  toneOfVoice: string;
  callToAction: string;
  format: "image" | "video" | "carousel";
}

interface GeneratedAsset {
  id: string;
  type: "headline" | "copy" | "image" | "video";
  content: string;
  preview?: string;
}

interface CreativeBriefBuilderProps {
  className?: string;
  onGenerate?: (brief: CreativeBrief) => void;
}

const visualStyles = [
  "Minimalist",
  "Bold & Colorful",
  "Luxury Aesthetic",
  "Street Style",
  "Editorial",
  "Organic & Natural",
];

const toneOptions = [
  "Aspirational",
  "Playful",
  "Sophisticated",
  "Urgent",
  "Conversational",
  "Exclusive",
];

export function CreativeBriefBuilder({ className, onGenerate }: CreativeBriefBuilderProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  
  const [brief, setBrief] = useState<CreativeBrief>({
    trendName: "",
    targetAudience: "",
    keyMessages: [],
    visualStyle: "",
    toneOfVoice: "",
    callToAction: "",
    format: "image",
  });

  const [newMessage, setNewMessage] = useState("");

  const addKeyMessage = () => {
    if (newMessage.trim()) {
      setBrief(prev => ({
        ...prev,
        keyMessages: [...prev.keyMessages, newMessage.trim()]
      }));
      setNewMessage("");
    }
  };

  const removeKeyMessage = (index: number) => {
    setBrief(prev => ({
      ...prev,
      keyMessages: prev.keyMessages.filter((_, i) => i !== index)
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation - will be replaced with actual AI later
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockAssets: GeneratedAsset[] = [
      {
        id: "1",
        type: "headline",
        content: `Embrace the ${brief.trendName} Movement`,
      },
      {
        id: "2",
        type: "headline",
        content: `${brief.trendName}: Redefine Your Style`,
      },
      {
        id: "3",
        type: "copy",
        content: `Discover our curated collection inspired by the ${brief.trendName} trend. ${brief.keyMessages[0] || "Crafted for those who dare to stand out."}`,
      },
      {
        id: "4",
        type: "copy",
        content: `${brief.toneOfVoice} vibes meet ${brief.visualStyle.toLowerCase()} design. ${brief.callToAction}`,
      },
      {
        id: "5",
        type: "image",
        content: "AI-Generated Hero Image",
        preview: "gradient-placeholder",
      },
      {
        id: "6",
        type: "image",
        content: "AI-Generated Product Shot",
        preview: "gradient-placeholder-alt",
      },
    ];
    
    setGeneratedAssets(mockAssets);
    setIsGenerating(false);
    setStep(3);
    
    onGenerate?.(brief);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={cn("glass-card rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">AI Creative Studio</h3>
              <p className="text-sm text-muted-foreground">Generate trend-aligned ad creatives</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-8 h-1 rounded-full transition-colors",
                  step >= s ? "bg-primary" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Brief Details */}
      {step === 1 && (
        <div className="p-5 space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trend Name</Label>
              <Input
                value={brief.trendName}
                onChange={(e) => setBrief(prev => ({ ...prev, trendName: e.target.value }))}
                placeholder="e.g., Quiet Luxury, Mob Wife"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input
                value={brief.targetAudience}
                onChange={(e) => setBrief(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="e.g., Fashion-forward millennials"
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Key Messages</Label>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Add a key message..."
                className="bg-secondary/50"
                onKeyDown={(e) => e.key === "Enter" && addKeyMessage()}
              />
              <Button variant="glass" size="sm" onClick={addKeyMessage}>
                Add
              </Button>
            </div>
            {brief.keyMessages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {brief.keyMessages.map((msg, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => removeKeyMessage(i)}
                  >
                    {msg} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Call to Action</Label>
            <Input
              value={brief.callToAction}
              onChange={(e) => setBrief(prev => ({ ...prev, callToAction: e.target.value }))}
              placeholder="e.g., Shop Now, Discover More"
              className="bg-secondary/50"
            />
          </div>

          <div className="flex justify-end">
            <Button 
              variant="gradient" 
              onClick={() => setStep(2)}
              disabled={!brief.trendName.trim()}
            >
              Next: Style & Format
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Style & Format */}
      {step === 2 && (
        <div className="p-5 space-y-5 animate-fade-in">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Visual Style
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {visualStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => setBrief(prev => ({ ...prev, visualStyle: style }))}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-all",
                    brief.visualStyle === style
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Tone of Voice
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {toneOptions.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setBrief(prev => ({ ...prev, toneOfVoice: tone }))}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-all",
                    brief.toneOfVoice === tone
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Format
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "image" as const, icon: Image, label: "Static Image" },
                { value: "video" as const, icon: Video, label: "Video Ad" },
                { value: "carousel" as const, icon: FileText, label: "Carousel" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setBrief(prev => ({ ...prev, format: value }))}
                  className={cn(
                    "p-4 rounded-lg flex flex-col items-center gap-2 transition-all",
                    brief.format === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="glass" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleGenerate}
              disabled={!brief.visualStyle || !brief.toneOfVoice}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Creatives
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Generated Assets */}
      {step === 3 && (
        <div className="p-5 space-y-5 animate-fade-in">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Generating AI creatives...</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Analyzing trend data and brand guidelines
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold">Generated Assets</h4>
                <Badge variant="outline" className="gap-1">
                  <Check className="h-3 w-3" />
                  {generatedAssets.length} items
                </Badge>
              </div>

              {/* Headlines */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Headlines
                </Label>
                <div className="space-y-2">
                  {generatedAssets.filter(a => a.type === "headline").map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-lg bg-secondary/50 flex items-center justify-between group"
                    >
                      <p className="font-medium">{asset.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(asset.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Ad Copy
                </Label>
                <div className="space-y-2">
                  {generatedAssets.filter(a => a.type === "copy").map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-lg bg-secondary/50 flex items-start justify-between group"
                    >
                      <p className="text-sm text-muted-foreground">{asset.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => copyToClipboard(asset.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Visual Assets
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {generatedAssets.filter(a => a.type === "image").map((asset) => (
                    <div
                      key={asset.id}
                      className="aspect-square rounded-lg overflow-hidden relative group"
                    >
                      <div 
                        className={cn(
                          "absolute inset-0",
                          asset.preview === "gradient-placeholder"
                            ? "bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10"
                            : "bg-gradient-to-br from-accent/30 via-primary/20 to-accent/10"
                        )}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-xs text-muted-foreground">{asset.content}</p>
                        </div>
                      </div>
                      <Button
                        variant="glass"
                        size="sm"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="glass" onClick={() => setStep(2)}>
                  Regenerate
                </Button>
                <Button variant="gradient">
                  Use in Campaign
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
