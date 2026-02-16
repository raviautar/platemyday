'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Calendar, Settings, Crown } from 'lucide-react';
import { useMealPlan } from '@/contexts/MealPlanContext';

const navItems = [
  { href: '/meal-plan', label: 'Meal Plan', icon: Calendar },
  { href: '/recipes', label: 'Recipes', icon: Heart },
  { href: '/customize', label: 'Preferences', icon: Settings },
  { href: '/upgrade', label: 'Upgrade', icon: Crown },
];

export function Sidebar() {
  const pathname = usePathname();
  const { generating } = useMealPlan();

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:top-14 md:bottom-0 md:left-0 bg-surface/95 backdrop-blur-sm border-r border-border">
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const showGenerating = item.href === '/meal-plan' && generating && !isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-surface-dark/50'
              }`}
            >
              <span
                className={`relative flex shrink-0 rounded-lg p-1.5 ${
                  isActive ? 'bg-white/20' : 'bg-surface-dark/70'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {showGenerating && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
