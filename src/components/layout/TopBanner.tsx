'use client';

import { usePathname } from 'next/navigation';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Crown, UserCircle } from 'lucide-react';
import Link from 'next/link';

export function TopBanner() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const handleLogoClick = () => {
    if (isHomePage) {
      window.dispatchEvent(new CustomEvent('platemyday-scroll-to-hero'));
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-700/30 shadow-lg z-50 flex items-center justify-between px-4 md:px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {isHomePage ? (
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex-shrink-0 focus:outline-none"
            aria-label="Scroll to top"
          >
            <img
              src="/assets/logo.png"
              alt="PlateMyMeal"
              width={64}
              height={64}
              className="block w-16 h-16 md:w-14 md:h-14 drop-shadow-lg object-contain"
            />
          </button>
        ) : (
          <Link href="/" className="flex-shrink-0">
            <img
              src="/assets/logo.png"
              alt="PlateMyMeal"
              width={64}
              height={64}
              className="block w-16 h-16 md:w-14 md:h-14 drop-shadow-lg object-contain"
            />
          </Link>
        )}
        
        <div className="flex flex-col -space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-normal drop-shadow-md relative font-[family-name:var(--font-outfit)]">
            <span className="bg-gradient-to-r from-white via-yellow-50 to-white bg-clip-text text-transparent animate-shimmer">
              PlateMyMeal
            </span>
          </h1>
          <p className="text-[10px] md:text-xs text-emerald-50/90 font-medium tracking-wide hidden sm:block font-[family-name:var(--font-outfit)]">
            Your personalized meal planner
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-auto">
        <Link 
          href="/upgrade" 
          className="group p-2 rounded-full hover:bg-white/10 transition-all duration-200"
          aria-label="Upgrade"
        >
          <Crown 
            className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]" 
            strokeWidth={2.5}
            fill="rgba(253, 224, 71, 0.3)"
          />
        </Link>
        
        <SignedOut>
          <SignInButton mode="modal">
            <button className="p-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95" aria-label="Sign In">
              <UserCircle className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2} />
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 ring-2 ring-white/50",
                userButtonPopoverCard: "shadow-xl",
              }
            }}
          />
        </SignedIn>
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
