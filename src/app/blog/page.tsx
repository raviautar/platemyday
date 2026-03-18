import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — Meal Planning, Food Waste & Pantry Cooking',
  description: 'Practical guides on ingredient-based meal planning, reducing household food waste, and cooking from your pantry. Written by the PlateMyDay team.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'PlateMyDay Blog — Meal Planning, Food Waste & Pantry Cooking',
    description: 'Practical guides on ingredient-based meal planning, reducing household food waste, and cooking from your pantry.',
    url: '/blog',
  },
};

const POSTS = [
  {
    slug: 'best-ingredient-meal-planner-apps',
    title: 'Best Ingredient-Based Meal Planner Apps in 2026: An Honest Comparison',
    excerpt: 'Not all meal planners start with your pantry. We compare every major ingredient-based meal planning app — SuperCook, Mealime, MealThinker, and PlateMyDay — across features, pricing, and real-world usability.',
    readingTime: '8 min read',
    date: 'March 2026',
    tag: 'Comparison',
    tagColor: 'bg-[#3A7D44]/10 text-[#3A7D44]',
  },
  {
    slug: 'household-food-waste-statistics',
    title: 'The $2,913 Yearly Habit: A Data Deep-Dive on Household Food Waste',
    excerpt: 'The average family of four throws away nearly $3,000 in food every year. Here\'s what the latest EPA and ReFED data shows — in dollars, CO₂ emissions, and water usage — and what the most effective households do differently.',
    readingTime: '7 min read',
    date: 'March 2026',
    tag: 'Food Waste',
    tagColor: 'bg-[#D4764E]/10 text-[#D4764E]',
  },
  {
    slug: 'pantry-meal-planning-guide',
    title: 'The Complete Guide to Pantry Meal Planning: Cook from What You Have',
    excerpt: 'A practical step-by-step method for building a full week of meals from your existing ingredients. Includes pantry staples tables, a sample week, and how to handle the most common obstacles.',
    readingTime: '9 min read',
    date: 'March 2026',
    tag: 'Guide',
    tagColor: 'bg-[#8B7355]/10 text-[#8B7355]',
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-[#FEFCF8]">
      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#FEFCF8]/90 backdrop-blur-sm border-b border-[#E4D9CC]/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B5744] hover:text-[#3A7D44] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PlateMyDay
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3A7D44] hover:text-[#2D6235] transition-colors"
          >
            <Image src="/assets/logo.png" alt="PlateMyDay" width={24} height={24} className="w-6 h-6" />
            PlateMyDay
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3A7D44] mb-3">PlateMyDay Blog</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] mb-3">
          Meal Planning, Food Waste & Pantry Cooking
        </h1>
        <p className="text-[#6B5744] text-base max-w-xl leading-relaxed">
          Practical guides on ingredient-based cooking, reducing what you throw away, and getting more from the food you already have.
        </p>
      </header>

      <div className="h-px bg-[#E4D9CC] max-w-3xl mx-auto" />

      {/* Posts */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-6">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-[#E4D9CC] hover:border-[#3A7D44]/40 rounded-2xl p-6 sm:p-7 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${post.tagColor}`}>
                  {post.tag}
                </span>
                <span className="text-xs text-[#9B8B7A] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readingTime}
                </span>
                <span className="text-xs text-[#9B8B7A]">· {post.date}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] mb-2 group-hover:text-[#3A7D44] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-[#6B5744] leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#3A7D44] group-hover:gap-2 transition-all">
                Read article <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-br from-[#3A7D44]/10 to-[#3A7D44]/5 rounded-3xl border border-[#3A7D44]/20 p-7 text-center">
          <h2 className="text-xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] mb-2">
            Ready to put it into practice?
          </h2>
          <p className="text-[#6B5744] text-sm mb-5 max-w-sm mx-auto">
            PlateMyDay builds a full week of meals from your pantry ingredients. Free to try, no account needed.
          </p>
          <Link
            href="/meal-plan"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#3A7D44] to-[#2D6235] text-white font-semibold px-7 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Try PlateMyDay Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
