'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, BookOpen, SlidersHorizontal, UserCircle, ArrowRight, Package, Leaf, Sparkles } from 'lucide-react';
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
    track(EVENTS.LANDING_CTA_CLICKED, { cta: 'hero_start_planning' });
    if (isOnboarded) {
      router.push('/meal-plan');
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-x-hidden overflow-y-auto bg-background">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-end items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
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
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_#FEFCF8_0%,_#F3EDE4_30%,_#E4D9CC_70%,_#FEFCF8_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(58,125,68,0.15),transparent)]" />
      <div className="absolute top-[10%] left-[5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#D4764E]/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[10%] right-[5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#3A7D44]/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Floating mascot images — desktop only */}
      <div className="hidden md:block absolute top-[18%] left-[6%] z-10 animate-float-slow">
        <Image src="/assets/actions/cooking.png" alt="" width={100} height={100} className="w-20 lg:w-24 opacity-80 drop-shadow-xl -rotate-12" />
      </div>
      <div className="hidden md:block absolute top-[22%] right-[6%] z-10 animate-float-delayed">
        <Image src="/assets/actions/salad.png" alt="" width={100} height={100} className="w-20 lg:w-24 opacity-80 drop-shadow-xl rotate-12" />
      </div>
      <div className="hidden lg:block absolute bottom-[18%] left-[8%] z-10 animate-float-delayed">
        <Image src="/assets/actions/baking.png" alt="" width={90} height={90} className="w-20 opacity-70 drop-shadow-xl rotate-6" />
      </div>
      <div className="hidden lg:block absolute bottom-[22%] right-[8%] z-10 animate-float-slow">
        <Image src="/assets/actions/cutting.png" alt="" width={90} height={90} className="w-20 opacity-70 drop-shadow-xl -rotate-6" />
      </div>

      {/* Main content — scrollable, vertically centered on tall screens */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-4 pt-20 pb-6">
        <div className="text-center w-full max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-3 flex justify-center">
            <Image
              src="/assets/logo.png"
              alt="PlateMyDay Logo"
              width={200}
              height={200}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 drop-shadow-2xl"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-2 font-[family-name:var(--font-outfit)] tracking-tight">
            <span className="bg-gradient-to-r from-[#3A7D44] via-[#2D6235] to-[#3A7D44] bg-clip-text text-transparent">
              PlateMyDay
            </span>
          </h1>

          {/* Tagline — short, punchy */}
          <p className="text-sm sm:text-base text-foreground/70 max-w-xs sm:max-w-sm mx-auto mb-6 leading-relaxed">
            Turn your pantry into a week of meals.{' '}
            <span className="text-primary font-medium">Less waste. More flavor.</span>
          </p>

          {/* CTA area */}
          {(!isAuthLoaded || !isSettingsLoaded) ? (
            <div className="h-14 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isOnboarded ? (
            <>
              <div className="grid grid-cols-4 gap-2 max-w-xs sm:max-w-md mx-auto mb-5">
                <Link
                  href="/meal-plan"
                  className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-accent/40 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-accent-dark" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-foreground">Pantry</span>
                </Link>
                <Link
                  href="/meal-plan"
                  className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-foreground">Meals</span>
                </Link>
                <Link
                  href="/recipes"
                  className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-foreground">Recipes</span>
                </Link>
                <Link
                  href="/customize"
                  className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-foreground">Settings</span>
                </Link>
              </div>
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-dark hover:from-primary-dark hover:to-[#1F4D28] text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg w-full sm:w-auto min-w-[200px]"
              >
                Open My Pantry
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-dark hover:from-primary-dark hover:to-[#1F4D28] text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg w-full sm:w-auto min-w-[200px]"
            >
              Start Saving Food
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {/* How it works — compact 3-icon strip */}
          <div className="mt-8 flex justify-center gap-6 sm:gap-8 max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted">Add pantry</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-accent-dark" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted">Generate</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
                <Leaf className="w-4.5 h-4.5 text-secondary-dark" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted">Waste less</span>
            </div>
          </div>

          {/* Ravilution badge */}
          <div className="mt-6 pb-2">
            <a
              href="https://ravilution.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-foreground transition-all px-3 py-1.5 rounded-full"
            >
              by
              <Image src="/assets/ravilution-icon.png" alt="ravilution.ai" width={16} height={16} className="w-4 h-4 rounded-full" />
              <span className="font-semibold">Ravilution</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
