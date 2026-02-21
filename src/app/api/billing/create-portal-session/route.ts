import { getAuthUser } from '@/lib/supabase/auth';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = createServiceClient();
    const { data: billing } = await sb
      .from('user_billing')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!billing?.stripe_customer_id) {
      return Response.json({ error: 'No billing account found' }, { status: 404 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';

    const session = await getStripe().billingPortal.sessions.create({
      customer: billing.stripe_customer_id,
      return_url: `${origin}/upgrade`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return Response.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
