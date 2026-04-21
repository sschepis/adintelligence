import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import type { ProductionManifest } from "@/types/videoAd";
import { toast } from "sonner";

interface StoryboardPanelProps {
  manifest: ProductionManifest;
  brandColors?: string[];
}

export function StoryboardPanel({ manifest, brandColors }: StoryboardPanelProps) {
  const [frames, setFrames] = useState<Record<number, string>>({});
  const [loadingIdx, setLoadingIdx] = useState<Set<number>>(new Set());

  const generateFrame = async (idx: number) => {
    const shot = manifest.shots[idx];
    if (!shot) return;
    setLoadingIdx((prev) => new Set(prev).add(idx));
    try {
      const { data, error } = await supabase.functions.invoke("generate-storyboard-frame", {
        body: {
          visualPrompt: shot.visualPrompt,
          aspectRatio: manifest.aspectRatio,
          cameraMotion: shot.cameraMotion,
          brandColors,
        },
      });
      if (error) throw error;
      if (!data?.imageUrl) throw new Error(data?.error || "No image");
      setFrames((prev) => ({ ...prev, [idx]: data.imageUrl }));
    } catch (err: any) {
      toast.error(err?.message || `Frame ${idx + 1} failed`);
    } finally {
      setLoadingIdx((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const generateAll = async () => {
    for (let i = 0; i < manifest.shots.length; i++) {
      if (!frames[i]) await generateFrame(i);
    }
  };

  const allLoading = loadingIdx.size > 0;
  const aspectClass =
    manifest.aspectRatio === "16:9" ? "aspect-video"
    : manifest.aspectRatio === "1:1" ? "aspect-square"
    : "aspect-[9/16]";

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h5 className="font-medium">Storyboard Preview</h5>
            <Badge variant="outline" className="text-[10px]">
              {Object.keys(frames).length}/{manifest.shots.length}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={generateAll} disabled={allLoading} className="gap-1">
            {allLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Generate all
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {manifest.shots.map((shot, idx) => {
            const url = frames[idx];
            const isLoading = loadingIdx.has(idx);
            return (
              <motion.div
                key={idx}
                layout
                className={`relative rounded-lg overflow-hidden border border-border bg-muted ${aspectClass}`}
              >
                <AnimatePresence>
                  {url ? (
                    <motion.img
                      key="img"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={url}
                      alt={`Shot ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : isLoading ? (
                    <Skeleton className="absolute inset-0" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      <p className="text-[10px] text-muted-foreground line-clamp-3">
                        {shot.visualPrompt}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px]"
                        onClick={() => generateFrame(idx)}
                      >
                        Generate
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
                <div className="absolute top-1 left-1 z-10">
                  <Badge variant="soft" className="text-[10px]">
                    #{idx + 1} · {shot.durationSeconds}s
                  </Badge>
                </div>
                {url && (
                  <button
                    onClick={() => generateFrame(idx)}
                    disabled={isLoading}
                    className="absolute bottom-1 right-1 z-10 rounded bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] hover:bg-background"
                  >
                    {isLoading ? "…" : "↻"}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
