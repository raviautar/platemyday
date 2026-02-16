'use client';

import { useCallback } from 'react';
import { posthog } from '@/lib/analytics/posthog-client';
import { useUserIdentity } from '@/hooks/useUserIdentity';

export function useAnalytics() {
  const { isAuthenticated } = useUserIdentity();

  const track = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      if (typeof window === 'undefined') return;

      posthog.capture(eventName, {
        ...properties,
        is_authenticated: isAuthenticated,
      });
    },
    [isAuthenticated]
  );

  const setUserProperties = useCallback(
    (properties: Record<string, unknown>) => {
      if (typeof window === 'undefined') return;
      posthog.setPersonProperties(properties);
    },
    []
  );

  return { track, setUserProperties };
}
