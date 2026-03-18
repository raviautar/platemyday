'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle, ArrowRight, Leaf, Package, Sparkles, Crown, ChevronDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'What is ingredient-based meal planning?',
    a: 'Ingredient-based meal planning starts with what\'s already in your kitchen — your fridge, freezer, and pantry — and builds a full week of meals around those items. Instead of shopping for a recipe and buying everything from scratch, you cook from what you have. PlateMyDay automates this process: tell it your available ingredients, and it generates a complete 7-day meal plan with recipes and a minimal shopping list for anything missing.',
  },
  {
    q: 'How does PlateMyDay reduce food waste?',
    a: 'The average household throws away nearly a third of the food it buys. Most of that waste comes from buying ingredients for specific recipes, then not finishing them. PlateMyDay flips the model: your ingredients drive the meal plan, so everything gets used up across the week. The shopping list only covers genuine gaps, so you never overbuy again.',
  },
  {
    q: 'Is PlateMyDay free to use?',
    a: 'Yes — PlateMyDay is free to start. You get 10 meal plan generations on the free tier, no account required. For unlimited planning, Pro plans start at a low monthly price. See the pricing page for details.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account is needed to get started. You can add your pantry ingredients and generate a full week of meals immediately. Creating a free account lets you save your recipes and meal plans across devices.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { track } = useAnalytics();
  const { isLoaded: isAuthLoaded, isAuthenticated } = useUserIdentity();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleStart = () => {
    track(EVENTS.LANDING_CTA_CLICKED, { cta: 'hero_start_planning' });
    router.push('/meal-plan');
  };

  return (
    <div className="w-full relative overflow-x-hidden overflow-y-auto bg-background">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-end items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/upgrade"
          className="text-foreground/70 hover:text-foreground transition-all backdrop-blur-sm bg-white/50 p-2 rounded-full border border-white/60 shadow-sm hover:shadow inline-flex items-center"
          title="Pricing"
        >
          <Crown className="w-4 h-4" />
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

      {/* ── Hero ── */}
      <div className="relative min-h-[100dvh]">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_#FEFCF8_0%,_#F3EDE4_30%,_#E4D9CC_70%,_#FEFCF8_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(58,125,68,0.15),transparent)]" />
        <div className="absolute top-[10%] left-[5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#D4764E]/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#3A7D44]/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />

        {/* Floating mascot images */}
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

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-4 pt-20 pb-6">
          <div className="text-center w-full max-w-2xl mx-auto">
            {/* Logo */}
            <div className="mb-3 flex justify-center">
              <Image
                src="/assets/logo.png"
                alt="PlateMyDay"
                width={200}
                height={200}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 drop-shadow-2xl"
                priority
              />
            </div>

            {/* H1 — keyword-rich */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 font-[family-name:var(--font-outfit)] tracking-tight">
              <span className="bg-gradient-to-r from-[#3A7D44] via-[#2D6235] to-[#3A7D44] bg-clip-text text-transparent">
                Ingredient-Based<br className="hidden sm:block" /> Meal Planner
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl font-medium text-foreground/80 mb-1 font-[family-name:var(--font-outfit)]">
              Stop wasting food. Start eating better.
            </p>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-muted max-w-xs sm:max-w-sm mx-auto mb-8 leading-relaxed">
              Tell us what&apos;s in your kitchen. We&apos;ll build a full week of delicious meals — and a shopping list for only what you&apos;re missing.
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

            {/* 3-step strip */}
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
                <span className="text-[10px] sm:text-xs font-medium text-muted">Generate plan</span>
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

      {/* ── SEO Content ── */}
      <div className="relative bg-[#FEFCF8] border-t border-[#E4D9CC]/60">

        {/* How It Works */}
        <section className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center font-[family-name:var(--font-outfit)] text-foreground mb-2">
            How Ingredient-Based Meal Planning Works
          </h2>
          <p className="text-center text-muted text-sm sm:text-base mb-12 max-w-xl mx-auto leading-relaxed">
            PlateMyDay is a free meal planner that builds your week around what you already have — not a shopping list you haven&apos;t bought yet.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground font-[family-name:var(--font-outfit)]">1. Add your pantry</h3>
              <p className="text-sm text-muted leading-relaxed">
                Enter the ingredients you have on hand — fridge, freezer, cupboard. The more you add, the smarter your plan.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-accent-dark" />
              </div>
              <h3 className="font-semibold text-foreground font-[family-name:var(--font-outfit)]">2. Generate your meal plan</h3>
              <p className="text-sm text-muted leading-relaxed">
                PlateMyDay generates a full 7-day meal plan with recipes tailored to your dietary preferences and what you have available.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center shrink-0">
                <Leaf className="w-7 h-7 text-secondary-dark" />
              </div>
              <h3 className="font-semibold text-foreground font-[family-name:var(--font-outfit)]">3. Cook, waste less, save more</h3>
              <p className="text-sm text-muted leading-relaxed">
                Your shopping list covers only what&apos;s genuinely missing. No over-buying, no forgotten spinach wilting in the fridge.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold px-7 py-3 rounded-2xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Try It Free — No Account Needed
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <div className="h-px bg-[#E4D9CC]/60 mx-6" />

        {/* Why reduce food waste */}
        <section className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] text-foreground mb-6">
            Why a Pantry-First Approach Saves Money and the Planet
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-muted leading-relaxed">
            <p>
              The average household throws away <strong className="text-foreground">nearly 30% of the food it buys</strong> — roughly $1,500 per year in wasted groceries. Most of that waste is preventable. It happens because we plan meals before checking what we already have, then overbuy at the supermarket.
            </p>
            <p>
              Ingredient-based cooking flips the sequence. When you start with what&apos;s in your kitchen — the half-used bag of rice, the chicken thighs you meant to cook three days ago, the vegetables about to turn — every item gets a purpose. Your fridge empties, your bin stays light, and your shopping bill drops.
            </p>
            <p>
              PlateMyDay is a <strong className="text-foreground">free meal planner built specifically for this workflow</strong>. It generates a recipe for every meal slot in your week, cross-references your pantry, and produces a consolidated shopping list for only what you need to top up. No duplicate buys, no half-used cans of coconut milk gathering dust.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
            >
              Learn more about our approach
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/upgrade"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-foreground/10 text-foreground/70 font-semibold text-sm hover:border-foreground/20 hover:text-foreground transition-all duration-200"
            >
              <Crown className="w-4 h-4" />
              See Pro pricing
            </Link>
          </div>
        </section>

        <div className="h-px bg-[#E4D9CC]/60 mx-6" />

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] text-foreground mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#E4D9CC] bg-white/70 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-foreground text-sm sm:text-base font-[family-name:var(--font-outfit)]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer badge */}
        <div className="border-t border-[#E4D9CC]/60 py-8 flex justify-center">
          <a
            href="https://ravilution.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-foreground/50 hover:text-foreground transition-all px-4 py-2 rounded-full hover:bg-white/50"
          >
            by
            <Image src="/assets/ravilution-icon.png" alt="ravilution.ai" width={18} height={18} className="w-4 h-4 rounded-full" />
            <span className="font-bold">Ravilution</span>
          </a>
        </div>
      </div>
    </div>
  );
}
