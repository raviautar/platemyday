'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';

const features = [
  'Unlimited AI generation',
  'Advanced dietary preferences',
  'Recipe import from URLs',
  'Nutritional tracking',
  'Shopping lists',
  'Priority AI processing',
];

const freeFeatures = [
  'Up to 10 recipes',
  'Basic meal planning',
  'Manual recipes',
];

export default function UpgradePage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const { track } = useAnalytics();

  useEffect(() => {
    track(EVENTS.UPGRADE_PAGE_VIEWED);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-6xl mx-auto">
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
      </div>

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

      <div className="grid md:grid-cols-3 gap-6 mb-12">
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

          <button className="w-full bg-transparent text-foreground hover:bg-surface-dark px-4 py-2 rounded-lg transition-colors font-medium" disabled>
            Current Plan
          </button>
        </div>

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

          <button
            className="w-full bg-white text-primary hover:bg-white/90 font-semibold px-4 py-2 rounded-lg transition-colors"
            onClick={() => { track(EVENTS.UPGRADE_CTA_CLICKED, { plan: 'premium', billing_period: billingPeriod }); alert('Payment integration coming soon!'); }}
          >
            Get Premium
          </button>
          <p className="text-xs text-white/70 text-center mt-3">
            Cancel anytime
          </p>
        </div>

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

          <button
            className="w-full bg-white text-emerald-600 hover:bg-white/90 font-semibold px-4 py-2 rounded-lg transition-colors"
            onClick={() => { track(EVENTS.UPGRADE_CTA_CLICKED, { plan: 'lifetime' }); alert('Payment integration coming soon!'); }}
          >
            Get Lifetime
          </button>
          <p className="text-xs text-white/70 text-center mt-3">
            Pay once, use forever
          </p>
        </div>
      </div>
    </div>
  );
}
