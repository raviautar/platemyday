import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAuthenticatedClient(
  getToken: () => Promise<string>,
  anonymousId?: string | null
) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: getToken,
      global: {
        headers: {
          ...(anonymousId ? { 'x-anonymous-id': anonymousId } : {}),
        },
      },
    }
  );
}
