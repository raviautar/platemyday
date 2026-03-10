-- Migration 012: Credit pack purchase idempotency + atomic top-up

CREATE TABLE public.credit_pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  credits_added INTEGER NOT NULL CHECK (credits_added > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credit_pack_purchases ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_credit_pack_purchases_user_id ON public.credit_pack_purchases (user_id);

-- Atomically records a Stripe credit-pack purchase and increments credits once.
-- Idempotency is enforced via unique stripe_session_id.
CREATE OR REPLACE FUNCTION apply_credit_pack_purchase(
  p_stripe_event_id TEXT,
  p_stripe_session_id TEXT,
  p_user_id TEXT,
  p_pack_id TEXT,
  p_credits INTEGER
)
RETURNS TABLE(applied BOOLEAN, credits_used INTEGER, credits_limit INTEGER) AS $$
DECLARE
  purchase_inserted BOOLEAN;
BEGIN
  IF p_user_id IS NULL OR LENGTH(TRIM(p_user_id)) = 0 THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;
  IF p_stripe_session_id IS NULL OR LENGTH(TRIM(p_stripe_session_id)) = 0 THEN
    RAISE EXCEPTION 'p_stripe_session_id is required';
  END IF;
  IF p_pack_id IS NULL OR LENGTH(TRIM(p_pack_id)) = 0 THEN
    RAISE EXCEPTION 'p_pack_id is required';
  END IF;
  IF p_credits IS NULL OR p_credits <= 0 THEN
    RAISE EXCEPTION 'p_credits must be greater than 0';
  END IF;

  INSERT INTO public.credit_pack_purchases (
    stripe_event_id,
    stripe_session_id,
    user_id,
    pack_id,
    credits_added
  )
  VALUES (
    p_stripe_event_id,
    p_stripe_session_id,
    p_user_id,
    p_pack_id,
    p_credits
  )
  ON CONFLICT (stripe_session_id) DO NOTHING;

  purchase_inserted := FOUND;

  IF NOT purchase_inserted THEN
    RETURN QUERY
    SELECT
      FALSE AS applied,
      COALESCE(uc.credits_used, 0) AS credits_used,
      COALESCE(uc.credits_limit, 10) AS credits_limit
    FROM (SELECT 1) AS marker
    LEFT JOIN public.user_credits uc ON uc.user_id = p_user_id;
    RETURN;
  END IF;

  RETURN QUERY
  WITH upserted_credits AS (
    INSERT INTO public.user_credits (user_id, credits_used, credits_limit)
    VALUES (p_user_id, 0, 10 + p_credits)
    ON CONFLICT (user_id) WHERE user_id IS NOT NULL
    DO UPDATE SET
      credits_limit = public.user_credits.credits_limit + p_credits,
      updated_at = NOW()
    RETURNING public.user_credits.credits_used, public.user_credits.credits_limit
  )
  SELECT
    TRUE AS applied,
    upserted_credits.credits_used,
    upserted_credits.credits_limit
  FROM upserted_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION apply_credit_pack_purchase(TEXT, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_credit_pack_purchase(TEXT, TEXT, TEXT, TEXT, INTEGER) TO service_role;
