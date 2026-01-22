-- 1. Profile (Profiles) Table Fix
-- Ensuring columns for username and leaderboard
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Competitions (Competitions) Table Fix
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    type TEXT DEFAULT 'Individual',
    visibility TEXT DEFAULT 'Public',
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ DEFAULT now() + interval '3 hours'
);

-- 3. Submissions (Submissions) Table Fix
-- Fixing score and status constraints here
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS code TEXT;

-- Status constraint fix (so that AC/WA doesn't give error)
ALTER TABLE public.submissions 
DROP CONSTRAINT IF EXISTS submissions_status_check;

ALTER TABLE public.submissions 
ADD CONSTRAINT submissions_status_check 
CHECK (status IN ('AC', 'WA', 'TLE', 'RE', 'Accepted', 'Wrong Answer'));

-- 4. Ensuring Relationships (Foreign Keys)
-- Linking profiles with submissions (for leaderboard join queries)
ALTER TABLE public.submissions
DROP CONSTRAINT IF EXISTS submissions_user_id_fkey,
ADD CONSTRAINT submissions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 5. Clarifications (Clarifications) Table Fix
CREATE TABLE IF NOT EXISTS public.clarifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    is_public BOOLEAN DEFAULT false
);

-- 6. Creating Leaderboard View
-- This will automatically calculate real-time scores
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id as user_id,
    p.username,
    p.avatar_url,
    COALESCE(SUM(s.score), 0) as total_score,
    COUNT(CASE WHEN s.status = 'AC' THEN 1 END) as solved
FROM 
    public.profiles p
LEFT JOIN 
    public.submissions s ON p.id = s.user_id
GROUP BY 
    p.id, p.username, p.avatar_url
ORDER BY 
    total_score DESC, solved DESC;

-- 7. Security and Real-time Permissions
-- RLS (Row Level Security) is temporarily kept off for ease of development
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarifications DISABLE ROW LEVEL SECURITY;

-- Giving public access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Enabling Real-time Broadcast (so that dashboard auto-updates)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

-- 8. Schema Reload Notification
NOTIFY pgrst, 'reload schema';