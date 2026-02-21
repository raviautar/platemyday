-- Migration 009: Update RLS for native Supabase Auth
-- Replace Clerk JWT-based user ID extraction with native auth.uid()

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can access their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can access their own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can access their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can access their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can access days of their meal plans" ON public.meal_plan_days;
DROP POLICY IF EXISTS "Users can access meals of their days" ON public.meal_plan_meals;
DROP POLICY IF EXISTS "Users can access suggested recipes of their plans" ON public.suggested_recipes;

-- Replace requesting_user_id() to use native Supabase Auth instead of Clerk JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid()::TEXT;
$$;

-- requesting_anonymous_id() remains unchanged — still reads x-anonymous-id header

-- Recreate all policies with identical logic

CREATE POLICY "Users can access their own recipes" ON public.recipes
FOR ALL USING (
  user_id = requesting_user_id() OR
  (user_id IS NULL AND anonymous_id = requesting_anonymous_id())
);

CREATE POLICY "Users can access their own meal plans" ON public.meal_plans
FOR ALL USING (
  user_id = requesting_user_id() OR
  (user_id IS NULL AND anonymous_id = requesting_anonymous_id())
);

CREATE POLICY "Users can access their own settings" ON public.user_settings
FOR ALL USING (
  user_id = requesting_user_id() OR
  (user_id IS NULL AND anonymous_id = requesting_anonymous_id())
);

CREATE POLICY "Users can access their own credits" ON public.user_credits
FOR ALL USING (
  user_id = requesting_user_id() OR
  (user_id IS NULL AND anonymous_id = requesting_anonymous_id())
);

CREATE POLICY "Users can access days of their meal plans" ON public.meal_plan_days
FOR ALL USING (
  meal_plan_id IN (
    SELECT id FROM public.meal_plans WHERE
      user_id = requesting_user_id() OR
      (user_id IS NULL AND anonymous_id = requesting_anonymous_id())
  )
);

CREATE POLICY "Users can access meals of their days" ON public.meal_plan_meals
FOR ALL USING (
  day_id IN (
    SELECT id FROM public.meal_plan_days WHERE meal_plan_id IN (
      SELECT id FROM public.meal_plans WHERE
        user_id = requesting_user_id() OR
        (user_id IS NULL AND anonymous_id = requesting_anonymous_id())
    )
  )
);

CREATE POLICY "Users can access suggested recipes of their plans" ON public.suggested_recipes
FOR ALL USING (
  meal_plan_id IN (
    SELECT id FROM public.meal_plans WHERE
      user_id = requesting_user_id() OR
      (user_id IS NULL AND anonymous_id = requesting_anonymous_id())
  )
);

-- Note: user_billing and user_billing_overrides retain RLS enabled with no policies
-- (default deny for public clients — only accessible via service_role key)
