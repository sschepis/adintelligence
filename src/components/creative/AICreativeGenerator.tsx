import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Loader2, 
  Download,
  Trash2,
  Image as ImageIcon,
  Palette,
  Wand2,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { useCreativeAssetGeneration, GeneratedAsset } from "@/hooks/useCreativeAssetGeneration";
import { toast } from "sonner";

const ASSET_TYPES = [
  { id: "tiktok_video", name: "TikTok Thumbnail" },
  { id: "instagram_story", name: "Instagram Story" },
  { id: "instagram_feed", name: "Instagram Feed" },
  { id: "landing_page_hero", name: "Landing Hero" },
  { id: "display_banner", name: "Display Banner" },
  { id: "facebook_ad", name: "Facebook Ad" },
];

const STYLES = [
  { id: "modern", name: "Modern & Clean" },
  { id: "vibrant", name: "Vibrant & Bold" },
  { id: "minimal", name: "Minimalist" },
  { id: "luxury", name: "Luxury & Premium" },
  { id: "playful", name: "Playful & Fun" },
  { id: "professional", name: "Professional" },
  { id: "retro", name: "Retro & Vintage" },
];

interface AICreativeGeneratorProps {
  brandColors?: string[];
  onAssetGenerated?: (asset: GeneratedAsset) => void;
  className?: string;
}

export function AICreativeGenerator({ 
  brandColors = [], 
  onAssetGenerated,
  className 
}: AICreativeGeneratorProps) {
  const { isGenerating, generatedAssets, generateAsset, clearAssets } = useCreativeAssetGeneration();
  const [prompt, setPrompt] = useState("");
  const [assetType, setAssetType] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your creative");
      return;
    }

    const result = await generateAsset(prompt, {
      assetType,
      style,
      brandColors,
    });

    if (result && result.length > 0 && onAssetGenerated) {
      result.forEach(asset => onAssetGenerated(asset));
    }
  };

  const handleCopyUrl = async (asset: GeneratedAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      toast.success("Image URL copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDownload = async (asset: GeneratedAsset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `creative-${asset.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">AI Creative Generator</h3>
              <p className="text-sm text-muted-foreground">Generate custom visuals using AI</p>
            </div>
            <Badge variant="secondary" className="ml-auto gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by AI
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visual Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Creative Description</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your creative vision... e.g., A stunning sunset beach scene with a couple walking, warm golden tones, for a summer vacation campaign"
                rows={3}
              />
            </div>

            {brandColors.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Brand Colors (will be applied)
                </Label>
                <div className="flex gap-2">
                  {brandColors.map((color, idx) => (
                    <div 
                      key={idx}
                      className="w-8 h-8 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full gap-2"
              variant="gradient"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Creative
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Assets */}
      {generatedAssets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Generated Assets ({generatedAssets.length})
            </h4>
            <Button variant="ghost" size="sm" onClick={clearAssets} className="gap-1 text-xs">
              <Trash2 className="h-3 w-3" />
              Clear All
            </Button>
          </div>
          
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 gap-4">
              {generatedAssets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <img 
                      src={asset.url} 
                      alt={asset.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleCopyUrl(asset)}
                        className="gap-1"
                      >
                        {copiedId === asset.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleDownload(asset)}
                        className="gap-1"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{asset.prompt}</p>
                    <div className="flex gap-1 mt-2">
                      {asset.assetType && (
                        <Badge variant="outline" className="text-[10px]">{asset.assetType}</Badge>
                      )}
                      {asset.style && (
                        <Badge variant="secondary" className="text-[10px]">{asset.style}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
