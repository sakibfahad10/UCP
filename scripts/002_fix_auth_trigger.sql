-- 002_fix_auth_trigger.sql
-- Run this in your Supabase SQL Editor to fix the Signup 500 Error

-- 1. Clean up existing trigger/function if they exist (prevents conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create the function to handle new user signup
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
  INSERT INTO public.profiles (id, full_name, display_name, username, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'display_name',
    generated_username,
    new.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction (Optional: allows sign up even if profile creation fails)
    -- RAISE NOTICE 'Profile creation failed: %', SQLERRM;
    -- RETURN new;
    -- Re-raising error for now to confirm it works, or you can uncomment above to be fail-safe
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify/Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
