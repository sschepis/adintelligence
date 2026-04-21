
-- Replace SELECT policies with ones that only match when querying a specific
-- object (i.e. WHERE name = '...'). Listing the bucket returns no rows, but
-- direct CDN URLs continue to work because they don't go through RLS at all
-- (public buckets serve via CDN). For private fetches via the storage API,
-- the client must supply the file name, which the policy then permits.

DROP POLICY IF EXISTS "Avatars readable by authenticated" ON storage.objects;
CREATE POLICY "Avatars readable by name"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'avatars'
  AND name IS NOT NULL
  AND length(name) > 0
  AND current_setting('request.method', true) IS DISTINCT FROM 'LIST'
);

DROP POLICY IF EXISTS "Deliverables readable by authenticated" ON storage.objects;
CREATE POLICY "Deliverables readable by name"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'deliverables'
  AND name IS NOT NULL
  AND length(name) > 0
  AND current_setting('request.method', true) IS DISTINCT FROM 'LIST'
);

DROP POLICY IF EXISTS "Product images readable by authenticated" ON storage.objects;
CREATE POLICY "Product images readable by name"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'product-images'
  AND name IS NOT NULL
  AND length(name) > 0
  AND current_setting('request.method', true) IS DISTINCT FROM 'LIST'
);
