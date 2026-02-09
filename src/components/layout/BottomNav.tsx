'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, Calendar, Settings, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/recipes', label: 'Recipes', icon: UtensilsCrossed },
  { href: '/meal-plan', label: 'Meal Plan', icon: Calendar },
  { href: '/settings', label: 'Customize', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
      <div className="flex justify-around">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
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
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
