'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_#FEFCF8_0%,_#F3EDE4_30%,_#E4D9CC_70%,_#FEFCF8_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(58,125,68,0.12),transparent)]" />

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
            <span className="bg-gradient-to-r from-[#3A7D44] via-[#2D6235] to-[#3A7D44] bg-clip-text text-transparent">
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

        {/* Philosophy callout */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-border p-6 md:p-8 mb-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 font-[family-name:var(--font-outfit)]">
            What is ingredient-based cooking?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-4">
            Instead of picking a recipe and buying everything from scratch, you start with what&apos;s already in your kitchen. It&apos;s how home cooks have always cooked — and it&apos;s the simplest way to waste less food and spend less money.
          </p>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            PlateMyDay makes it effortless. Tell us what&apos;s in your fridge, and we&apos;ll turn it into a full week of meals — balanced, delicious, and built around ingredients you already have.
          </p>
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
              <h2 className="font-semibold text-foreground text-lg mb-1.5 font-[family-name:var(--font-outfit)]">Your ingredients come first</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                PlateMyDay flips the script on meal planning. Instead of shopping for recipes, your pantry drives every plan. The chicken in your fridge, the rice in your cupboard — they become dinner, not waste.
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
              <h2 className="font-semibold text-foreground text-lg mb-1.5 font-[family-name:var(--font-outfit)]">Buy only what&apos;s missing</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your shopping list is the gap between what you have and what you need — nothing more. No duplicate buys, no forgotten bags of spinach wilting in the back of the fridge.
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
              <h2 className="font-semibold text-foreground text-lg mb-1.5 font-[family-name:var(--font-outfit)]">Less waste, more flavor</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                When you cook from ingredients on hand, you eat fresher, spend smarter, and throw away less. It&apos;s a small shift that adds up — for your wallet and the planet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
