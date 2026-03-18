-- Migration 013: Security and performance fixes
-- Addresses: consume_credit race condition, mutable search_path, missing FK index

-- ─── Fix consume_credit: enforce limit atomically ────────────────
-- Previously, consume_credit blindly incremented credits_used without checking
-- the limit. Combined with a separate checkCredits() call, concurrent requests
-- could both pass the check and both consume, exceeding the limit.
-- Now the UPDATE only fires when credits_used < credits_limit.
CREATE OR REPLACE FUNCTION consume_credit(p_user_id TEXT DEFAULT NULL, p_anonymous_id TEXT DEFAULT NULL)
RETURNS TABLE(credits_used INTEGER, credits_limit INTEGER) AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    INSERT INTO public.user_credits (user_id, credits_used, credits_limit)
    VALUES (p_user_id, 1, 10)
    ON CONFLICT (user_id) WHERE user_id IS NOT NULL
    DO UPDATE SET
      credits_used = public.user_credits.credits_used + 1,
      updated_at = NOW()
    WHERE public.user_credits.credits_used < public.user_credits.credits_limit
    RETURNING public.user_credits.credits_used, public.user_credits.credits_limit;
  ELSIF p_anonymous_id IS NOT NULL THEN
    RETURN QUERY
    INSERT INTO public.user_credits (anonymous_id, credits_used, credits_limit)
    VALUES (p_anonymous_id, 1, 10)
    ON CONFLICT (anonymous_id) WHERE anonymous_id IS NOT NULL
    DO UPDATE SET
      credits_used = public.user_credits.credits_used + 1,
      updated_at = NOW()
    WHERE public.user_credits.credits_used < public.user_credits.credits_limit
    RETURNING public.user_credits.credits_used, public.user_credits.credits_limit;
  ELSE
    RAISE EXCEPTION 'Either p_user_id or p_anonymous_id must be provided';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── Fix mutable search_path on RLS helper functions ─────────────
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')
$$ LANGUAGE sql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION requesting_anonymous_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.headers', true)::json->>'x-anonymous-id', '')
$$ LANGUAGE sql STABLE SET search_path = public;

-- ─── Add missing foreign key index ──────────────────────────────
-- meal_plan_meals.recipe_id has a FK but no covering index, hurting join/delete perf.
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_recipe_id ON public.meal_plan_meals(recipe_id);
