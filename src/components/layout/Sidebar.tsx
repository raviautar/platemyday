'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/recipes', label: 'Recipes', icon: '🍽️' },
  { href: '/meal-plan', label: 'Meal Plan', icon: '📅' },
  { href: '/customize', label: 'Customize', icon: '⚙️' },
  { href: '/upgrade', label: 'Upgrade', icon: '⭐' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:top-14 md:bottom-0 md:left-0 bg-surface border-r border-border">
      <div className="p-6">
        <Link href="/recipes" className="flex items-center gap-3">
          <Image 
            src="/assets/logo.png" 
            alt="PlateMyMeal Logo" 
            width={48} 
            height={48}
            className="w-12 h-12 rounded-lg"
            priority
          />
          <h1 className="text-xl font-bold text-primary-dark">PlateMyMeal</h1>
        </Link>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-foreground hover:bg-surface-dark'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
