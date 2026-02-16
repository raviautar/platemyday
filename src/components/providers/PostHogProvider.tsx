'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, posthog } from '@/lib/analytics/posthog-client';
import { useUserIdentity } from '@/hooks/useUserIdentity';

function PostHogPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const url = `${window.location.origin}${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { userId, anonymousId, isAuthenticated, isLoaded } = useUserIdentity();
  const prevAuthRef = useRef(false);

  // Initialize PostHog once
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user when identity loads or changes
  useEffect(() => {
    if (!isLoaded || !anonymousId) return;

    if (isAuthenticated && userId) {
      // If user just signed in (was anonymous before), alias to link sessions
      if (!prevAuthRef.current) {
        posthog.alias(userId, anonymousId);
      }
      posthog.identify(userId, {
        is_authenticated: true,
      });
    } else if (anonymousId) {
      posthog.identify(anonymousId, {
        is_authenticated: false,
      });
    }

    prevAuthRef.current = isAuthenticated;
  }, [userId, anonymousId, isAuthenticated, isLoaded]);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageTracker />
      </Suspense>
      {children}
    </>
  );
}
