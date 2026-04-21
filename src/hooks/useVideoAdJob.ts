import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import type { ProductionManifest, VideoAdJob } from "@/types/videoAd";

export function useVideoAdJob(initialJobId?: string) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [job, setJob] = useState<VideoAdJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState(false);

  // Plan a manifest (no DB write yet — caller previews + edits before approve)
  const planManifest = useCallback(
    async (input: {
      brief: string;
      title?: string;
      brandId?: string;
      durationSeconds?: number;
      aspectRatio?: "16:9" | "9:16" | "1:1";
      tone?: string;
    }): Promise<ProductionManifest | null> => {
      if (!user) {
        toast.error("Please sign in");
        return null;
      }
      setPlanning(true);
      try {
        const { data, error } = await supabase.functions.invoke("plan-video-ad", {
          body: input,
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "Planning failed");
        return data.manifest as ProductionManifest;
      } catch (err: any) {
        const msg = err?.message || "Failed to plan video";
        if (msg.includes("429")) toast.error("Rate limit exceeded. Try again shortly.");
        else if (msg.includes("402")) toast.error("AI credits exhausted.");
        else toast.error(msg);
        return null;
      } finally {
        setPlanning(false);
      }
    },
    [user],
  );

  // Approve a manifest → create a job row (status: queued)
  const startJob = useCallback(
    async (input: {
      title: string;
      brief: string;
      manifest: ProductionManifest;
      brandId?: string;
    }): Promise<VideoAdJob | null> => {
      if (!user || !profile?.org_id) {
        toast.error("No active organization");
        return null;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("video_ad_jobs")
          .insert({
            org_id: profile.org_id,
            user_id: user.id,
            brand_id: input.brandId ?? profile.active_brand_id ?? null,
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
    [user, profile],
  );

  // Load a job by id
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

  // Realtime subscription
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
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [job?.id]);

  // Initial load
  useEffect(() => {
    if (initialJobId) loadJob(initialJobId);
  }, [initialJobId, loadJob]);

  return { job, loading, planning, planManifest, startJob, loadJob, setJob };
}
