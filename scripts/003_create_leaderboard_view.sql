-- 003_create_leaderboard_view.sql
-- Fixes "leaderboard is not a view" error strictly.

-- 1. Drop the TABLE first (most likely cause of the error)
DROP TABLE IF EXISTS public.leaderboard CASCADE;

-- 2. Then drop view or materialized view just in case
DROP VIEW IF EXISTS public.leaderboard CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard CASCADE;

-- 3. Create the View
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id as user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    COALESCE(SUM(s.score), 0) as total_score,
    COUNT(CASE WHEN s.status = 'AC' OR s.status = 'Accepted' THEN 1 END) as solved
FROM 
    public.profiles p
LEFT JOIN 
    public.submissions s ON p.id = s.user_id
GROUP BY 
    p.id, p.username, p.display_name, p.avatar_url;

-- 4. Grant permissions
GRANT SELECT ON public.leaderboard TO anon, authenticated, service_role;

-- 5. Notify schema reload
NOTIFY pgrst, 'reload schema';
