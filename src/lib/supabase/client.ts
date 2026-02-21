import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

const ANON_ID_KEY = 'platemyday-anonymous-id';

/**
 * Returns the Supabase browser client (singleton via @supabase/ssr).
 *
 * Uses a custom fetch wrapper that dynamically reads the anonymous ID
 * from localStorage on every request and attaches it as the
 * `x-anonymous-id` header. This avoids the singleton-options problem
 * where the header would be baked in at creation time.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          if (typeof window !== 'undefined') {
            const anonymousId = window.localStorage.getItem(ANON_ID_KEY);
            if (anonymousId) {
              const headers = new Headers(init?.headers);
              headers.set('x-anonymous-id', anonymousId);
              return globalThis.fetch(input, { ...init, headers });
            }
          }
          return globalThis.fetch(input, init);
        },
      },
    }
  );
}
