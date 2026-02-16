'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Calendar, Settings } from 'lucide-react';
import { useMealPlan } from '@/contexts/MealPlanContext';

const navItems = [
  { href: '/meal-plan', label: 'Meal Plan', icon: Calendar },
  { href: '/recipes', label: 'Recipes', icon: Heart },
  { href: '/customize', label: 'Preferences', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { generating } = useMealPlan();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
      <div className="flex justify-around">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const showGenerating = item.href === '/meal-plan' && generating && !isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 min-w-[72px] transition-colors ${
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" strokeWidth={2} />
                {showGenerating && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
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
