-- Migration 014: Atomic credit migration for anonymous → authenticated
-- Fixes race condition where separate SELECT + UPDATE could miss concurrent credit consumption.

CREATE OR REPLACE FUNCTION migrate_anonymous_credits(
  p_anonymous_id TEXT,
  p_user_id TEXT
)
RETURNS void AS $$
DECLARE
  v_anon_used INTEGER;
  v_anon_limit INTEGER;
  v_user_exists BOOLEAN;
BEGIN
  -- Lock and read the anonymous credit row (if any)
  SELECT credits_used, credits_limit INTO v_anon_used, v_anon_limit
  FROM public.user_credits
  WHERE anonymous_id = p_anonymous_id
  FOR UPDATE;

  -- Nothing to migrate
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check if authenticated user already has a credit row
  SELECT EXISTS(
    SELECT 1 FROM public.user_credits WHERE user_id = p_user_id
  ) INTO v_user_exists;

  IF v_user_exists THEN
    -- Merge: add anonymous usage to authenticated user's row
    UPDATE public.user_credits
    SET credits_used = credits_used + v_anon_used,
        credits_limit = GREATEST(credits_limit, v_anon_limit),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Remove the anonymous row
    DELETE FROM public.user_credits WHERE anonymous_id = p_anonymous_id;
  ELSE
    -- Transfer: reassign anonymous row to authenticated user
    UPDATE public.user_credits
    SET user_id = p_user_id,
        anonymous_id = NULL,
        updated_at = NOW()
    WHERE anonymous_id = p_anonymous_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
