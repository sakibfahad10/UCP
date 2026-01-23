-- 011_standings_view.sql
-- Fixes missing contest_problem_stats view for standings

-- 1. Ensure contest_id exists in submissions (safety check)
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE;

-- 2. Create the View
CREATE OR REPLACE VIEW public.contest_problem_stats AS
WITH first_ac AS (
    -- Get the time of the first AC for each user per problem per contest
    SELECT 
        user_id, 
        problem_id, 
        contest_id,
        MIN(created_at) as ac_time
    FROM public.submissions
    WHERE status IN ('AC', 'Accepted')
    GROUP BY user_id, problem_id, contest_id
),
attempts AS (
    -- Count wrong attempts for each user per problem per contest
    SELECT 
        s.user_id, 
        s.problem_id, 
        s.contest_id,
        COUNT(*) as wrong_attempts
    FROM public.submissions s
    LEFT JOIN first_ac fa ON 
        s.user_id = fa.user_id AND 
        s.problem_id = fa.problem_id AND 
        s.contest_id = fa.contest_id
    WHERE 
        s.status NOT IN ('AC', 'Accepted') AND
        (fa.ac_time IS NULL OR s.created_at < fa.ac_time)
    GROUP BY s.user_id, s.problem_id, s.contest_id
)
SELECT 
    sub.user_id,
    sub.problem_id,
    sub.contest_id,
    (fa.ac_time IS NOT NULL) as is_solved,
    CASE 
        WHEN fa.ac_time IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (fa.ac_time - c.start_time))/60
        ELSE 0 
    END::INTEGER as time_to_solve,
    COALESCE(att.wrong_attempts, 0) as wrong_attempts
FROM (
    SELECT DISTINCT user_id, problem_id, contest_id FROM public.submissions
    WHERE contest_id IS NOT NULL
) sub
JOIN public.contests c ON c.id = sub.contest_id
LEFT JOIN first_ac fa ON 
    sub.user_id = fa.user_id AND 
    sub.problem_id = fa.problem_id AND 
    sub.contest_id = fa.contest_id
LEFT JOIN attempts att ON 
    sub.user_id = att.user_id AND 
    sub.problem_id = att.problem_id AND 
    sub.contest_id = att.contest_id;

-- 3. Permissions
GRANT SELECT ON public.contest_problem_stats TO anon, authenticated, service_role;

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';
