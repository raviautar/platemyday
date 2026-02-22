'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, UtensilsCrossed, BookOpen, SlidersHorizontal, UserCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useSettings } from '@/contexts/SettingsContext';

export default function HomePage() {
  const router = useRouter();
  const { track } = useAnalytics();
  const { isLoaded: isAuthLoaded, isAuthenticated } = useUserIdentity();
  const { settings, isSettingsLoaded } = useSettings();

  const isOnboarded = (isSettingsLoaded && settings.preferences.onboardingCompleted) || (isAuthLoaded && isAuthenticated);

  const handleStart = () => {
    track(EVENTS.LANDING_CTA_CLICKED, { cta: 'hero_let_s_plan' });
    if (isOnboarded) {
      router.push('/meal-plan');
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-white">
      {/* Top Nav */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-end items-center gap-3 px-6 py-4">
        <Link
          href="/about"
          className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-all backdrop-blur-sm bg-white/50 px-4 py-2 rounded-full border border-white/60 shadow-sm hover:shadow"
        >
          About
        </Link>
        <Link
          href={isAuthenticated ? "/customize" : "/login"}
          className="text-foreground/70 hover:text-primary transition-all backdrop-blur-sm bg-white/50 p-2 rounded-full border border-white/60 shadow-sm hover:shadow flex items-center justify-center cursor-pointer"
          title={isAuthenticated ? "Settings" : "Sign In"}
        >
          <UserCircle className="w-5 h-5" />
        </Link>
      </div>

      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_30%,_#ccfbf1_70%,_#f0fdf4_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(16,185,129,0.15),transparent)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

      {/* Content Container */}
      <div className="relative z-10 w-full px-4 transition-all duration-300 transform opacity-100 scale-100">
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

          {(!isAuthLoaded || !isSettingsLoaded) ? (
            <div className="h-14 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isOnboarded ? (
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
                onClick={handleStart}
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
              <Sparkles className="w-5 h-5" />
              Let&apos;s Plan!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
