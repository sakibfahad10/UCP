-- 007_enrich_profiles.sql
-- Add bio, website, and location to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
