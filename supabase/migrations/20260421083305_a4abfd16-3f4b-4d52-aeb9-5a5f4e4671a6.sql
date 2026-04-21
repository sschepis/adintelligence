ALTER TABLE public.video_ad_jobs
ADD COLUMN IF NOT EXISTS storyboard_frames jsonb NOT NULL DEFAULT '{}'::jsonb;