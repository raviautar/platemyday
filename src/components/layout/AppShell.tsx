'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { RecipeProvider } from '@/contexts/RecipeContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBanner } from './TopBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { getAnonymousId, clearAnonymousId } from '@/lib/anonymous-id';
import { migrateAnonymousData } from '@/lib/supabase/db';
import { posthog } from '@/lib/analytics/posthog-client';
import { EVENTS } from '@/lib/analytics/events';

function AnonymousMigration() {
  const { user, isLoaded } = useUser();
  const migrated = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || migrated.current) return;
    migrated.current = true;

    const anonymousId = getAnonymousId();
    if (anonymousId) {
      migrateAnonymousData(anonymousId, user.id)
        .then(() => {
          posthog.capture(EVENTS.ANONYMOUS_DATA_MIGRATED, { previous_anonymous_id: anonymousId });
          posthog.capture(EVENTS.USER_SIGNED_UP);
          clearAnonymousId();
        })
        .catch((err) => console.error('Migration failed:', err));
    }
  }, [user, isLoaded]);

  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <SettingsProvider>
      <RecipeProvider>
        <ToastProvider>
          <MealPlanProvider>
            <AnonymousMigration />
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
          </MealPlanProvider>
        </ToastProvider>
      </RecipeProvider>
    </SettingsProvider>
  );
}
