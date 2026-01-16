-- 004_contest_registration.sql
-- Adds support for contest registration windows and participant tracking

-- 1. Extend 'contests' table
ALTER TABLE public.contests
ADD COLUMN IF NOT EXISTS registration_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS registration_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 0, -- 0 means unlimited
ADD COLUMN IF NOT EXISTS allow_teams BOOLEAN DEFAULT false;

-- 2. Create 'registrations' table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('INDIVIDUAL', 'TEAM')) DEFAULT 'INDIVIDUAL',
    team_name TEXT,
    team_members JSONB, -- Stores array of objects: [{ name, email, handle }] etc.
    status TEXT DEFAULT 'APPROVED', -- Could be PENDING in future
    
    -- Ensure a user can only register once per contest (as individual or team leader)
    UNIQUE(contest_id, user_id)
);

-- 3. Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read registrations (needed for "Participants" tab or checking if registered)
CREATE POLICY "Public read registrations" 
ON public.registrations FOR SELECT 
USING (true);

-- Allow authenticated users to register themselves
CREATE POLICY "Users can register themselves" 
ON public.registrations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own registration (e.g. change team name)
CREATE POLICY "Users can edit own registration" 
ON public.registrations FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Permissions
GRANT ALL ON TABLE public.registrations TO anon, authenticated, service_role;

-- 5. Reload Schema
NOTIFY pgrst, 'reload schema';
