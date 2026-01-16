-- 012_enable_rls.sql
-- Enforces Row Level Security for production safety

-- 1. Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Contests Table
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contests are viewable by everyone" ON public.contests;
CREATE POLICY "Contests are viewable by everyone" 
ON public.contests FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Only admins can modify contests" ON public.contests;
CREATE POLICY "Only admins can modify contests" 
ON public.contests FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
));

-- 3. Problems Table
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Problems are viewable by everyone" ON public.problems;
CREATE POLICY "Problems are viewable by everyone" 
ON public.problems FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Only admins can modify problems" ON public.problems;
CREATE POLICY "Only admins can modify problems" 
ON public.problems FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
));

-- 4. Submissions Table
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Submissions are viewable by owner" ON public.submissions;
CREATE POLICY "Submissions are viewable by owner" 
ON public.submissions FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
));

DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
CREATE POLICY "Users can create submissions" 
ON public.submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Reload Schema
NOTIFY pgrst, 'reload schema';
