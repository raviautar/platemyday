'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Sparkles, Calendar, Crown, Download, Heart, Map } from 'lucide-react';
import { TopBanner } from '@/components/layout/TopBanner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useTour } from '@/contexts/TourContext';

export default function HomePage() {
  const [showTopBanner, setShowTopBanner] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { track } = useAnalytics();
  const { startTour } = useTour();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollPosition = scrollContainerRef.current.scrollTop;
        const viewportHeight = window.innerHeight;
        setShowTopBanner(scrollPosition > viewportHeight * 0.5);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const handleScrollToHero = () => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('platemyday-scroll-to-hero', handleScrollToHero);
    return () => window.removeEventListener('platemyday-scroll-to-hero', handleScrollToHero);
  }, []);

  return (
    <>
      {showTopBanner && <TopBanner />}
      <div
        ref={scrollContainerRef}
        className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth"
      >
      {/* Hero Section */}
      <section className="snap-start h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_30%,_#ccfbf1_70%,_#f0fdf4_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl" />
        <div className="relative text-center px-4 w-full max-w-2xl mx-auto">
          <p className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-primary/80 mb-6 font-[family-name:var(--font-outfit)]">
            Personalized meal planning
          </p>
          <div className="mb-6 md:mb-8 flex justify-center">
            <Image
              src="/assets/logo.png"
              alt="PlateMyDay Logo"
              width={200}
              height={200}
              className="w-32 h-32 md:w-40 md:h-40 drop-shadow-xl"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 font-[family-name:var(--font-outfit)] tracking-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              PlateMyDay
            </span>
          </h1>
          <div className="flex flex-col items-center gap-3 mb-10">
            <Link
              href="/meal-plan"
              onClick={() => track(EVENTS.LANDING_CTA_CLICKED, { cta: 'hero_get_started' })}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-base md:text-lg"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              Let's start!
            </Link>
            <button
              onClick={() => {
                track(EVENTS.LANDING_CTA_CLICKED, { cta: 'take_a_tour' });
                startTour();
              }}
              className="inline-flex items-center gap-1.5 text-sm text-primary/80 hover:text-primary transition-colors"
            >
              <Map className="w-3.5 h-3.5" />
              Take a Tour
            </button>
          </div>
          <div className="flex justify-center">
            <ChevronDown className="w-7 h-7 text-primary/70 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Meal Planning */}
      <section className={`snap-start h-screen flex items-center justify-center bg-white relative ${showTopBanner ? 'pt-14' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <div className="mb-5 md:mb-6 flex justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Calendar className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={2} />
            </div>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary/70 mb-2 font-[family-name:var(--font-outfit)]">Feature</p>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 font-[family-name:var(--font-outfit)] tracking-tight">
            Weekly Meal Plans
          </h2>
          <p className="text-sm md:text-base text-muted mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed">
            Menus tailored to you, ready to go.
          </p>
          <Link
            href="/meal-plan"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            Plan Your Week
          </Link>
        </div>
        <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-7 h-7 text-primary/70 animate-bounce" />
        </div>
      </section>

      {/* Recipes */}
      <section className={`snap-start h-screen flex items-center justify-center bg-surface relative ${showTopBanner ? 'pt-14' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <div className="mb-5 md:mb-6 flex justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={2} />
            </div>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary/70 mb-2 font-[family-name:var(--font-outfit)]">Feature</p>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 font-[family-name:var(--font-outfit)] tracking-tight">
            Tailored Recipes
          </h2>
          <p className="text-sm md:text-base text-muted mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed">
            Recipes tailored to your diet and ingredients.
          </p>
          <button
            onClick={() => { track(EVENTS.LANDING_CTA_CLICKED, { cta: 'browse_recipes' }); router.push('/recipes'); }}
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5" />
            Browse Recipes
          </button>
        </div>
        <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-7 h-7 text-primary/70 animate-bounce" />
        </div>
      </section>

      {/* Get Started CTA */}
      <section className={`snap-start h-screen flex items-center justify-center relative overflow-hidden ${showTopBanner ? 'pt-14' : ''}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_#f0fdf4_0%,_#ecfdf5_50%,_#ccfbf1_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,_rgba(16,185,129,0.08),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 font-[family-name:var(--font-outfit)] tracking-tight">
            Ready to plan your week?
          </h2>
          <p className="text-sm md:text-base text-muted mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed">
            Generate a personalized meal plan in seconds. We&apos;ll use your preferences along the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Link
              href="/meal-plan"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              Plan Your Week
            </Link>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-white hover:bg-surface text-foreground border border-border font-semibold px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <Crown className="w-4 h-4 md:w-5 md:h-5" />
              Upgrade to Premium
            </Link>
            <button
              onClick={() => {
                alert('Install feature coming soon!');
              }}
              className="inline-flex items-center gap-2 bg-white hover:bg-surface text-foreground font-semibold px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-border w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              Install App
            </button>
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
