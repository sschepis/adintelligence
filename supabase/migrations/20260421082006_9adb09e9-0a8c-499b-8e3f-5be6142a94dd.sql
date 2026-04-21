-- Create video_ad_jobs table
CREATE TABLE public.video_ad_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  brief TEXT,
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'planning',
  progress INTEGER NOT NULL DEFAULT 0,
  output_url TEXT,
  thumbnail_url TEXT,
  error TEXT,
  provider TEXT DEFAULT 'shotstack',
  provider_job_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_video_ad_jobs_org_id ON public.video_ad_jobs(org_id);
CREATE INDEX idx_video_ad_jobs_user_id ON public.video_ad_jobs(user_id);
CREATE INDEX idx_video_ad_jobs_status ON public.video_ad_jobs(status);

ALTER TABLE public.video_ad_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view video jobs"
ON public.video_ad_jobs FOR SELECT
USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can create video jobs"
ON public.video_ad_jobs FOR INSERT
WITH CHECK (public.is_org_member(auth.uid(), org_id) AND auth.uid() = user_id);

CREATE POLICY "Org members can update video jobs"
ON public.video_ad_jobs FOR UPDATE
USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can delete video jobs"
ON public.video_ad_jobs FOR DELETE
USING (public.is_org_member(auth.uid(), org_id));

CREATE TRIGGER update_video_ad_jobs_updated_at
BEFORE UPDATE ON public.video_ad_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.video_ad_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_ad_jobs;