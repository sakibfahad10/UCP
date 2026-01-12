-- 005_problem_hidden_flag.sql
-- Adds a 'hidden' flag to problems to allow hiding them from the main list

ALTER TABLE public.problems
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Notify to reload schema cache
NOTIFY pgrst, 'reload schema';
