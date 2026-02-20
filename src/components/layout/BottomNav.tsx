'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Calendar, Settings } from 'lucide-react';
import { useMealPlanOptional } from '@/contexts/MealPlanContext';

const navItems = [
  { href: '/meal-plan', label: 'Meal Plan', icon: Calendar, featureId: 'feature1' },
  { href: '/recipes', label: 'Recipes', icon: Heart, featureId: 'feature2' },
  { href: '/customize', label: 'Preferences', icon: Settings, featureId: 'feature3' },
];

export function BottomNav() {
  const pathname = usePathname();
  const mealPlan = useMealPlanOptional();
  const generating = mealPlan?.generating ?? false;
  const [focusStep, setFocusStep] = useState<string | null>(null);

  useEffect(() => {
    const handleFocus = (e: CustomEvent<string | null>) => {
      setFocusStep(e.detail);
    };
    window.addEventListener('onboarding-step', handleFocus as EventListener);
    return () => window.removeEventListener('onboarding-step', handleFocus as EventListener);
  }, []);

  return (
    <nav className={`fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg z-[100] transition-all duration-500 ${focusStep ? 'translate-y-0' : 'md:hidden'}`}>
      <div className="flex justify-around relative">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          const isFocused = focusStep === item.featureId;
          const isDimmed = focusStep && !isFocused;
          const Icon = item.icon;
          const showGenerating = item.href === '/meal-plan' && generating && !isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 min-w-[72px] transition-all duration-300 relative ${isActive ? 'text-primary font-medium' : isFocused ? 'text-emerald-600 font-bold scale-110 drop-shadow-md z-10' : 'text-muted'
                } ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}`}
            >
              <span className="relative">
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={isFocused ? 2.5 : 2} />
                {showGenerating && !isFocused && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
                )}
                {isFocused && (
                  <>
                    <span className="absolute -inset-3 bg-emerald-400/20 rounded-full blur-md animate-pulse -z-10" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-600" />
                    </span>
                  </>
                )}
              </span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
