import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Play, Image, Video, Pencil, X } from "lucide-react";

export interface AdCreative {
  headline: string;
  description: string;
  type: "image" | "video";
}

interface AdPreviewProps {
  onRunSimulation: (creative: AdCreative) => void;
  isRunning: boolean;
  selectedPersonaCount?: number;
}

export function AdPreview({ onRunSimulation, isRunning, selectedPersonaCount = 4 }: AdPreviewProps) {
  const [adType, setAdType] = useState<"image" | "video">("video");
  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState("Quiet Luxury Collection");
  const [description, setDescription] = useState("Spring 2024 Campaign featuring cashmere sweaters, gold jewelry, and leather accessories. 30-second video ad with elegant lifestyle scenes.");

  const handleRunSimulation = () => {
    onRunSimulation({
      headline,
      description,
      type: adType,
    });
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">Ad Creative Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdType("image")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              adType === "image" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Image className="h-3.5 w-3.5" />
            Image
          </button>
          <button
            onClick={() => setAdType("video")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              adType === "video" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Video className="h-3.5 w-3.5" />
            Video
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="relative aspect-video bg-secondary/50">
        {isEditing ? (
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Enter ad headline..."
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your ad creative..."
                  className="bg-background min-h-[120px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="gradient" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Save Creative
                </Button>
                <Button 
                  variant="glass" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Mock Video Player */}
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%),
                                    radial-gradient(circle at 75% 75%, hsl(var(--accent)) 0%, transparent 50%)`
                }} />
              </div>
              
              {/* Mock Content */}
              <div className="relative z-10 text-center px-8">
                <p className="text-2xl font-display font-bold gradient-text mb-2">
                  "{headline}"
                </p>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {adType === "video" ? "30s Video Ad" : "Static Image Ad"}
                </p>
              </div>

              {/* Edit Button */}
              {!isRunning && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}

              {/* Play Button Overlay */}
              {!isRunning && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isRunning && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                  <div 
                    className="h-full bg-primary animate-pulse"
                    style={{ width: "45%" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{selectedPersonaCount} personas</span> selected
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="glass"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isRunning}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Creative
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleRunSimulation}
            disabled={isRunning || !headline.trim()}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Focus Group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
