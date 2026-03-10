'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Crown, Loader2, Sparkles, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useBilling } from '@/contexts/BillingContext';
import { EVENTS } from '@/lib/analytics/events';
import { CREDIT_PACK_ORDER, CREDIT_PACKS, type CreditPackId } from '@/lib/credit-packs';

interface PackPriceInfo {
  packId: CreditPackId;
  name: string;
  credits: number;
  amount: number;
  currency: string;
  formatted: string;
}

interface PriceInfoResponse {
  packs: PackPriceInfo[];
}

const LEGACY_UNLIMITED_PLANS = new Set(['lifetime', 'lifetime_appsumo', 'pro_monthly', 'pro_annual']);

const CARD_DECOR = {
  credit_pack_1: 'from-emerald-500/20 to-lime-300/15 border-emerald-300/70',
  credit_pack_2: 'from-orange-400/20 to-amber-300/20 border-orange-300/80',
  credit_pack_3: 'from-rose-400/20 to-pink-300/20 border-rose-300/70',
} as const;

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradeContent />
    </Suspense>
  );
}

function UpgradeContent() {
  const [checkoutPack, setCheckoutPack] = useState<CreditPackId | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceInfoResponse | null>(null);
  const [priceLoadFailed, setPriceLoadFailed] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const { track } = useAnalytics();
  const { isAuthenticated, isLoaded } = useUserIdentity();
  const { plan, unlimited, creditsUsed, creditsLimit, creditsRemaining, refetch } = useBilling();
  const searchParams = useSearchParams();

  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';
  const purchasedPack = searchParams.get('pack') as CreditPackId | null;

  const isGrandfatheredUnlimited = unlimited && LEGACY_UNLIMITED_PLANS.has(plan);
  const isLegacySubscription = plan === 'pro_monthly' || plan === 'pro_annual';

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    track(EVENTS.UPGRADE_PAGE_VIEWED);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;

    async function fetchPriceInfo() {
      try {
        const res = await fetch('/api/billing/price-info');
        if (!res.ok) {
          if (!cancelled) setPriceLoadFailed(true);
          return;
        }
        const data = (await res.json()) as PriceInfoResponse;
        if (!cancelled) {
          setPriceInfo(data);
          setPriceLoadFailed(false);
        }
      } catch (error) {
        console.error('Failed to fetch price info:', error);
        if (!cancelled) setPriceLoadFailed(true);
      }
    }

    fetchPriceInfo();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!success) return;

    let attempts = 0;
    const maxAttempts = 8;
    let stopped = false;
    // Track the limit seen on the first poll so we know when the webhook has fired
    let baseLimit: number | null = null;

    const poll = async () => {
      const data = await refetchRef.current();
      attempts += 1;

      if (baseLimit === null && data) {
        baseLimit = data.creditsLimit;
      }

      const creditsAdded = baseLimit !== null && data !== null && data.creditsLimit > baseLimit;

      if (data?.unlimited || creditsAdded || attempts >= maxAttempts) {
        stopped = true;
        clearInterval(interval);
      }
    };

    poll();
    const interval = setInterval(() => {
      if (stopped || attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      poll();
    }, 2000);

    return () => clearInterval(interval);
  }, [success]);

  const packPrices = useMemo(() => {
    const apiById = new Map((priceInfo?.packs || []).map((pack) => [pack.packId, pack]));

    return CREDIT_PACK_ORDER.map((packId) => {
      const pack = CREDIT_PACKS[packId];
      const apiPrice = apiById.get(packId);

      return {
        ...pack,
        amount: apiPrice?.amount ?? null,
        currency: apiPrice?.currency ?? null,
        formatted: apiPrice?.formatted ?? null,
      };
    });
  }, [priceInfo]);

  const pricingPending = !priceInfo && !priceLoadFailed;

  const remaining = creditsRemaining ?? Math.max(0, creditsLimit - creditsUsed);

  async function handleCheckout(packId: CreditPackId) {
    const pack = packPrices.find((p) => p.id === packId);
    if (!pack) return;

    track(EVENTS.UPGRADE_PLAN_SELECTED, {
      pack_id: pack.id,
      credits: pack.credits,
      ...(pack.amount !== null ? { price: pack.amount } : {}),
      ...(pack.currency ? { currency: pack.currency } : {}),
    });
    track(EVENTS.CHECKOUT_STARTED, {
      pack_id: pack.id,
      credits: pack.credits,
      ...(pack.amount !== null ? { price: pack.amount } : {}),
      ...(pack.currency ? { currency: pack.currency } : {}),
    });

    setCheckoutPack(packId);

    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: packId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert(data.error || 'Failed to start checkout');
      setCheckoutPack(null);
    } catch {
      alert('Failed to start checkout. Please try again.');
      setCheckoutPack(null);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || 'Failed to open subscription management');
    } catch {
      alert('Failed to open subscription management');
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-white/80 to-surface/40 p-6 md:p-10 shadow-[0_25px_90px_-45px_rgba(44,130,78,0.55)]">
      <div className="pointer-events-none absolute -left-24 top-[-70px] h-64 w-64 rounded-full bg-gradient-to-br from-primary/25 to-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-[-60px] h-72 w-72 rounded-full bg-gradient-to-br from-accent/20 to-primary/15 blur-3xl" />

      {success && (
        <div className="relative z-10 mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-primary/20 p-2 text-primary">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Purchase confirmed</p>
              <p className="text-sm text-muted">
                {purchasedPack && Object.hasOwn(CREDIT_PACKS, purchasedPack)
                  ? `${CREDIT_PACKS[purchasedPack].name} is being added to your account.`
                  : 'Your generation credits are being added to your account.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {canceled && (
        <div className="relative z-10 mb-6 rounded-2xl border border-secondary/40 bg-secondary/15 p-4 text-sm text-foreground">
          Checkout was canceled. You can try any bundle whenever you are ready.
        </div>
      )}

      {priceLoadFailed && (
        <div className="relative z-10 mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-foreground">
          We could not load live Stripe prices right now. Please refresh in a moment.
        </div>
      )}

      <div className="relative z-10 mb-8 md:mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
          <Sparkles className="h-3.5 w-3.5" />
          Meal plan credits
        </div>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-[family-name:var(--font-outfit)]">
          Get more meal plan credits
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-muted">
          Each full meal plan uses one credit. Credits never expire.
        </p>
      </div>

      <div className="relative z-10 mb-6 flex flex-wrap items-center gap-3">
        {isGrandfatheredUnlimited ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Crown className="h-4 w-4" />
            Grandfathered Unlimited Active
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm text-foreground">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            <span>
              <strong>{remaining}</strong> of <strong>{creditsLimit}</strong> total credits remaining
            </span>
          </div>
        )}

        {isLegacySubscription && (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-surface disabled:opacity-60"
          >
            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Manage Subscription
          </button>
        )}
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {packPrices.map((pack, idx) => {
          const hasPrice = pack.amount !== null && !!pack.currency && !!pack.formatted;
          const isLoading = checkoutPack === pack.id;
          const isDisabled = isGrandfatheredUnlimited || Boolean(checkoutPack) || !hasPrice;
          const perGeneration = pack.amount !== null ? pack.amount / pack.credits : null;

          return (
            <article
              key={pack.id}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b ${CARD_DECOR[pack.id]} p-5 md:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-pack-in`}
              style={{ animationDelay: `${idx * 110}ms` }}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/50 blur-2xl" />

              {pack.badge && (
                <div className="absolute right-3 top-3 rounded-full bg-foreground text-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                  {pack.badge}
                </div>
              )}

              <h2 className="text-xl font-bold text-foreground font-[family-name:var(--font-outfit)]">{pack.name}</h2>
              <p className="mt-1 text-sm text-muted">{pack.subtitle}</p>

              <div className="mt-5 flex items-end gap-2">
                <p className="text-4xl font-black text-foreground tracking-tight">
                  {pack.formatted ?? (pricingPending ? '...' : 'Unavailable')}
                </p>
                <p className="pb-1 text-xs font-medium uppercase tracking-wide text-muted">one-time</p>
              </div>

              <p className="mt-1 text-xs text-muted">
                {perGeneration !== null && pack.currency
                  ? `~${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: pack.currency,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(perGeneration)} per plan`
                  : pricingPending
                    ? 'Loading price...'
                    : 'Price unavailable right now'}
              </p>

              <div className="mt-5 rounded-xl border border-white/40 bg-white/60 p-3">
                <p className="text-2xl font-bold text-foreground">{pack.credits}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Meal plan credits</p>
              </div>
              

              {isLoaded && !isAuthenticated ? (
                <Link
                  href="/login?redirect=/upgrade"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition hover:bg-foreground/90"
                >
                  Sign in to Purchase
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout(pack.id)}
                  disabled={!isAuthenticated || isDisabled}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {isGrandfatheredUnlimited ? 'Unlimited Active' : pack.cta}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <p className="relative z-10 mt-6 text-xs text-muted">
        Payments are securely handled by Stripe. Existing paid users stay on unlimited access.
      </p>

      <style jsx>{`
        .animate-pack-in {
          animation: pack-in 0.55s ease-out both;
        }

        @keyframes pack-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
