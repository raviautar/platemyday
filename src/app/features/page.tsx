import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package, Sparkles, ShoppingCart, Calendar, Heart, Leaf, Settings, Smartphone, Crown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features — Pantry Meal Planner & Food Waste Reduction App',
  description: 'Explore every feature of PlateMyDay: pantry-based meal planning, 7-day plan generation, smart shopping lists, recipe saving, dietary preferences, and more. Free to try.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'PlateMyDay Features — Pantry Meal Planner & Food Waste App',
    description: 'Pantry tracking, 7-day meal plan generation, smart shopping lists, and more. The ingredient-based meal planner built around reducing food waste.',
    url: '/features',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlateMyDay Features — Pantry Meal Planner & Food Waste App',
    description: 'Every feature of PlateMyDay: pantry-first meal planning, smart shopping lists, dietary preferences, and more.',
    images: ['/opengraph-image'],
  },
};

const FEATURES = [
  {
    icon: Package,
    title: 'Pantry Ingredient Tracking',
    keyword: 'pantry meal planner',
    description:
      'Add every ingredient you have — fridge, freezer, cupboard — and PlateMyDay builds your meal plan around them. No more buying ingredients you already own or throwing away produce that never made it into a recipe.',
    detail: [
      'Add unlimited pantry items with quantities',
      'Supports fresh, frozen, tinned, and dry goods',
      'Ingredients persist across sessions',
      'Update after each shop in minutes',
    ],
    color: 'bg-[#3A7D44]/10',
    iconColor: 'text-[#3A7D44]',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered 7-Day Meal Plan Generation',
    keyword: 'weekly meal plan generator',
    description:
      'PlateMyDay generates a complete week of meals — breakfast, lunch, and dinner — tailored to your pantry and dietary preferences. Powered by Google Gemini, every plan is unique and uses up what you have before it spoils.',
    detail: [
      'Full 7-day plan generated in seconds',
      'Recipes built around your available ingredients',
      'Balanced variety across the week',
      'Regenerate individual meals without redoing the whole plan',
    ],
    color: 'bg-[#D4764E]/10',
    iconColor: 'text-[#D4764E]',
  },
  {
    icon: ShoppingCart,
    title: 'Smart Gap-Fill Shopping List',
    keyword: 'ingredient based cooking app',
    description:
      'Your shopping list is calculated automatically — it covers only what your meal plan needs that isn\'t already in your pantry. You buy less, waste less, and never come home with duplicate groceries again.',
    detail: [
      'Consolidated list across all 7 days',
      'Shows only what\'s genuinely missing from your pantry',
      'Grouped by category for faster shopping',
      'Updates live as you regenerate meals',
    ],
    color: 'bg-[#8B7355]/10',
    iconColor: 'text-[#8B7355]',
  },
  {
    icon: Heart,
    title: 'Recipe Library',
    keyword: 'recipe generator from ingredients',
    description:
      'Every generated recipe is saved to your personal recipe library. Browse, search, and reuse your favourites. Add recipes manually, or generate new ones from specific ingredients whenever you want a quick idea.',
    detail: [
      'Save unlimited recipes to your library',
      'Generate recipes on-demand from any ingredient set',
      'Tag and filter by cuisine, diet, and time',
      'Edit AI-generated recipes to match your taste',
    ],
    color: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
  },
  {
    icon: Leaf,
    title: 'Food Waste Reduction by Design',
    keyword: 'food waste reduction app',
    description:
      'PlateMyDay is architected around one goal: getting every ingredient you buy into a meal. The plan prioritises items nearing expiry, uses ingredients across multiple meals in the same week, and generates a shopping list that fills gaps rather than starting from scratch.',
    detail: [
      'Ingredient-first planning eliminates the recipe-first waste cycle',
      'Average household saves $600–900/year in reduced food waste',
      'No leftover pantry ingredients without a plan',
      'Minimal shopping list reduces over-buying',
    ],
    color: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Settings,
    title: 'Dietary Preferences & Customisation',
    keyword: 'personalised meal planner',
    description:
      'Set your dietary requirements once and every generated plan will respect them. Whether you\'re vegetarian, gluten-free, dairy-free, or following a specific cuisine style, PlateMyDay generates meals that fit your household.',
    detail: [
      'Supports vegetarian, vegan, gluten-free, dairy-free, and more',
      'Set cuisine preferences (Mediterranean, Asian, etc.)',
      'Adjust servings for household size',
      'Set disliked ingredients to exclude from all plans',
    ],
    color: 'bg-purple-500/10',
    iconColor: 'text-purple-600',
  },
  {
    icon: Calendar,
    title: 'Meal Plan History',
    keyword: 'weekly meal planning app',
    description:
      'Every meal plan you generate is saved to your history. Browse and restore previous weeks, see which plans you\'ve used most, and use past plans as a starting point when your pantry looks similar.',
    detail: [
      'Full history of all generated plans',
      'One-click restore to bring back a previous week',
      'Compare pantry states across weeks',
      'Available to signed-in users across devices',
    ],
    color: 'bg-sky-500/10',
    iconColor: 'text-sky-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile App — Works on Any Device',
    keyword: 'meal planning app mobile',
    description:
      'PlateMyDay is a Progressive Web App (PWA) — install it to your home screen on iOS or Android for a native app experience. Works offline for browsing your saved recipes and meal plan.',
    detail: [
      'Installable on iOS and Android home screen',
      'Offline access to saved recipes and current plan',
      'Optimised for one-handed mobile use',
      'No App Store required — install directly from the browser',
    ],
    color: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
];

const COMPARISON = [
  { feature: 'Starts from your pantry', pmd: true, supercook: true, mealime: false, other: false },
  { feature: 'Generates a full 7-day plan', pmd: true, supercook: false, mealime: true, other: false },
  { feature: 'Smart shopping list (gaps only)', pmd: true, supercook: false, mealime: false, other: false },
  { feature: 'Unlimited recipe variety (AI)', pmd: true, supercook: true, mealime: false, other: false },
  { feature: 'Dietary preference filters', pmd: true, supercook: false, mealime: true, other: false },
  { feature: 'Designed for food waste reduction', pmd: true, supercook: false, mealime: false, other: false },
  { feature: 'Free to start, no account needed', pmd: true, supercook: true, mealime: false, other: false },
  { feature: 'Works as a mobile app (PWA)', pmd: true, supercook: false, mealime: true, other: false },
];

function Check() {
  return <span className="text-[#3A7D44] font-bold text-base">✓</span>;
}
function Cross() {
  return <span className="text-[#C0392B] text-sm">✗</span>;
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF8]">
      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#FEFCF8]/90 backdrop-blur-sm border-b border-[#E4D9CC]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3A7D44] hover:text-[#2D6235] transition-colors">
            <Image src="/assets/logo.png" alt="PlateMyDay" width={24} height={24} className="w-6 h-6" />
            PlateMyDay
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-[#6B5744] hover:text-[#3A7D44] transition-colors">Blog</Link>
            <Link href="/upgrade" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#3A7D44] px-4 py-1.5 rounded-full hover:bg-[#2D6235] transition-colors">
              <Crown className="w-3.5 h-3.5" />
              Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-12 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#3A7D44] bg-[#3A7D44]/10 px-3 py-1 rounded-full mb-6">
          PlateMyDay Features
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] leading-tight mb-4">
          Every Feature Built Around<br className="hidden sm:block" /> Your Pantry
        </h1>
        <p className="text-lg text-[#6B5744] max-w-2xl mx-auto leading-relaxed mb-8">
          PlateMyDay is a pantry-first meal planner and food waste reduction app. Unlike recipe apps that generate a shopping list, PlateMyDay starts with what you already have and builds the entire week around it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/meal-plan"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#3A7D44] to-[#2D6235] text-white font-semibold px-7 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Try Free — No Account Needed
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/upgrade"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-[#3A7D44]/30 text-[#3A7D44] font-semibold text-sm hover:bg-[#3A7D44]/5 hover:border-[#3A7D44]/50 transition-all"
          >
            <Crown className="w-4 h-4" />
            See pricing
          </Link>
        </div>
      </header>

      <div className="h-px bg-[#E4D9CC] max-w-4xl mx-auto" />

      {/* Feature grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="space-y-16">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const isReversed = i % 2 !== 0;
            return (
              <div key={f.title} className={`flex flex-col ${isReversed ? 'sm:flex-row-reverse' : 'sm:flex-row'} gap-8 items-start`}>
                <div className="sm:w-2/5 shrink-0">
                  <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${f.iconColor}`} strokeWidth={1.75} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B8B7A] mb-1">{f.keyword}</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] mb-3 leading-snug">
                    {f.title}
                  </h2>
                  <p className="text-[#6B5744] text-sm leading-relaxed">{f.description}</p>
                </div>
                <div className="sm:w-3/5 bg-white border border-[#E4D9CC] rounded-2xl p-5 space-y-2.5">
                  {f.detail.map((d) => (
                    <div key={d} className="flex items-start gap-3">
                      <span className={`mt-0.5 w-5 h-5 rounded-full ${f.color} flex items-center justify-center shrink-0`}>
                        <span className={`text-[10px] font-bold ${f.iconColor}`}>✓</span>
                      </span>
                      <span className="text-sm text-[#4A3728]">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="h-px bg-[#E4D9CC] max-w-4xl mx-auto" />

      {/* Comparison table */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] mb-2 text-center">
          How PlateMyDay Compares
        </h2>
        <p className="text-center text-[#6B5744] text-sm mb-10 max-w-xl mx-auto">
          Most meal planners don't know what's in your kitchen. PlateMyDay does — and it's the only one designed specifically to reduce food waste.
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[540px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#3A7D44] text-white">
                <th className="text-left p-3 font-semibold rounded-tl-xl">Feature</th>
                <th className="text-center p-3 font-semibold bg-[#2D6235]">PlateMyDay</th>
                <th className="text-center p-3 font-semibold">SuperCook</th>
                <th className="text-center p-3 font-semibold">Mealime</th>
                <th className="text-center p-3 font-semibold rounded-tr-xl">Others</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FEFCF8]'}>
                  <td className="p-3 text-[#4A3728]">{row.feature}</td>
                  <td className="p-3 text-center bg-[#3A7D44]/5">{row.pmd ? <Check /> : <Cross />}</td>
                  <td className="p-3 text-center">{row.supercook ? <Check /> : <Cross />}</td>
                  <td className="p-3 text-center">{row.mealime ? <Check /> : <Cross />}</td>
                  <td className="p-3 text-center">{row.other ? <Check /> : <Cross />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#9B8B7A] mt-3 text-center">
          Based on publicly available feature information as of March 2026. See our{' '}
          <Link href="/blog/best-ingredient-meal-planner-apps" className="underline hover:no-underline">full comparison article</Link> for details.
        </p>
      </section>

      <div className="h-px bg-[#E4D9CC] max-w-4xl mx-auto" />

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-gradient-to-br from-[#3A7D44]/10 to-[#3A7D44]/5 rounded-3xl border border-[#3A7D44]/20 p-8 sm:p-12 text-center">
          <Image src="/assets/logo.png" alt="PlateMyDay" width={64} height={64} className="w-14 h-14 mx-auto mb-5 drop-shadow-lg" />
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] mb-3">
            Start Cooking From Your Pantry Today
          </h2>
          <p className="text-[#6B5744] text-base mb-8 max-w-md mx-auto leading-relaxed">
            Free to start, no account required. Add your ingredients and get a full week of meals built around what you already have.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/meal-plan"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#3A7D44] to-[#2D6235] text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] text-base"
            >
              Generate My First Meal Plan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/upgrade"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-[#3A7D44]/30 text-[#3A7D44] font-semibold text-sm hover:bg-[#3A7D44]/5 transition-all"
            >
              <Crown className="w-4 h-4" />
              See Pro plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
