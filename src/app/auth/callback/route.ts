import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/meal-plan';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isNewUser = user.created_at && (Date.now() - new Date(user.created_at).getTime() < 60_000);
        if (isNewUser) {
          trackServerEvent(EVENTS.USER_SIGNED_UP, user.id, '', { method: 'google' });
        }
        trackServerEvent(EVENTS.USER_SIGNED_IN, user.id, '', { method: 'google' });
      }
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
