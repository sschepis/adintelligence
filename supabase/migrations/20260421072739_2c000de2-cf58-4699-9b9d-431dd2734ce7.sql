ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS raw_profile jsonb;