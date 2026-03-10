import { getAuthUser } from '@/lib/supabase/auth';
import { getStripe, STRIPE_PRICES } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { CREDIT_PACKS, type CreditPackId } from '@/lib/credit-packs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return Response.json({ error: 'Sign in required to purchase credits' }, { status: 401 });
    }

    const { pack } = await req.json() as { pack?: CreditPackId };
    if (!pack || !Object.hasOwn(CREDIT_PACKS, pack)) {
      return Response.json(
        { error: 'Invalid pack', details: { pack, availablePacks: Object.keys(CREDIT_PACKS) } },
        { status: 400 }
      );
    }

    const selectedPack = CREDIT_PACKS[pack];
    const priceId = STRIPE_PRICES[pack];
    
    if (!priceId) {
      return Response.json({ error: 'Pack is not configured', details: { pack } }, { status: 400 });
    }

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
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/upgrade?success=true&pack=${pack}`,
      cancel_url: `${origin}/upgrade?canceled=true`,
      metadata: {
        user_id: userId,
        purchase_type: 'credit_pack',
        pack_id: pack,
        credits_to_add: String(selectedPack.credits),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
