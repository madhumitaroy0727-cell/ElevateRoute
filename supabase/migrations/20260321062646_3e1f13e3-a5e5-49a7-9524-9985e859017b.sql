
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text,
  work_mode public.work_mode,
  opportunity_type text NOT NULL DEFAULT 'full-time',
  url text,
  description text,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active opportunities"
ON public.opportunities FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE TABLE public.saved_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved opportunities"
ON public.saved_opportunities FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can save opportunities"
ON public.saved_opportunities FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave opportunities"
ON public.saved_opportunities FOR DELETE TO authenticated
USING (auth.uid() = user_id);
