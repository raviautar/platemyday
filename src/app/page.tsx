'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Sparkles, Calendar, Crown, Download, UtensilsCrossed } from 'lucide-react';
import { TopBanner } from '@/components/layout/TopBanner';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useSettings } from '@/contexts/SettingsContext';

export default function HomePage() {
  const [showTopBanner, setShowTopBanner] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { settings } = useSettings();

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
      <section className="snap-start h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50">
        <div className="text-center px-4 w-full">
          <div className="mb-8 flex justify-center">
            <Image
              src="/assets/logo.png"
              alt="PlateMyDay Logo"
              width={200}
              height={200}
              className="w-40 h-40 md:w-52 md:h-52 drop-shadow-2xl animate-bounce-slow"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 font-[family-name:var(--font-outfit)]">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent animate-shimmer">
              PlateMyDay
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-8 font-[family-name:var(--font-outfit)]">
            Your personalized meal planner
          </p>
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                if (!settings.preferences.onboardingCompleted && !settings.preferences.onboardingDismissed) {
                  setShowOnboarding(true);
                } else {
                  router.push('/recipes');
                }
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              Let's Get Cookin'
            </button>
          </div>
          <div className="flex justify-center">
            <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
          </div>
        </div>
      </section>

      <section className={`snap-start h-screen flex items-center justify-center bg-white relative ${showTopBanner ? 'pt-14' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <div className="mb-4 md:mb-6 flex justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-6 font-[family-name:var(--font-outfit)]">
            AI-Powered Recipes
          </h2>
          <p className="text-sm md:text-lg text-muted mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Personalized recipes for your diet and ingredients. Delicious meals, instantly.
          </p>
          <button
            onClick={() => router.push('/recipes')}
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <UtensilsCrossed className="w-5 h-5" />
            Browse Recipes
          </button>
        </div>
        <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
        </div>
      </section>

      <section className={`snap-start h-screen flex items-center justify-center bg-surface relative ${showTopBanner ? 'pt-14' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <div className="mb-4 md:mb-6 flex justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
              <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-6 font-[family-name:var(--font-outfit)]">
            Weekly Meal Plans
          </h2>
          <p className="text-sm md:text-lg text-muted mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Weekly menus from your recipes and preferences. Balanced, varied, ready to go.
          </p>
          <Link
            href="/meal-plan"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Calendar className="w-5 h-5" />
            Plan Your Week
          </Link>
        </div>
        <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
        </div>
      </section>

      <section className={`snap-start h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 ${showTopBanner ? 'pt-14' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-6 font-[family-name:var(--font-outfit)]">
            Get the Most Out of PlateMyDay
          </h2>
          <p className="text-sm md:text-lg text-muted mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Unlock premium features or install the app for the best experience
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </Link>
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
                  alert('Install feature coming soon!');
                } else {
                  alert('Install feature coming soon!');
                }
              }}
              className="inline-flex items-center gap-2 bg-white hover:bg-surface text-foreground font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-border w-full sm:w-auto justify-center"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          </div>
        </div>
      </section>

        <style jsx>{`
          @keyframes shimmer {
            0%, 100% {
              background-size: 200% 100%;
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          .animate-shimmer {
            animation: shimmer 3s ease-in-out infinite;
          }

          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
        `}</style>
      </div>

      <OnboardingWizard isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </>
  );
}
