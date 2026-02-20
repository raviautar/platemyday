-- Migration 008: Enable RLS and setup policies using Clerk Native JWT

-- Helper function to extract Clerk User ID from the Supabase Native Auth JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '');
$$;

-- Helper function to extract Anonymous ID from the custom HTTP header
CREATE OR REPLACE FUNCTION requesting_anonymous_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.headers', true)::jsonb ->> 'x-anonymous-id', '');
$$;

-- Enable RLS on all tables
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_recipes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_billing_overrides ENABLE ROW LEVEL SECURITY;


-- ─── Policies for Root Tables (user_id / anonymous_id) ────────────

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

-- ─── Policies for Child Tables ───────────────────────────────────
-- These tables rely on JOINS to their parent tables to determine access

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

-- Note: user_billing and user_billing_overrides have RLS enabled, 
-- but no policies are created. This means "default deny" for all public clients.
-- This is secure because they are only queried server-side using the `service_role` key.
