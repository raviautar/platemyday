'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Crown, Loader2, PartyPopper, Sparkles, UtensilsCrossed, X } from 'lucide-react';
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
  credit_pack_1: 'from-primary/20 to-[#3A7D44]/10 border-primary/40',
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

function SuccessCelebration({ packName, creditsAdded, onClose }: { packName: string; creditsAdded: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-border/50">
        {/* Decorative top gradient */}
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground p-1 rounded-lg transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-8 pb-6 text-center">
          {/* Animated icon */}
          <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-surface flex items-center justify-center animate-celebration-bounce">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-outfit)] mb-2">
            You&apos;re all set!
          </h2>
          <p className="text-muted text-sm mb-5">
            <strong className="text-foreground">{creditsAdded} credits</strong> from your <strong className="text-foreground">{packName}</strong> pack have been added to your account.
          </p>

          <Link
            href="/meal-plan"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-3 text-sm font-semibold text-white transition hover:from-primary-dark hover:to-[#1F4D28] shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Start planning meals
          </Link>
        </div>

        <style jsx>{`
          .animate-celebration-bounce {
            animation: celebration-bounce 0.6s ease-out;
          }

          @keyframes celebration-bounce {
            0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.15) rotate(5deg); opacity: 1; }
            70% { transform: scale(0.95) rotate(-2deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

function UpgradeContent() {
  const [checkoutPack, setCheckoutPack] = useState<CreditPackId | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceInfoResponse | null>(null);
  const [priceLoadFailed, setPriceLoadFailed] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCredits, setCelebrationCredits] = useState(0);
  const [pollComplete, setPollComplete] = useState(false);

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

    // Determine expected credits from the purchased pack so we can detect
    // if the webhook already fired before we started polling.
    const expectedCredits = purchasedPack && Object.hasOwn(CREDIT_PACKS, purchasedPack)
      ? CREDIT_PACKS[purchasedPack].credits
      : null;

    let attempts = 0;
    const maxAttempts = 8;
    let stopped = false;
    let baseLimit: number | null = null;

    const poll = async () => {
      const data = await refetchRef.current();
      attempts += 1;

      if (baseLimit === null && data) {
        baseLimit = data.creditsLimit;
      }

      const creditsAdded = baseLimit !== null && data !== null && data.creditsLimit > baseLimit;
      // If the pack credits are already reflected in the limit on the first poll,
      // the webhook fired before we started polling — treat as success.
      const alreadyApplied = !creditsAdded && expectedCredits !== null && data !== null && data.creditsLimit >= expectedCredits;
      const confirmed = data?.unlimited || creditsAdded || alreadyApplied;

      if (confirmed || attempts >= maxAttempts) {
        stopped = true;
        clearInterval(interval);

        if (!cancelled) {
          setPollComplete(true);
          if (confirmed) {
            const added = creditsAdded && baseLimit !== null && data
              ? data.creditsLimit - baseLimit
              : expectedCredits ?? 0;
            setCelebrationCredits(added);
            setShowCelebration(true);
          }
        }
      }
    };

    let cancelled = false;
    poll();
    const interval = setInterval(() => {
      if (stopped || attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      poll();
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [success, purchasedPack]);

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

  const celebrationPackName = purchasedPack && Object.hasOwn(CREDIT_PACKS, purchasedPack)
    ? CREDIT_PACKS[purchasedPack].name
    : 'Credit';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-white/80 to-surface/40 p-6 md:p-10 shadow-[0_25px_90px_-45px_rgba(44,130,78,0.55)]">
      <div className="pointer-events-none absolute -left-24 top-[-70px] h-64 w-64 rounded-full bg-gradient-to-br from-primary/25 to-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-[-60px] h-72 w-72 rounded-full bg-gradient-to-br from-accent/20 to-primary/15 blur-3xl" />

      {showCelebration && (
        <SuccessCelebration
          packName={celebrationPackName}
          creditsAdded={celebrationCredits}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {success && !showCelebration && !pollComplete && (
        <div className="relative z-10 mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
            <p className="text-sm text-muted">
              Confirming your purchase...
            </p>
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
              <strong>{remaining}</strong> {remaining === 1 ? 'credit' : 'credits'} remaining
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

              {/* Credits + Price */}
              <div className="mt-5 space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-foreground tracking-tight">{pack.credits}</span>
                  <span className="text-sm font-medium text-muted">credits</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold text-foreground tracking-tight">
                    {pack.formatted ?? (pricingPending ? '...' : '—')}
                  </p>
                  <span className="text-xs text-muted">one-time</span>
                </div>
                <p className="text-xs text-muted">
                  {perGeneration !== null && pack.currency
                    ? `${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: pack.currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(perGeneration)} per meal plan`
                    : pricingPending
                      ? 'Loading price...'
                      : 'Price unavailable right now'}
                </p>
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

      <p className="relative z-10 mt-4 text-xs text-muted">
        Not sure yet?{' '}
        <Link href="/about" className="text-primary underline underline-offset-2 hover:no-underline">
          Learn how ingredient-based meal planning works →
        </Link>
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
