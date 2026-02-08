'use client';

import { RecipeProvider } from '@/contexts/RecipeContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <RecipeProvider>
        <MealPlanProvider>
          <ToastProvider>
            <div className="min-h-screen bg-background">
              <Sidebar />
              <BottomNav />
              <main className="md:ml-60 pb-16 md:pb-0 min-h-screen">
                <div className="max-w-6xl mx-auto p-4 md:p-6">
                  {children}
                </div>
              </main>
            </div>
          </ToastProvider>
        </MealPlanProvider>
      </RecipeProvider>
    </SettingsProvider>
  );
}
