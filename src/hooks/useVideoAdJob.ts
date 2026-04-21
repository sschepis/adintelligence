import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { streamEdgeFunction } from "@/lib/sse";
import type {
  PlanPhaseEvent,
  PlanValidationError,
  ProductionManifest,
  VideoAdJob,
} from "@/types/videoAd";

interface PlanInput {
  brief: string;
  title?: string;
  brandId?: string;
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  tone?: string;
  onPhase?: (phase: PlanPhaseEvent) => void;
  onDna?: (dna: { name: string; colors: string[] }) => void;
}

export function useVideoAdJob(initialJobId?: string) {
  const { user } = useAuth();
  const [job, setJob] = useState<VideoAdJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PlanValidationError[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const planManifest = useCallback(
    async (input: PlanInput): Promise<ProductionManifest | null> => {
      if (!user) {
        toast.error("Please sign in");
        return null;
      }
      setPlanning(true);
      setValidationErrors([]);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      let result: ProductionManifest | null = null;
      try {
        await streamEdgeFunction({
          functionName: "plan-video-ad",
          signal: ctrl.signal,
          body: {
            brief: input.brief,
            title: input.title,
            brandId: input.brandId,
            durationSeconds: input.durationSeconds,
            aspectRatio: input.aspectRatio,
            tone: input.tone,
          },
          onEvent: (evt) => {
            if (evt.event === "phase") input.onPhase?.(evt.data as PlanPhaseEvent);
            else if (evt.event === "dna") input.onDna?.(evt.data);
            else if (evt.event === "manifest") result = (evt.data as any).manifest as ProductionManifest;
            else if (evt.event === "validation_error") {
              setValidationErrors((evt.data as any).errors as PlanValidationError[]);
              toast.error("Manifest validation failed — see details below");
            } else if (evt.event === "error") {
              const msg = (evt.data as any).error ?? "Planning failed";
              toast.error(msg);
            }
          },
        });
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          toast.error(err?.message || "Planning stream failed");
        }
      } finally {
        setPlanning(false);
      }
      return result;
    },
    [user],
  );

  const startJob = useCallback(
    async (input: {
      title: string;
      brief: string;
      manifest: ProductionManifest;
      brandId?: string;
    }): Promise<VideoAdJob | null> => {
      if (!user) {
        toast.error("Please sign in");
        return null;
      }
      setLoading(true);
      try {
        const { data: profileRow, error: profileErr } = await supabase
          .from("profiles")
          .select("org_id, active_brand_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profileErr) throw profileErr;
        if (!profileRow?.org_id) {
          toast.error("No active organization");
          return null;
        }
        const { data, error } = await supabase
          .from("video_ad_jobs")
          .insert({
            org_id: profileRow.org_id,
            user_id: user.id,
            brand_id: input.brandId ?? profileRow.active_brand_id ?? null,
            title: input.title,
            brief: input.brief,
            manifest: input.manifest as any,
            status: "queued",
            progress: 0,
          })
          .select()
          .single();
        if (error) throw error;
        const created = data as unknown as VideoAdJob;
        setJob(created);
        toast.success("Video ad job queued");
        return created;
      } catch (err: any) {
        toast.error(err?.message || "Failed to start job");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const saveStoryboardFrames = useCallback(
    async (jobId: string, frames: Record<string, string>) => {
      const { error } = await supabase
        .from("video_ad_jobs")
        .update({ storyboard_frames: frames as any })
        .eq("id", jobId);
      if (error) {
        console.warn("Failed to persist storyboard frames", error);
        return false;
      }
      setJob((prev) => (prev && prev.id === jobId ? { ...prev, storyboard_frames: frames } : prev));
      return true;
    },
    [],
  );

  const cancelJob = useCallback(async () => {
    if (!job?.id) return;
    if (!["queued", "rendering", "planning"].includes(job.status)) {
      toast.message("Job is not active");
      return;
    }
    const { error } = await supabase
      .from("video_ad_jobs")
      .update({ status: "cancelled", error: "Cancelled by user" })
      .eq("id", job.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setJob((prev) => (prev ? { ...prev, status: "cancelled", error: "Cancelled by user" } : prev));
    toast.success("Render cancelled");
  }, [job]);

  const loadJob = useCallback(async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("video_ad_jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();
      if (error) throw error;
      setJob((data as unknown as VideoAdJob) ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!job?.id) return;
    const channel = supabase
      .channel(`video_ad_job:${job.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "video_ad_jobs", filter: `id=eq.${job.id}` },
        (payload) => {
          setJob((prev) => ({ ...(prev as VideoAdJob), ...(payload.new as VideoAdJob) }));
          const n = payload.new as VideoAdJob;
          if (n.status === "completed") toast.success("Video ad ready");
          if (n.status === "failed") toast.error(n.error || "Video render failed");
          if (n.status === "cancelled") toast.message("Render cancelled");
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [job?.id]);

  useEffect(() => {
    if (initialJobId) loadJob(initialJobId);
  }, [initialJobId, loadJob]);

  const isActive = !!job && ["queued", "rendering", "planning"].includes(job.status);

  return {
    job,
    loading,
    planning,
    validationErrors,
    isActive,
    planManifest,
    startJob,
    cancelJob,
    loadJob,
    setJob,
    saveStoryboardFrames,
  };
}
