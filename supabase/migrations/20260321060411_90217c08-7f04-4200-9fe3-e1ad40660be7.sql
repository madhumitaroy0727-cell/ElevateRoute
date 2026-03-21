
-- Create enums
CREATE TYPE public.goal_type AS ENUM ('placements', 'higher_studies');
CREATE TYPE public.proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.experience_type AS ENUM ('internship', 'job', 'research', 'project');
CREATE TYPE public.company_type AS ENUM ('startup', 'enterprise', 'research');
CREATE TYPE public.work_mode AS ENUM ('remote', 'onsite', 'hybrid');
CREATE TYPE public.roadmap_status AS ENUM ('active', 'completed');
CREATE TYPE public.milestone_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE public.resource_type AS ENUM ('course', 'article', 'video', 'guide', 'project');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  goal_type goal_type,
  academic_year TEXT,
  course TEXT,
  institution TEXT,
  gpa NUMERIC(4,2),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  proficiency_level proficiency_level NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Experiences table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type experience_type NOT NULL,
  title TEXT NOT NULL,
  organization TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Career preferences table
CREATE TABLE public.career_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dream_role TEXT,
  dream_company TEXT,
  preferred_location TEXT,
  company_type company_type,
  work_mode work_mode,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roadmaps table
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type goal_type NOT NULL,
  total_duration_weeks INTEGER,
  status roadmap_status NOT NULL DEFAULT 'active',
  ai_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  phase INTEGER NOT NULL DEFAULT 1,
  estimated_weeks INTEGER,
  status milestone_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resources table (public, no RLS)
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type resource_type NOT NULL,
  category TEXT,
  provider TEXT,
  is_free BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables except resources
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Skills
CREATE POLICY "Users can view own skills" ON public.skills FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON public.skills FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON public.skills FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Experiences
CREATE POLICY "Users can view own experiences" ON public.experiences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own experiences" ON public.experiences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experiences" ON public.experiences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experiences" ON public.experiences FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Career preferences
CREATE POLICY "Users can view own career prefs" ON public.career_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own career prefs" ON public.career_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own career prefs" ON public.career_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Roadmaps
CREATE POLICY "Users can view own roadmaps" ON public.roadmaps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON public.roadmaps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON public.roadmaps FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Milestones
CREATE POLICY "Users can view own milestones" ON public.milestones FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milestones" ON public.milestones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own milestones" ON public.milestones FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Resources: public read access (no RLS needed, but let's allow anon read)
-- Resources table has RLS disabled by default

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER career_preferences_updated_at BEFORE UPDATE ON public.career_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
