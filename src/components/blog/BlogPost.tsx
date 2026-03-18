import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';

interface BlogPostProps {
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  children: React.ReactNode;
}

export function BlogPost({ title, description, publishedAt, readingTime, children }: BlogPostProps) {
  return (
    <div className="min-h-screen bg-[#FEFCF8]">
      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#FEFCF8]/90 backdrop-blur-sm border-b border-[#E4D9CC]/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B5744] hover:text-[#3A7D44] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All articles
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
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#3A7D44] bg-[#3A7D44]/10 px-3 py-1 rounded-full">
            PlateMyDay Blog
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] leading-tight mb-4">
          {title}
        </h1>
        <p className="text-lg text-[#6B5744] leading-relaxed mb-6 max-w-2xl">
          {description}
        </p>
        <div className="flex items-center gap-5 text-sm text-[#9B8B7A]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {publishedAt}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {readingTime}
          </span>
        </div>
      </header>

      <div className="h-px bg-[#E4D9CC] max-w-3xl mx-auto" />

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="prose-blog">
          {children}
        </div>
      </article>

      <div className="h-px bg-[#E4D9CC] max-w-3xl mx-auto" />

      {/* Footer CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gradient-to-br from-[#3A7D44]/10 to-[#3A7D44]/5 rounded-3xl border border-[#3A7D44]/20 p-8 text-center">
          <Image src="/assets/logo.png" alt="PlateMyDay" width={64} height={64} className="w-14 h-14 mx-auto mb-4 drop-shadow-lg" />
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)] mb-2">
            Ready to stop wasting food?
          </h2>
          <p className="text-[#6B5744] text-sm mb-6 max-w-sm mx-auto">
            PlateMyDay builds a full week of meals from what&apos;s already in your kitchen. Free to try — no account needed.
          </p>
          <Link
            href="/meal-plan"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#3A7D44] to-[#2D6235] text-white font-semibold px-7 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Try PlateMyDay Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-8 text-center">
          <Link href="/blog" className="text-sm text-[#9B8B7A] hover:text-[#3A7D44] transition-colors">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
