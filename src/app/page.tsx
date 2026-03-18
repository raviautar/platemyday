'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle, ArrowRight, Leaf, Package, Sparkles, Crown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useUserIdentity } from '@/hooks/useUserIdentity';

export default function HomePage() {
  const router = useRouter();
  const { track } = useAnalytics();
  const { isLoaded: isAuthLoaded, isAuthenticated } = useUserIdentity();

  const handleStart = () => {
    track(EVENTS.LANDING_CTA_CLICKED, { cta: 'hero_start_planning' });
    router.push('/meal-plan');
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-x-hidden overflow-y-auto bg-background">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-end items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/upgrade"
          className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-all backdrop-blur-sm bg-white/50 px-4 py-2 rounded-full border border-white/60 shadow-sm hover:shadow inline-flex items-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5" />
          Pricing
        </Link>
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

      {/* Floating mascot images — all from /assets/actions/, visible on all screens */}
      <div className="absolute top-[8%] left-[3%] sm:top-[15%] sm:left-[5%] z-10 animate-float-slow">
        <Image src="/assets/actions/cooking.png" alt="" width={100} height={100} className="w-12 sm:w-16 md:w-20 lg:w-24 opacity-60 sm:opacity-80 drop-shadow-xl -rotate-12" />
      </div>
      <div className="absolute top-[6%] right-[3%] sm:top-[12%] sm:right-[5%] z-10 animate-float-delayed">
        <Image src="/assets/actions/salad.png" alt="" width={100} height={100} className="w-12 sm:w-16 md:w-20 lg:w-24 opacity-60 sm:opacity-80 drop-shadow-xl rotate-12" />
      </div>
      <div className="absolute bottom-[22%] left-[2%] sm:bottom-[20%] sm:left-[6%] z-10 animate-float-delayed">
        <Image src="/assets/actions/baking.png" alt="" width={90} height={90} className="w-11 sm:w-14 md:w-18 lg:w-20 opacity-50 sm:opacity-70 drop-shadow-xl rotate-6" />
      </div>
      <div className="absolute bottom-[24%] right-[2%] sm:bottom-[22%] sm:right-[6%] z-10 animate-float-slow">
        <Image src="/assets/actions/cutting.png" alt="" width={90} height={90} className="w-11 sm:w-14 md:w-18 lg:w-20 opacity-50 sm:opacity-70 drop-shadow-xl -rotate-6" />
      </div>
      <div className="absolute top-[38%] left-[1%] sm:top-[42%] sm:left-[3%] z-10 animate-float-slow">
        <Image src="/assets/actions/rolling.png" alt="" width={80} height={80} className="w-10 sm:w-12 md:w-16 lg:w-18 opacity-40 sm:opacity-60 drop-shadow-xl rotate-3" />
      </div>
      <div className="absolute top-[40%] right-[1%] sm:top-[44%] sm:right-[3%] z-10 animate-float-delayed">
        <Image src="/assets/actions/pancake.png" alt="" width={80} height={80} className="w-10 sm:w-12 md:w-16 lg:w-18 opacity-40 sm:opacity-60 drop-shadow-xl -rotate-3" />
      </div>
      <div className="hidden sm:block absolute bottom-[8%] left-[20%] sm:bottom-[10%] sm:left-[25%] z-10 animate-float-slow">
        <Image src="/assets/actions/ladle.png" alt="" width={80} height={80} className="w-12 md:w-16 lg:w-18 opacity-50 sm:opacity-60 drop-shadow-xl rotate-12" />
      </div>

      {/* Main content */}
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

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl font-medium text-foreground/80 mb-1 font-[family-name:var(--font-outfit)]">
            Your food waste reduction companion
          </p>

          {/* Tagline */}
          <p className="text-sm sm:text-base text-muted max-w-xs sm:max-w-sm mx-auto mb-8 leading-relaxed">
            Stop throwing away food. We turn what&apos;s already in your kitchen into a week of delicious meals.
          </p>

          {/* CTA */}
          {!isAuthLoaded ? (
            <div className="h-14 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-dark hover:from-primary-dark hover:to-[#1F4D28] text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg w-full sm:w-auto min-w-[220px]"
              >
                Reduce My Food Waste
                <ArrowRight className="w-5 h-5" />
              </button>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl border-2 border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserCircle className="w-4 h-4" />
                  Sign in to your account
                </Link>
              )}
            </div>
          )}

          {/* How it works strip */}
          <div className="mt-10 flex justify-center gap-6 sm:gap-8 max-w-sm mx-auto">
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
              className="inline-flex items-center gap-2 text-xs font-medium text-foreground/60 hover:text-foreground transition-all px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-border/40 hover:border-border/60 hover:shadow-sm"
            >
              by
              <Image src="/assets/ravilution-icon.png" alt="ravilution.ai" width={18} height={18} className="w-4.5 h-4.5 rounded-full" />
              <span className="font-bold">Ravilution</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
