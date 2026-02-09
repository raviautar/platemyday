'use client';

import { usePathname } from 'next/navigation';
import { RecipeProvider } from '@/contexts/RecipeContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBanner } from './TopBanner';
import { ToastProvider } from '@/components/ui/Toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <SettingsProvider>
      <RecipeProvider>
        <MealPlanProvider>
          <ToastProvider>
            <div className="min-h-screen bg-background">
              {!isHomePage && <TopBanner />}
              {!isHomePage && <Sidebar />}
              <BottomNav />
              <main className={`${isHomePage ? '' : 'md:ml-60 pb-16 md:pb-0 pt-14'} min-h-screen`}>
                {isHomePage ? (
                  children
                ) : (
                  <div className="max-w-6xl mx-auto p-4 md:p-6">
                    {children}
                  </div>
                )}
              </main>
            </div>
          </ToastProvider>
        </MealPlanProvider>
      </RecipeProvider>
    </SettingsProvider>
  );
}
