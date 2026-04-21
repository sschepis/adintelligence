import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Film, Sparkles, Loader2, Wand2, Plus, Trash2, Check, Music, Mic, Camera,
  X, CheckCircle2, Circle, Lock,
} from "lucide-react";
import { useVideoAdJob } from "@/hooks/useVideoAdJob";
import type {
  ProductionManifest, ShotPlan, AspectRatio, PlanPhaseEvent, PlanPhase,
} from "@/types/videoAd";
import { toast } from "sonner";
import { StoryboardPanel } from "./StoryboardPanel";
import { ManifestTimeline } from "./ManifestTimeline";
import { ValidationChecklist } from "./ValidationChecklist";
import { validateManifest, retileManifest, CAMERA_MOTIONS, TRANSITIONS } from "@/lib/manifestValidation";

interface VideoAdPlannerProps {
  brandId?: string;
  defaultBrief?: string;
}

const PHASE_ORDER: PlanPhase[] = ["parse", "dna", "storyboard", "validation", "manifest"];
const PHASE_LABELS: Record<PlanPhase, string> = {
  parse: "Parse brief",
  dna: "Brand DNA",
  storyboard: "Direct shots",
  validation: "Validate",
  manifest: "Ready",
};

export function VideoAdPlanner({ brandId, defaultBrief = "" }: VideoAdPlannerProps) {
  const {
    job, planning, loading, isActive,
    planManifest, startJob, cancelJob, saveStoryboardFrames,
  } = useVideoAdJob();

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState(defaultBrief);
  const [duration, setDuration] = useState(30);
  const [aspect, setAspect] = useState<AspectRatio>("9:16");
  const [tone, setTone] = useState("energetic, modern");
  const [manifest, setManifest] = useState<ProductionManifest | null>(null);
  const [currentPhase, setCurrentPhase] = useState<PlanPhaseEvent | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Set<PlanPhase>>(new Set());
  const [brandColors, setBrandColors] = useState<string[] | undefined>(undefined);
  const [activeShotIdx, setActiveShotIdx] = useState<number | null>(null);

  // Live client-side validation (mirrors server)
  const liveErrors = useMemo(
    () => (manifest ? validateManifest(manifest, duration, aspect) : []),
    [manifest, duration, aspect],
  );
  const errorIndices = useMemo(() => {
    const set = new Set<number>();
    for (const e of liveErrors) {
      const m = e.path.match(/^shots\[(\d+)\]/);
      if (m) set.add(Number(m[1]));
    }
    return set;
  }, [liveErrors]);

  // Persist frame map to job whenever it changes
  const persistFrames = (frames: Record<string, string>) => {
    if (job?.id) saveStoryboardFrames(job.id, frames);
  };


  const handlePlan = async () => {
    if (!brief.trim()) {
      toast.error("Add a brief first");
      return;
    }
    setCurrentPhase(null);
    setCompletedPhases(new Set());
    setManifest(null);

    const m = await planManifest({
      brief,
      title: title || undefined,
      brandId,
      durationSeconds: duration,
      aspectRatio: aspect,
      tone,
      onPhase: (p) => {
        setCurrentPhase(p);
        setCompletedPhases((prev) => {
          const next = new Set(prev);
          const idx = PHASE_ORDER.indexOf(p.phase);
          for (let i = 0; i < idx; i++) next.add(PHASE_ORDER[i]);
          if (p.progress >= 100) next.add(p.phase);
          return next;
        });
      },
      onDna: (dna) => setBrandColors(dna.colors),
    });
    if (m) {
      setManifest(m);
      if (!title) setTitle(m.title);
    }
  };

  const updateShot = (idx: number, patch: Partial<ShotPlan>) => {
    if (!manifest) return;
    setManifest({
      ...manifest,
      shots: manifest.shots.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    });
  };

  const removeShot = (idx: number) => {
    if (!manifest) return;
    setManifest({ ...manifest, shots: manifest.shots.filter((_, i) => i !== idx) });
  };

  const addShot = () => {
    if (!manifest) return;
    const last = manifest.shots[manifest.shots.length - 1];
    const start = last ? last.startSeconds + last.durationSeconds : 0;
    setManifest({
      ...manifest,
      shots: [
        ...manifest.shots,
        {
          index: manifest.shots.length,
          startSeconds: start,
          durationSeconds: 3,
          visualPrompt: "New shot — describe the visual",
          cameraMotion: "static",
          transition: "cut",
        },
      ],
    });
  };

  const handleApprove = async () => {
    if (!manifest) return;
    await startJob({
      title: title || manifest.title,
      brief,
      manifest,
      brandId,
    });
  };

  const totalDuration = manifest?.shots.reduce((acc, s) => acc + s.durationSeconds, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Brief */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Video Ad Planner</h3>
              <p className="text-sm text-muted-foreground">
                AI-directed shot list, ready for cloud rendering
              </p>
            </div>
            <Badge variant="gradient" className="ml-auto gap-1">
              <Sparkles className="h-3 w-3" /> Martin × Shotstack
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Title (optional)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Auto-generated if blank" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Brief</Label>
              <Textarea
                rows={3}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Promote our new summer collection — playful, beachy, vibrant. Drive site visits."
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input
                type="number" min={10} max={120} value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value || "30"))}
              />
            </div>
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspect} onValueChange={(v) => setAspect(v as AspectRatio)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="9:16">9:16 (Vertical / Reels)</SelectItem>
                  <SelectItem value="16:9">16:9 (Landscape / YouTube)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square / Feed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Tone</Label>
              <Input value={tone} onChange={(e) => setTone(e.target.value)} />
            </div>
          </div>

          <Button onClick={handlePlan} disabled={planning || !brief.trim()} className="w-full gap-2" variant="gradient">
            {planning ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Planning shots…</>
            ) : (
              <><Wand2 className="h-4 w-4" /> {manifest ? "Re-plan" : "Plan Video"}</>
            )}
          </Button>

          {/* Phase tracker */}
          <AnimatePresence>
            {(planning || currentPhase) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2"
              >
                <Progress value={currentPhase?.progress ?? 0} />
                <div className="flex items-center justify-between gap-1">
                  {PHASE_ORDER.map((p) => {
                    const done = completedPhases.has(p);
                    const active = currentPhase?.phase === p && planning;
                    return (
                      <div key={p} className="flex flex-col items-center gap-1 flex-1">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : active ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                        <span className={`text-[10px] ${active ? "text-primary font-medium" : done ? "text-foreground" : "text-muted-foreground"}`}>
                          {PHASE_LABELS[p]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {currentPhase && (
                  <p className="text-xs text-center text-muted-foreground italic">{currentPhase.label}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Validation errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Manifest validation failed</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 text-xs">
                  {validationErrors.map((e, i) => (
                    <li key={i}>
                      <span className="font-mono opacity-70">{e.path || "manifest"}:</span> {e.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manifest preview */}
      <AnimatePresence>
        {manifest && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-display font-bold text-lg">{manifest.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{manifest.concept}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Badge variant="outline">{manifest.aspectRatio}</Badge>
                    <Badge variant={totalDuration === manifest.durationSeconds ? "success" : "warning"}>
                      {totalDuration}s / {manifest.durationSeconds}s
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Music className="h-3 w-3" /> Soundtrack
                    </div>
                    <p className="text-sm font-medium">{manifest.soundtrack.mood}</p>
                    <p className="text-xs text-muted-foreground">{manifest.soundtrack.description}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Mic className="h-3 w-3" /> Voiceover ({manifest.voiceover.voice})
                    </div>
                    <p className="text-xs">{manifest.voiceover.script}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4" /> Shot Timeline ({manifest.shots.length})
                    </h5>
                    <Button size="sm" variant="ghost" onClick={addShot} className="gap-1">
                      <Plus className="h-3 w-3" /> Add shot
                    </Button>
                  </div>

                  <AnimatePresence initial={false}>
                    {manifest.shots.map((shot, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        className="p-3 rounded-lg border border-border bg-card space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="soft" className="shrink-0">#{idx + 1}</Badge>
                          <Input
                            type="number" className="w-20 h-8" value={shot.durationSeconds}
                            onChange={(e) => updateShot(idx, { durationSeconds: parseFloat(e.target.value || "0") })}
                          />
                          <span className="text-xs text-muted-foreground">sec</span>
                          <Select value={shot.cameraMotion} onValueChange={(v) => updateShot(idx, { cameraMotion: v as any })}>
                            <SelectTrigger className="h-8 flex-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["static","pan-left","pan-right","zoom-in","zoom-out","dolly","tilt"].map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={shot.transition} onValueChange={(v) => updateShot(idx, { transition: v as any })}>
                            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["cut","fade","dissolve","wipe","slide"].map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => removeShot(idx)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Textarea
                          rows={2} value={shot.visualPrompt}
                          onChange={(e) => updateShot(idx, { visualPrompt: e.target.value })}
                          className="text-xs"
                        />
                        {shot.voiceoverLine && (
                          <div className="text-xs text-muted-foreground italic">🎙 "{shot.voiceoverLine}"</div>
                        )}
                        {shot.onScreenText && (
                          <Badge variant="outline" className="text-[10px]">Text: {shot.onScreenText}</Badge>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <Button
                  onClick={handleApprove}
                  disabled={loading || isActive}
                  className="w-full gap-2"
                  variant="gradient"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve & Queue Render
                </Button>
              </CardContent>
            </Card>

            {/* Storyboard preview */}
            <StoryboardPanel manifest={manifest} brandColors={brandColors} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job status */}
      <AnimatePresence>
        {job && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-xs text-muted-foreground">Job #{job.id.slice(0, 8)}</p>
                  </div>
                  <Badge
                    variant={
                      job.status === "completed" ? "success"
                      : job.status === "failed" ? "destructive"
                      : job.status === "cancelled" ? "outline"
                      : "secondary"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                {isActive && (
                  <>
                    <Progress value={job.progress} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelJob}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" /> Cancel render
                    </Button>
                  </>
                )}
                {job.error && job.status !== "cancelled" && (
                  <p className="text-xs text-destructive">{job.error}</p>
                )}
                {job.status === "cancelled" && (
                  <p className="text-xs text-muted-foreground italic">Render was cancelled.</p>
                )}
                {job.output_url && (
                  <video src={job.output_url} controls className="w-full rounded-lg border border-border" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
