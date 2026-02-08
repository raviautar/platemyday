'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/recipes', label: 'Recipes', icon: '🍽️' },
  { href: '/meal-plan', label: 'Meal Plan', icon: '📅' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border z-50">
      <div className="flex justify-around">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
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
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
