'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { RecipeProvider } from '@/contexts/RecipeContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { BillingProvider } from '@/contexts/BillingContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBanner } from './TopBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { getAnonymousId, clearAnonymousId } from '@/lib/anonymous-id';
import { migrateAnonymousData } from '@/lib/supabase/db';
import { useSupabase } from '@/hooks/useSupabase';
import { useBilling } from '@/contexts/BillingContext';
import { posthog } from '@/lib/analytics/posthog-client';
import { EVENTS } from '@/lib/analytics/events';

function AnonymousMigration() {
  const { userId, isAuthenticated, isLoaded } = useUserIdentity();
  const { refetch: refetchBilling } = useBilling();
  const supabase = useSupabase();
  const migrated = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isAuthenticated || !userId || migrated.current) return;
    migrated.current = true;

    const anonymousId = getAnonymousId();
    if (anonymousId) {
      migrateAnonymousData(supabase, anonymousId, userId)
        .then(() => {
          posthog.capture(EVENTS.ANONYMOUS_DATA_MIGRATED, { previous_anonymous_id: anonymousId });
          posthog.capture(EVENTS.USER_SIGNED_UP);
          clearAnonymousId();
          refetchBilling();
        })
        .catch((err) => console.error('Migration failed:', err));
    }
  }, [userId, isAuthenticated, isLoaded, refetchBilling, supabase]);

  return null;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, isSettingsLoaded } = useSettings();

  const isPublicPage = pathname === '/' || pathname === '/about' || pathname === '/login' || pathname === '/signup' || pathname === '/privacy' || pathname === '/terms';

  useEffect(() => {
    if (isSettingsLoaded && !isPublicPage && !settings.preferences.onboardingCompleted) {
      router.replace('/');
    }
  }, [isSettingsLoaded, isPublicPage, settings.preferences.onboardingCompleted, router]);

  if (!isSettingsLoaded && !isPublicPage) return null;

  return <>{children}</>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreenPage = pathname === '/' || pathname === '/about' || pathname === '/login' || pathname === '/signup' || pathname === '/privacy' || pathname === '/terms';

  return (
    <SettingsProvider>
      <OnboardingGuard>
        <ToastProvider>
          {isFullScreenPage ? (
            <div className="min-h-screen bg-background">
              <BottomNav />
              <main className="min-h-screen">
                {children}
              </main>
            </div>
          ) : (
            <RecipeProvider>
              <BillingProvider>
                <MealPlanProvider>
                  <AnonymousMigration />
                  <div className="min-h-screen bg-background">
                    <TopBanner />
                    <Sidebar />
                    <BottomNav />
                    <main className="md:ml-60 pb-16 md:pb-0 pt-14 min-h-screen">
                      <div className="max-w-6xl mx-auto p-4 md:p-6">
                        {children}
                      </div>
                    </main>
                  </div>
                </MealPlanProvider>
              </BillingProvider>
            </RecipeProvider>
          )}
        </ToastProvider>
      </OnboardingGuard>
    </SettingsProvider>
  );
}
