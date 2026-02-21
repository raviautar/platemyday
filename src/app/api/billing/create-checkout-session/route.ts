import { getAuthUser } from '@/lib/supabase/auth';
import { getStripe, STRIPE_PRICES } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return Response.json({ error: 'Sign in required to purchase a plan' }, { status: 401 });
    }

    const { plan } = await req.json() as { plan: 'monthly' | 'annual' | 'lifetime' };

    const priceId = STRIPE_PRICES[plan];
    if (!priceId) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const mode = plan === 'lifetime' ? 'payment' as const : 'subscription' as const;

    // Get or create Stripe customer
    const sb = createServiceClient();
    const { data: billing } = await sb
      .from('user_billing')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    let customerId = billing?.stripe_customer_id;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        metadata: { user_id: userId },
      });
      customerId = customer.id;

      await sb.from('user_billing').upsert(
        { user_id: userId, stripe_customer_id: customerId, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/upgrade?success=true`,
      cancel_url: `${origin}/upgrade?canceled=true`,
      metadata: { user_id: userId },
      ...(mode === 'subscription' && {
        subscription_data: { metadata: { user_id: userId } },
      }),
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
