-- 010_fix_problems_permissions.sql
-- Fixes visibility issues by granting necessary permissions to anon and authenticated roles

GRANT ALL ON TABLE public.problems TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.testcases TO anon, authenticated, service_role;

-- Reload Schema to apply changes
NOTIFY pgrst, 'reload schema';
