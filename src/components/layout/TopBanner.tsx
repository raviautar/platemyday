'use client';

import { usePathname } from 'next/navigation';
import { Crown, UserCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { useBilling } from '@/contexts/BillingContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { UserMenu } from './UserMenu';

function CreditBadgeCrown() {
  const { unlimited, creditsRemaining, loading } = useBilling();

  const badge = (() => {
    if (loading) return null;

    if (unlimited) {
      return (
        <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-white text-primary text-[9px] font-bold shadow-sm">
          <Check className="w-2.5 h-2.5" strokeWidth={3} />
        </span>
      );
    }

    const remaining = creditsRemaining ?? 0;
    const isZero = remaining === 0;

    return (
      <span className={`absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] px-0.5 rounded-full text-[9px] font-bold shadow-sm ${
        isZero ? 'bg-accent text-white' : 'bg-white text-primary'
      }`}>
        {remaining}
      </span>
    );
  })();

  return (
    <Link
      href="/upgrade"
      className="group relative p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-all duration-200 flex-shrink-0"
      aria-label="Upgrade"
    >
      <Crown
        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]"
        strokeWidth={2.5}
        fill="rgba(253, 224, 71, 0.3)"
      />
      {badge}
    </Link>
  );
}

export function TopBanner() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { isAuthenticated } = useUserIdentity();

  const handleLogoClick = () => {
    if (isHomePage) {
      window.dispatchEvent(new CustomEvent('platemyday-scroll-to-hero'));
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-700/30 shadow-lg z-50 flex items-center justify-between px-3 sm:px-4 md:px-6 backdrop-blur-sm gap-2 min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
        {isHomePage ? (
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex-shrink-0 focus:outline-none"
            aria-label="Scroll to top"
          >
            <img
              src="/assets/logo.png"
              alt="PlateMyDay"
              width={64}
              height={64}
              className="block w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-lg object-contain"
            />
          </button>
        ) : (
          <Link href="/" className="flex-shrink-0">
            <img
              src="/assets/logo.png"
              alt="PlateMyDay"
              width={64}
              height={64}
              className="block w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-lg object-contain"
            />
          </Link>
        )}

        <Link href="/" className="flex flex-col -space-y-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-normal drop-shadow-md relative font-[family-name:var(--font-outfit)] truncate">
            <span className="bg-gradient-to-r from-white via-yellow-50 to-white bg-clip-text text-transparent animate-shimmer">
              PlateMyDay
            </span>
          </h1>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-emerald-50/90 font-medium tracking-wide hidden sm:block font-[family-name:var(--font-outfit)]">
            Your personalized meal planner
          </p>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <CreditBadgeCrown />

        {!isAuthenticated ? (
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="p-1.5 sm:p-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex-shrink-0"
            aria-label="Sign In"
          >
            <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
          </Link>
        ) : (
          <UserMenu />
        )}
      </div>

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
      `}</style>
    </header>
  );
}
