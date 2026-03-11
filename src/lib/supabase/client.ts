import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { getAnonymousId } from '@/lib/anonymous-id';

/**
 * Returns the Supabase browser client (singleton via @supabase/ssr).
 *
 * Uses a custom fetch wrapper that dynamically reads the anonymous ID
 * on every request and attaches it as the `x-anonymous-id` header.
 * Uses getAnonymousId() which auto-creates an ID if missing, ensuring
 * the header is always present for RLS policies.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          if (typeof window !== 'undefined') {
            const anonymousId = getAnonymousId();
            const headers = new Headers(init?.headers);
            headers.set('x-anonymous-id', anonymousId);
            return globalThis.fetch(input, { ...init, headers });
          }
          return globalThis.fetch(input, init);
        },
      },
    }
  );
}
