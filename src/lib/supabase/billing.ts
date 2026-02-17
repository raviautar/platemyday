import { createServiceClient } from './server';
import type { BillingInfo, PlanId } from '@/types';

function getSupabase() {
  return createServiceClient();
}

interface CreditCheck {
  allowed: boolean;
  unlimited: boolean;
  creditsUsed: number;
  creditsLimit: number;
  remaining: number | null;
}

/**
 * Check if a user/anonymous can generate a meal plan.
 * Returns credit state without consuming a credit.
 */
export async function checkCredits(
  userId: string | null,
  anonymousId: string
): Promise<CreditCheck> {
  const sb = getSupabase();

  // For authenticated users: check billing + overrides first
  if (userId) {
    const [{ data: billing }, { data: override }] = await Promise.all([
      sb.from('user_billing').select('plan_id, subscription_status').eq('user_id', userId).maybeSingle(),
      sb.from('user_billing_overrides').select('unlimited, extra_credits').eq('user_id', userId).maybeSingle(),
    ]);

    // Admin override: unlimited
    if (override?.unlimited) {
      return { allowed: true, unlimited: true, creditsUsed: 0, creditsLimit: 0, remaining: null };
    }

    // Active paid plan or lifetime
    const planId = (billing?.plan_id ?? 'free') as PlanId;
    const isActivePaid = billing?.subscription_status === 'active' || planId === 'lifetime';
    if (isActivePaid) {
      return { allowed: true, unlimited: true, creditsUsed: 0, creditsLimit: 0, remaining: null };
    }

    // Free tier: check credits
    const { data: credits } = await sb
      .from('user_credits')
      .select('credits_used, credits_limit')
      .eq('user_id', userId)
      .maybeSingle();

    const limit = (credits?.credits_limit ?? 10) + (override?.extra_credits ?? 0);
    const used = credits?.credits_used ?? 0;
    const remaining = limit - used;

    return {
      allowed: remaining > 0,
      unlimited: false,
      creditsUsed: used,
      creditsLimit: limit,
      remaining,
    };
  }

  // Anonymous user: check credits by anonymous_id
  const { data: credits } = await sb
    .from('user_credits')
    .select('credits_used, credits_limit')
    .eq('anonymous_id', anonymousId)
    .maybeSingle();

  const limit = credits?.credits_limit ?? 10;
  const used = credits?.credits_used ?? 0;
  const remaining = limit - used;

  return {
    allowed: remaining > 0,
    unlimited: false,
    creditsUsed: used,
    creditsLimit: limit,
    remaining,
  };
}

/**
 * Atomically consume one credit. Call only after checkCredits confirms allowed.
 */
export async function consumeCredit(
  userId: string | null,
  anonymousId: string
): Promise<{ creditsUsed: number; creditsLimit: number }> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('consume_credit', {
    p_user_id: userId || null,
    p_anonymous_id: userId ? null : anonymousId,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    creditsUsed: row?.credits_used ?? 1,
    creditsLimit: row?.credits_limit ?? 10,
  };
}

/**
 * Get billing info for the credits API endpoint.
 */
export async function getBillingInfo(
  userId: string | null,
  anonymousId: string
): Promise<BillingInfo> {
  const sb = getSupabase();

  if (userId) {
    const [{ data: billing }, { data: credits }, { data: override }] = await Promise.all([
      sb.from('user_billing').select('plan_id, subscription_status').eq('user_id', userId).maybeSingle(),
      sb.from('user_credits').select('credits_used, credits_limit').eq('user_id', userId).maybeSingle(),
      sb.from('user_billing_overrides').select('unlimited, extra_credits').eq('user_id', userId).maybeSingle(),
    ]);

    const planId = (billing?.plan_id ?? 'free') as PlanId;
    const isUnlimited =
      override?.unlimited ||
      billing?.subscription_status === 'active' ||
      planId === 'lifetime';

    const limit = (credits?.credits_limit ?? 10) + (override?.extra_credits ?? 0);
    const used = credits?.credits_used ?? 0;

    return {
      plan: planId,
      unlimited: !!isUnlimited,
      creditsUsed: used,
      creditsLimit: limit,
      creditsRemaining: isUnlimited ? null : Math.max(0, limit - used),
    };
  }

  // Anonymous user
  const { data: credits } = await sb
    .from('user_credits')
    .select('credits_used, credits_limit')
    .eq('anonymous_id', anonymousId)
    .maybeSingle();

  const limit = credits?.credits_limit ?? 10;
  const used = credits?.credits_used ?? 0;

  return {
    plan: 'free',
    unlimited: false,
    creditsUsed: used,
    creditsLimit: limit,
    creditsRemaining: Math.max(0, limit - used),
  };
}
