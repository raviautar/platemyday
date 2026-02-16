import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (typeof window === 'undefined' || initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) return;

  posthog.init(key, {
    api_host: host,
    autocapture: false,
    capture_pageview: false, // We handle this in PostHogProvider on route change
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug();
      }
    },
  });

  initialized = true;
}

export { posthog };
