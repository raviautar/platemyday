-- Migration 007: Billing, credits, and subscription tables

-- ─── User Credits ─────────────────────────────────────────────
-- Tracks lifetime credit usage for both anonymous and authenticated users
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  anonymous_id TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_limit INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_credits_has_owner CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

CREATE UNIQUE INDEX idx_user_credits_user_id ON public.user_credits (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_user_credits_anonymous_id ON public.user_credits (anonymous_id) WHERE anonymous_id IS NOT NULL;

-- ─── User Billing ─────────────────────────────────────────────
-- Subscription state for authenticated users
CREATE TABLE public.user_billing (
  user_id TEXT PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  subscription_id TEXT,
  subscription_status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Billing Overrides ──────────────────────────────────
-- Admin-granted exceptions for individual users
CREATE TABLE public.user_billing_overrides (
  user_id TEXT PRIMARY KEY,
  unlimited BOOLEAN NOT NULL DEFAULT FALSE,
  extra_credits INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Atomic Credit Consumption ────────────────────────────────
-- Returns the row after incrementing credits_used by 1.
-- Uses INSERT ON CONFLICT to handle first-time and subsequent calls.
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
    RETURNING public.user_credits.credits_used, public.user_credits.credits_limit;
  ELSIF p_anonymous_id IS NOT NULL THEN
    RETURN QUERY
    INSERT INTO public.user_credits (anonymous_id, credits_used, credits_limit)
    VALUES (p_anonymous_id, 1, 10)
    ON CONFLICT (anonymous_id) WHERE anonymous_id IS NOT NULL
    DO UPDATE SET
      credits_used = public.user_credits.credits_used + 1,
      updated_at = NOW()
    RETURNING public.user_credits.credits_used, public.user_credits.credits_limit;
  ELSE
    RAISE EXCEPTION 'Either p_user_id or p_anonymous_id must be provided';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
