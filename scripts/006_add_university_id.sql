-- 006_add_university_id.sql
-- Add university_id to profiles and update auth trigger

-- 1. Add column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS university_id TEXT;

-- 2. Update handle_new_user function to capture university_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username text;
BEGIN
  -- Generate a username from email if not provided in metadata
  generated_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, display_name, username, avatar_url, university_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'display_name',
    generated_username,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'university_id' -- Capture University ID
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Profile creation failed: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Notify schema reload
NOTIFY pgrst, 'reload schema';
