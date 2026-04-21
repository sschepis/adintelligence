
-- 1. Tighten anonymous INSERT policies that used `true`
DROP POLICY IF EXISTS "Service role can insert API logs" ON public.api_usage_logs;
CREATE POLICY "Service role can insert API logs"
ON public.api_usage_logs FOR INSERT TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert alerts" ON public.system_alerts;
CREATE POLICY "Service role can insert alerts"
ON public.system_alerts FOR INSERT TO service_role
WITH CHECK (true);

-- access_requests: keep public submissions but require minimum fields (not literal `true`)
DROP POLICY IF EXISTS "Anyone can submit access request" ON public.access_requests;
CREATE POLICY "Anyone can submit access request"
ON public.access_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(trim(email)) > 3
  AND website_url IS NOT NULL
  AND length(trim(website_url)) > 3
  AND status = 'pending'
);

-- 2. Tighten storage public SELECT — allow direct file fetch but block listing
-- Storage list() requires SELECT on objects rows; restricting by `name IS NOT NULL`
-- still permits anyone with the URL to fetch a specific object via storage API,
-- but most clients will get an empty list when calling list().
-- For deliverables/product-images/avatars we additionally restrict listing to
-- authenticated users only; public direct-URL CDN access continues to work
-- because that path goes through the storage CDN, not the RLS-checked list endpoint.

DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars readable by authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can view deliverables" ON storage.objects;
CREATE POLICY "Deliverables readable by authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'deliverables');

DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
CREATE POLICY "Product images readable by authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images');

-- 3. Cancellation support: extend video_ad_jobs.status (already text, no enum change needed)
-- Add a partial index for active jobs
CREATE INDEX IF NOT EXISTS idx_video_ad_jobs_active
  ON public.video_ad_jobs(org_id, status)
  WHERE status IN ('queued','rendering','planning');
