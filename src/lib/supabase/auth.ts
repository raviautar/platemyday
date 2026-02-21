import { createClient } from './server';
import type { User } from '@supabase/supabase-js';

/**
 * Get the currently authenticated Supabase user from the session cookie.
 * Replaces `auth()` from `@clerk/nextjs/server` in API routes.
 */
export async function getAuthUser(): Promise<{ userId: string | null; user: User | null }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { userId: null, user: null };
  }
  return { userId: user.id, user };
}
