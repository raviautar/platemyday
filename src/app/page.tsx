'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, User as UserIcon, LogIn, UtensilsCrossed, BookOpen, SlidersHorizontal } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useSettings } from '@/contexts/SettingsContext';

export default function HomePage() {
  const [view, setView] = useState<'hero' | 'feature1' | 'feature2' | 'feature3' | 'auth'>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const { track } = useAnalytics();
  const { isLoaded: isAuthLoaded } = useUserIdentity();
  const { settings, updateSettings, isSettingsLoaded } = useSettings();

  const isOnboarded = isSettingsLoaded && settings.preferences.onboardingCompleted;

  const changeView = (nextView: 'hero' | 'feature1' | 'feature2' | 'feature3' | 'auth') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(nextView);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    let focusValue: string | null = null;
    if (view === 'feature1' || view === 'feature2' || view === 'feature3') {
      focusValue = view;
    }
    window.dispatchEvent(new CustomEvent('onboarding-step', { detail: focusValue }));
    return () => {
      window.dispatchEvent(new CustomEvent('onboarding-step', { detail: null }));
    };
  }, [view]);

  const handleStart = () => {
    track(EVENTS.LANDING_CTA_CLICKED, { cta: 'hero_get_started' });
    if (isAuthLoaded && settings.preferences.onboardingCompleted) {
      router.push('/meal-plan');
    } else {
      changeView('feature1');
    }
  };

  const completeOnboarding = (redirectPath?: string) => {
    if (!settings.preferences.onboardingCompleted) {
      updateSettings({ preferences: { ...settings.preferences, onboardingCompleted: true } });
    }
    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-white">
      {/* Top Nav */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-end px-6 py-4">
        <Link
          href="/about"
          className="text-xs font-medium text-foreground/50 hover:text-foreground/80 transition-colors backdrop-blur-sm bg-white/30 px-3 py-1.5 rounded-full border border-white/40"
        >
          About
        </Link>
      </div>

      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_30%,_#ccfbf1_70%,_#f0fdf4_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(16,185,129,0.15),transparent)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

      {/* Content Container */}
      <div
        className={`relative z-10 w-full px-4 transition-all duration-300 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
      >
        {view === 'hero' && (
          <div className="text-center w-full max-w-2xl mx-auto">
            <p className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-primary/80 mb-6 font-[family-name:var(--font-outfit)]">
              Your personalized meal planner
            </p>
            <div className="mb-6 md:mb-8 flex justify-center transition-transform hover:scale-105 duration-500">
              <Image
                src="/assets/logo.png"
                alt="PlateMyDay Logo"
                width={200}
                height={200}
                className="w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-1 font-[family-name:var(--font-outfit)] tracking-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                PlateMyDay
              </span>
            </h1>
            <div className="flex flex-col items-center mb-6">
              <a
                href="https://ravilution.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-foreground/10 hover:border-foreground/20 hover:shadow-md"
              >
                by
                <Image src="/assets/ravilution-icon.png" alt="ravilution.ai" width={20} height={20} className="w-5 h-5 rounded-full" />
                <span className="font-semibold">Ravilution</span>
              </a>
            </div>

            {isOnboarded ? (
              <>
                {/* Quick actions for returning users */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-8">
                  <Link
                    href="/meal-plan"
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Meal Plan</span>
                  </Link>
                  <Link
                    href="/recipes"
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Recipes</span>
                  </Link>
                  <Link
                    href="/customize"
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <SlidersHorizontal className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Settings</span>
                  </Link>
                </div>
                <button
                  onClick={() => {
                    track(EVENTS.LANDING_CTA_CLICKED, { cta: 'hero_generate' });
                    router.push('/meal-plan');
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-lg w-full sm:w-auto min-w-[200px]"
                >
                  <Sparkles className="w-5 h-5" />
                  Let&apos;s Plan!
                </button>
              </>
            ) : (
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-lg w-full sm:w-auto min-w-[200px]"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                Get Started
              </button>
            )}
          </div>
        )}

        {view === 'feature1' && (
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-teal-500/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
              <Image
                src="/assets/tour/meal-plan.png"
                alt="Weekly Meal Plans"
                width={600}
                height={600}
                className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-cover"
                style={{ objectPosition: 'center -50px' }}
                priority
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-[family-name:var(--font-outfit)]">Feature 1 of 3</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Weekly Meal Plans</h2>
            <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
              Personalized menus ready in seconds. Eat healthier without the hassle.
            </p>
            <button
              onClick={() => changeView('feature2')}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {view === 'feature2' && (
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-primary/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
              <Image
                src="/assets/tour/recipes.png"
                alt="Tailored Recipes"
                width={600}
                height={600}
                className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-cover"
                style={{ objectPosition: 'center -50px' }}
                priority
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-[family-name:var(--font-outfit)]">Feature 2 of 3</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Tailored Recipes</h2>
            <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
              Recipes curated for your diet and preferences.
            </p>
            <button
              onClick={() => changeView('feature3')}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {view === 'feature3' && (
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-teal-500/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
              <Image
                src="/assets/tour/preferences.png"
                alt="Dietary Preferences"
                width={600}
                height={600}
                className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-cover"
                style={{ objectPosition: 'center -50px' }}
                priority
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-[family-name:var(--font-outfit)]">Feature 3 of 3</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Dietary Preferences</h2>
            <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
              Set your dietary needs and allergens. Every plan respects your choices.
            </p>
            <button
              onClick={() => changeView('auth')}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {view === 'auth' && (
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 mb-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 transform hover:scale-105 transition-transform duration-300">
              <UserIcon className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Save your progress</h2>
            <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
              Sign in to keep your meal plans, recipes, and preferences across devices.
            </p>

            <div className="flex flex-col w-full gap-3">
              <Link
                href="/login?redirect=/meal-plan"
                onClick={() => completeOnboarding()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-lg"
              >
                <LogIn className="w-5 h-5" />
                Sign In / Create Account
              </Link>

              <button
                onClick={() => completeOnboarding('/meal-plan')}
                className="w-full flex items-center justify-center pb-2 pt-3 text-muted-foreground hover:text-foreground font-medium transition-colors hover:underline underline-offset-4 text-sm"
              >
                Continue without account for now
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
