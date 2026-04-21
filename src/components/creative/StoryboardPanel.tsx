import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, Loader2, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import type { ProductionManifest } from "@/types/videoAd";
import { toast } from "sonner";

interface StoryboardPanelProps {
  manifest: ProductionManifest;
  brandColors?: string[];
  /** Persisted frame map keyed by shot index */
  initialFrames?: Record<string, string> | null;
  /** Called whenever the frame map changes so the parent can persist it */
  onFramesChange?: (frames: Record<string, string>) => void;
}

export function StoryboardPanel({
  manifest, brandColors, initialFrames, onFramesChange,
}: StoryboardPanelProps) {
  const [frames, setFrames] = useState<Record<number, string>>(() => {
    if (!initialFrames) return {};
    const out: Record<number, string> = {};
    for (const [k, v] of Object.entries(initialFrames)) {
      const n = Number(k);
      if (!Number.isNaN(n) && typeof v === "string") out[n] = v;
    }
    return out;
  });
  const [loadingIdx, setLoadingIdx] = useState<Set<number>>(new Set());
  const [errorIdx, setErrorIdx] = useState<Set<number>>(new Set());

  // Notify parent when frames change so it can persist them
  useEffect(() => {
    if (!onFramesChange) return;
    const stringKeyed: Record<string, string> = {};
    for (const [k, v] of Object.entries(frames)) stringKeyed[String(k)] = v;
    onFramesChange(stringKeyed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);

  const generateFrame = async (idx: number) => {
    const shot = manifest.shots[idx];
    if (!shot) return;
    setLoadingIdx((prev) => new Set(prev).add(idx));
    setErrorIdx((prev) => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
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
      setErrorIdx((prev) => new Set(prev).add(idx));
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

  const retryFailed = async () => {
    const failed = Array.from(errorIdx);
    if (failed.length === 0) {
      toast.message("No failed frames to retry");
      return;
    }
    for (const idx of failed) await generateFrame(idx);
  };

  const allLoading = loadingIdx.size > 0;
  const aspectClass =
    manifest.aspectRatio === "16:9" ? "aspect-video"
    : manifest.aspectRatio === "1:1" ? "aspect-square"
    : "aspect-[9/16]";

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h5 className="font-medium">Storyboard Preview</h5>
            <Badge variant="outline" className="text-[10px]">
              {Object.keys(frames).length}/{manifest.shots.length}
            </Badge>
            {errorIdx.size > 0 && (
              <Badge variant="destructive" className="text-[10px] gap-1">
                <AlertTriangle className="h-3 w-3" /> {errorIdx.size} failed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {errorIdx.size > 0 && (
              <Button size="sm" variant="outline" onClick={retryFailed} disabled={allLoading} className="gap-1 h-7 text-xs">
                <RefreshCw className={`h-3 w-3 ${allLoading ? "animate-spin" : ""}`} />
                Retry failed ({errorIdx.size})
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={generateAll} disabled={allLoading} className="gap-1">
              {allLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Generate all
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {manifest.shots.map((shot, idx) => {
            const url = frames[idx];
            const isLoading = loadingIdx.has(idx);
            const hasError = errorIdx.has(idx);
            return (
              <motion.div
                key={idx}
                layout
                className={`relative rounded-lg overflow-hidden border ${hasError ? "border-destructive" : "border-border"} bg-muted ${aspectClass}`}
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
                      {hasError ? (
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      )}
                      <p className="text-[10px] text-muted-foreground line-clamp-3">
                        {hasError ? "Generation failed" : shot.visualPrompt}
                      </p>
                      <Button
                        size="sm"
                        variant={hasError ? "destructive" : "outline"}
                        className="h-6 text-[10px]"
                        onClick={() => generateFrame(idx)}
                      >
                        {hasError ? "Retry" : "Generate"}
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
