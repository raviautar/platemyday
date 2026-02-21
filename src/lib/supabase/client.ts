import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

export function createBrowserClient(anonymousId?: string | null) {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          ...(anonymousId ? { 'x-anonymous-id': anonymousId } : {}),
        },
      },
    }
  );
}
