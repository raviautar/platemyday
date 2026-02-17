'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Sparkles, Zap, Crown, ExternalLink } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useBilling } from '@/contexts/BillingContext';
import { EVENTS } from '@/lib/analytics/events';
import { SignInButton } from '@clerk/nextjs';

const features = [
  'Unlimited AI meal plan generation',
  'Advanced dietary preferences',
  'Recipe import from URLs',
  'Nutritional tracking',
  'Shopping lists',
  'Priority AI processing',
];

const freeFeatures = [
  '10 meal plan generations',
  'Unlimited recipe generation',
  'Unlimited single meal regeneration',
  'Manual recipes',
];

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradeContent />
    </Suspense>
  );
}

function UpgradeContent() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { track } = useAnalytics();
  const { isAuthenticated } = useUserIdentity();
  const { plan, unlimited, creditsUsed, creditsLimit, refetch } = useBilling();
  const searchParams = useSearchParams();

  const isActivePaid = plan === 'lifetime' || plan === 'pro_monthly' || plan === 'pro_annual';
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    track(EVENTS.UPGRADE_PAGE_VIEWED);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll billing data after successful checkout — webhook may not have processed yet
  useEffect(() => {
    if (!success) return;

    let attempts = 0;
    const maxAttempts = 8;

    const poll = async () => {
      await refetch();
      attempts++;
    };

    // Immediate fetch + retries with increasing delay
    poll();
    const interval = setInterval(() => {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      poll();
    }, 2000);

    return () => clearInterval(interval);
  }, [success, refetch]);

  async function handleCheckout(selectedPlan: 'monthly' | 'annual' | 'lifetime') {
    track(EVENTS.CHECKOUT_STARTED, { plan: selectedPlan });

    setCheckoutLoading(selectedPlan);
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
        setCheckoutLoading(null);
      }
    } catch {
      alert('Failed to start checkout. Please try again.');
      setCheckoutLoading(null);
    }
  }

  async function handleManageSubscription() {
    try {
      const res = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert('Failed to open subscription management.');
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {success && (
        <div className="mb-6 bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-primary" />
          </div>
          <p className="text-primary font-semibold text-lg mb-1">Payment successful!</p>
          {isActivePaid ? (
            <p className="text-muted text-sm">You now have unlimited meal plan generation. Head to your <a href="/meal-plan" className="text-primary underline font-medium">meal plan</a> to get started.</p>
          ) : (
            <p className="text-muted text-sm">Activating your plan... This may take a moment.</p>
          )}
        </div>
      )}

      {canceled && (
        <div className="mb-6 bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-center">
          <p className="text-foreground">Checkout was canceled. You can try again anytime.</p>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Unlock Premium
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Upgrade to Premium
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Unlimited AI-powered meal planning
        </p>
        {!unlimited && (
          <p className="text-sm text-muted mt-2">
            You&apos;ve used <span className="font-semibold text-foreground">{creditsUsed}</span> of <span className="font-semibold text-foreground">{creditsLimit}</span> free meal plan generations
          </p>
        )}
      </div>

      {!isActivePaid && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-surface rounded-lg p-1 border border-border">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Annual
              <span className="ml-2 text-xs text-accent font-semibold">Save 20%</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Free tier */}
        <div className="bg-white rounded-xl border border-border p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-foreground">$0</span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {freeFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
                <span className="text-muted">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            className="w-full bg-transparent text-foreground hover:bg-surface-dark px-4 py-2 rounded-lg transition-colors font-medium"
            disabled
          >
            {plan === 'free' && !unlimited ? 'Current Plan' : isActivePaid ? '' : 'Current Plan'}
          </button>
        </div>

        {/* Premium tier */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 flex flex-col relative overflow-hidden shadow-xl transform md:scale-105">
          <div className="absolute top-4 right-4">
            <div className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              POPULAR
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Premium</h3>
            {billingPeriod === 'monthly' ? (
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">$4</span>
                <span className="text-white/80">/month</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">$38.40</span>
                  <span className="text-white/80">/year</span>
                </div>
                <div className="text-sm text-white/90 mb-2">
                  <span className="line-through text-white/60">$48</span>
                  <span className="ml-2 font-semibold">Save $9.60</span>
                </div>
              </>
            )}
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white">{feature}</span>
              </li>
            ))}
          </ul>

          {(plan === 'pro_monthly' || plan === 'pro_annual') ? (
            <button
              className="w-full bg-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={handleManageSubscription}
            >
              <ExternalLink className="w-4 h-4" />
              Manage Subscription
            </button>
          ) : !isAuthenticated ? (
            <SignInButton mode="modal">
              <button className="w-full bg-white text-primary hover:bg-white/90 font-semibold px-4 py-2 rounded-lg transition-colors">
                Sign in to Upgrade
              </button>
            </SignInButton>
          ) : (
            <button
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              onClick={() => handleCheckout(billingPeriod)}
              disabled={!!checkoutLoading || isActivePaid}
            >
              {checkoutLoading === billingPeriod ? 'Redirecting...' : 'Get Premium'}
            </button>
          )}
          <p className="text-xs text-white/70 text-center mt-3">
            Cancel anytime
          </p>
        </div>

        {/* Lifetime tier */}
        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl p-6 flex flex-col relative overflow-hidden shadow-lg">
          <div className="absolute top-4 right-4">
            <div className="bg-yellow-300 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              BEST VALUE
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Lifetime</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white">$99</span>
            </div>
            <div className="text-sm text-white/90 mb-2">
              <span className="line-through text-white/60">$299</span>
              <span className="ml-2 font-semibold">67% OFF</span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white">{feature}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-sm pt-2 border-t border-white/20">
              <Check className="w-4 h-4 text-yellow-200 flex-shrink-0 mt-0.5" />
              <span className="text-white font-semibold">All future updates</span>
            </li>
          </ul>

          {plan === 'lifetime' ? (
            <button
              className="w-full bg-white/20 text-white font-semibold px-4 py-2 rounded-lg"
              disabled
            >
              Current Plan
            </button>
          ) : !isAuthenticated ? (
            <SignInButton mode="modal">
              <button className="w-full bg-white text-emerald-600 hover:bg-white/90 font-semibold px-4 py-2 rounded-lg transition-colors">
                Sign in to Purchase
              </button>
            </SignInButton>
          ) : (
            <button
              className="w-full bg-white text-emerald-600 hover:bg-white/90 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              onClick={() => handleCheckout('lifetime')}
              disabled={!!checkoutLoading || isActivePaid}
            >
              {checkoutLoading === 'lifetime' ? 'Redirecting...' : 'Get Lifetime'}
            </button>
          )}
          <p className="text-xs text-white/70 text-center mt-3">
            Pay once, use forever
          </p>
        </div>
      </div>
    </div>
  );
}
