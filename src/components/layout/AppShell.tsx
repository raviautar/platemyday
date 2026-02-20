'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
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
import { useBilling } from '@/contexts/BillingContext';
import { TourProvider } from '@/contexts/TourContext';
import { TourOverlay } from '@/components/tour/TourOverlay';
import { posthog } from '@/lib/analytics/posthog-client';
import { EVENTS } from '@/lib/analytics/events';

function AnonymousMigration() {
  const { user, isLoaded } = useUser();
  const { refetch: refetchBilling } = useBilling();
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
          refetchBilling();
        })
        .catch((err) => console.error('Migration failed:', err));
    }
  }, [user, isLoaded, refetchBilling]);

  return null;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, isSettingsLoaded } = useSettings();

  useEffect(() => {
    if (isSettingsLoaded && pathname !== '/' && !settings.preferences.onboardingCompleted) {
      router.replace('/');
    }
  }, [isSettingsLoaded, pathname, settings.preferences.onboardingCompleted, router]);

  if (!isSettingsLoaded && pathname !== '/') return null;

  return <>{children}</>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <TourProvider>
      <SettingsProvider>
        <OnboardingGuard>
          <RecipeProvider>
            <BillingProvider>
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
                    <TourOverlay />
                  </div>
                </MealPlanProvider>
              </ToastProvider>
            </BillingProvider>
          </RecipeProvider>
        </OnboardingGuard>
      </SettingsProvider>
    </TourProvider>
  );
}
