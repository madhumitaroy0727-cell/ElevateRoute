
-- Allow service role to delete roadmaps and milestones (needed for regeneration)
CREATE POLICY "Users can delete own roadmaps"
ON public.roadmaps FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
ON public.milestones FOR DELETE TO authenticated
USING (auth.uid() = user_id);
