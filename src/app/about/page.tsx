'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_30%,_#ccfbf1_70%,_#f0fdf4_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(16,185,129,0.15),transparent)]" />

      {/* Top Nav */}
      <div className="relative z-20 flex items-center px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="text-center mb-6">
          <Image
            src="/assets/logo.png"
            alt="PlateMyDay Logo"
            width={120}
            height={120}
            className="w-20 h-20 mx-auto mb-4 drop-shadow-xl"
            priority
          />
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] tracking-tight mb-3">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              About PlateMyDay
            </span>
          </h1>
        </div>

        {/* Developed by ravilution.ai */}
        <div className="mb-12">
          <a
            href="https://ravilution.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 mx-auto w-fit px-6 py-3 rounded-2xl bg-white/80 backdrop-blur border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
          >
            <Image
              src="/assets/ravilution-icon.png"
              alt="ravilution.ai"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium leading-none mb-0.5">Developed by</span>
              <span className="text-base font-bold text-foreground font-[family-name:var(--font-outfit)] leading-tight group-hover:text-primary transition-colors">ravilution.ai</span>
            </div>
          </a>
        </div>

        {/* Story sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <Image
                src="/assets/actions/cooking.png"
                alt="Chef carrot cooking"
                width={140}
                height={140}
                className="w-28 h-28 md:w-32 md:h-32 drop-shadow-lg"
              />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-1.5 font-[family-name:var(--font-outfit)]">Cooking made simple</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We built PlateMyDay because meal planning shouldn&apos;t feel like a chore. Tell us your preferences and we&apos;ll handle the rest.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex items-center gap-6 flex-row-reverse">
            <div className="shrink-0">
              <Image
                src="/assets/actions/salad.png"
                alt="Chef carrot serving salad"
                width={140}
                height={140}
                className="w-28 h-28 md:w-32 md:h-32 drop-shadow-lg"
              />
            </div>
            <div className="text-right">
              <h2 className="font-semibold text-foreground text-lg mb-1.5 font-[family-name:var(--font-outfit)]">Personalized for you</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every meal plan is generated around your dietary needs, allergies, and taste. No generic templates, just food you&apos;ll actually enjoy.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <Image
                src="/assets/actions/baking.png"
                alt="Chef carrot baking"
                width={140}
                height={140}
                className="w-28 h-28 md:w-32 md:h-32 drop-shadow-lg"
              />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-1.5 font-[family-name:var(--font-outfit)]">Always improving</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We&apos;re constantly adding new features and refining our engine to give you better recipes and smarter plans every week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
