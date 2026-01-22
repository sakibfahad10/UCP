-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  rank_points INT DEFAULT 0,
  contests_participated INT DEFAULT 0,
  problems_solved INT DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create contests table
CREATE TABLE IF NOT EXISTS public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  total_problems INT DEFAULT 0,
  participants INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create problems table
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  points INT DEFAULT 100,
  acceptance_rate DECIMAL(5,2) DEFAULT 0,
  problem_number INT,
  time_limit INT DEFAULT 1,
  memory_limit INT DEFAULT 256,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create problem submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.contests(id),
  code TEXT,
  language TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded')),
  runtime INT,
  memory INT,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INT,
  score INT DEFAULT 0,
  problems_solved INT DEFAULT 0,
  penalty_time INT DEFAULT 0,
  last_submission TIMESTAMP,
  UNIQUE(competition_id, user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Competitions RLS policies
CREATE POLICY "competitions_select_all" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "competitions_insert_admin" ON public.competitions FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Problems RLS policies
CREATE POLICY "problems_select_all" ON public.problems FOR SELECT USING (true);

-- Submissions RLS policies
CREATE POLICY "submissions_select_own_or_admin" ON public.submissions FOR SELECT USING (
  auth.uid() = user_id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
CREATE POLICY "submissions_insert_own" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard RLS policies
CREATE POLICY "leaderboard_select_all" ON public.leaderboard FOR SELECT USING (true);

-- Create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();




-- 1. Rename the main tabler ename: 
ALTER TABLE IF EXISTS public.competitions RENAME TO contests;

-- 2. Rename Foreign Key Columns in other tables to maintain consistency
ALTER TABLE public.problems RENAME COLUMN competition_id TO contest_id;
ALTER TABLE public.submissions RENAME COLUMN competition_id TO contest_id;
ALTER TABLE public.leaderboard RENAME COLUMN competition_id TO contest_id;

-- 3. Update RLS Policies (Table name change hole policy gulo abar set korte hoy)
-- Contests Policies
DROP POLICY IF EXISTS "competitions_select_all" ON public.contests;
DROP POLICY IF EXISTS "competitions_insert_admin" ON public.contests;

CREATE POLICY "contests_select_all" ON public.contests FOR SELECT USING (true);
CREATE POLICY "contests_insert_admin" ON public.contests FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Leaderboard Policy Update
DROP POLICY IF EXISTS "leaderboard_select_all" ON public.leaderboard;
CREATE POLICY "leaderboard_select_all" ON public.leaderboard FOR SELECT USING (true);



-- profile rls:
-- ১. RLS এনাবল করা (যদি না থাকে)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ২. আগের কোনো পলিসি থাকলে তা ডিলিট করা (সাফ করার জন্য)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;

-- ৩. একটি নতুন পলিসি তৈরি করা যাতে যেকোনো অথেন্টিকেটেড ইউজার নিজের প্রোফাইল দেখতে পারে
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- ৪. অ্যানোনিমাস বা পাবলিকলি প্রোফাইল রিড করার পারমিশন (যদি প্রয়োজন হয়)
-- GRANT SELECT ON public.profiles TO anon; 
GRANT SELECT ON public.profiles TO authenticated;