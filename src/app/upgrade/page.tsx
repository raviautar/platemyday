'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Sparkles, Zap, Crown, ExternalLink, PartyPopper, Loader2, ArrowRight, Settings } from 'lucide-react';
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

const CONFETTI_COLORS = ['#4CAF50', '#FFD54F', '#F48FB1', '#388E3C', '#EC407A', '#FFC107'];

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradeContent />
    </Suspense>
  );
}

function SuccessCelebration({ isActivePaid }: { isActivePaid: boolean }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isActivePaid) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isActivePaid]);

  return (
    <div className="relative mb-8">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-container">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2.5 + Math.random() * 2}s`,
                  backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {isActivePaid ? (
        <div className="celebration-card bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-2 border-primary/30 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-overlay" />

          <div className="relative z-10">
            <div className="celebration-icon w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>

            <h2 className="celebration-title text-3xl md:text-4xl font-bold text-foreground mb-3">
              Welcome to Premium!
            </h2>

            <p className="celebration-subtitle text-muted text-lg mb-2 max-w-md mx-auto">
              You now have unlimited AI-powered meal planning.
            </p>
            <p className="celebration-subtitle-delayed text-muted text-sm mb-6">
              Time to create something delicious.
            </p>

            <a
              href="/meal-plan"
              className="celebration-cta inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              Start Planning
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="activating-card bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-primary font-semibold text-lg mb-1">Payment successful!</p>
          <p className="text-muted text-sm">Activating your plan... This may take a moment.</p>
        </div>
      )}

      <style jsx>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        .confetti {
          position: absolute;
          top: -20px;
          animation: confetti-fall 3s ease-out forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        .celebration-card {
          animation: card-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes card-appear {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .shimmer-overlay {
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        .celebration-icon {
          animation: icon-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes icon-bounce {
          0% {
            transform: scale(0) rotate(-20deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .celebration-title {
          animation: fade-up 0.5s ease-out 0.3s both;
        }
        .celebration-subtitle {
          animation: fade-up 0.5s ease-out 0.5s both;
        }
        .celebration-subtitle-delayed {
          animation: fade-up 0.5s ease-out 0.65s both;
        }
        .celebration-cta {
          animation: fade-up 0.5s ease-out 0.8s both;
        }
        @keyframes fade-up {
          0% {
            transform: translateY(12px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .activating-card {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
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

  // Keep a stable ref to refetch so the polling effect doesn't restart
  // when the callback identity changes (e.g. anonymousId hydration)
  const refetchRef = useRef(refetch);
  useEffect(() => { refetchRef.current = refetch; }, [refetch]);

  useEffect(() => {
    track(EVENTS.UPGRADE_PAGE_VIEWED);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll billing data after successful checkout — webhook may not have processed yet
  useEffect(() => {
    if (!success) return;

    let attempts = 0;
    const maxAttempts = 8;
    let stopped = false;

    const poll = async () => {
      const data = await refetchRef.current();
      attempts++;
      // Stop polling once the plan is recognized as active
      if (data && (data.plan === 'lifetime' || data.plan === 'pro_monthly' || data.plan === 'pro_annual')) {
        stopped = true;
        clearInterval(interval);
      }
    };

    // Immediate fetch + retries every 2s
    poll();
    const interval = setInterval(() => {
      if (stopped || attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      poll();
    }, 2000);

    return () => clearInterval(interval);
  }, [success]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {success && <SuccessCelebration isActivePaid={isActivePaid} />}

      {canceled && (
        <div className="mb-6 bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-center">
          <p className="text-foreground">Checkout was canceled. You can try again anytime.</p>
        </div>
      )}

      {isActivePaid && !success && (
        <div className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted">Your current plan</p>
                <p className="text-xl font-bold text-foreground">
                  {plan === 'lifetime' ? 'Lifetime Premium' : plan === 'pro_annual' ? 'Premium Annual' : 'Premium Monthly'}
                </p>
                <p className="text-sm text-primary font-medium">Unlimited meal plan generation</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {(plan === 'pro_monthly' || plan === 'pro_annual') && (
                <button
                  className="inline-flex items-center justify-center gap-2 bg-white border border-border text-foreground hover:bg-surface font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
                  onClick={handleManageSubscription}
                >
                  <Settings className="w-4 h-4" />
                  Manage Subscription
                </button>
              )}
              <a
                href="/meal-plan"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                Go to Meal Plan
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          {(plan === 'pro_monthly' || plan === 'pro_annual') && (
            <p className="text-xs text-muted mt-4 text-center sm:text-left">
              You can cancel, switch plans, or update payment details via Manage Subscription.
            </p>
          )}
        </div>
      )}

      <div className="text-center mb-8">
        {isActivePaid ? (
          <>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Check className="w-4 h-4" />
              Premium Active
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Your Plan
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              You have unlimited AI-powered meal planning
            </p>
          </>
        ) : (
          <>
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
          </>
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
              <span className="ml-2 text-xs text-accent font-semibold">Save 16%</span>
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
              <span className="text-4xl font-bold text-foreground">&euro;0</span>
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
        <div data-tour="upgrade-premium" className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 flex flex-col relative overflow-hidden shadow-xl transform md:scale-105">
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
                <span className="text-4xl font-bold text-white">&euro;2.99</span>
                <span className="text-white/80">/month</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">&euro;29.99</span>
                  <span className="text-white/80">/year</span>
                </div>
                <div className="text-sm text-white/90 mb-2">
                  <span className="line-through text-white/60">&euro;35.88</span>
                  <span className="ml-2 font-semibold">Save &euro;5.89</span>
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
              <span className="text-4xl font-bold text-white">&euro;99.99</span>
            </div>
            <div className="text-sm text-white/90 mb-2">
              <span className="line-through text-white/60">&euro;299</span>
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
