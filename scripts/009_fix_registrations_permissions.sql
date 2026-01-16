-- 009_fix_registrations_permissions.sql
-- Fixes 403 Forbidden error by granting necessary permissions to anon and authenticated roles

GRANT ALL ON TABLE public.registrations TO anon, authenticated, service_role;

-- Reload Schema to apply changes
NOTIFY pgrst, 'reload schema';
