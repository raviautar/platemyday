import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/client';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUserIdFromCustomer(sb: ReturnType<typeof createClient>, customerId: string): Promise<string | null> {
  const { data } = await sb
    .from('user_billing')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

function getPlanIdFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'pro_monthly';
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'pro_annual';
  if (priceId === process.env.STRIPE_PRICE_LIFETIME) return 'lifetime';
  return 'free';
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const sb = createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.clerk_user_id;
      if (!userId) break;

      if (session.mode === 'payment') {
        // Lifetime purchase
        await sb.from('user_billing').upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            plan_id: 'lifetime',
            subscription_status: null,
            subscription_id: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

        trackServerEvent(EVENTS.SUBSCRIPTION_ACTIVATED, userId, '', { plan: 'lifetime' });
      }
      // Subscription activation is handled by customer.subscription.created/updated
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      let userId: string | null = sub.metadata?.clerk_user_id ?? null;

      if (!userId) {
        userId = await getUserIdFromCustomer(sb, sub.customer as string);
      }
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const planId = sub.status === 'active' ? getPlanIdFromPriceId(priceId) : 'free';

      await sb.from('user_billing').upsert(
        {
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          plan_id: planId,
          subscription_id: sub.id,
          subscription_status: sub.status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

      if (sub.status === 'active' && event.type === 'customer.subscription.created') {
        trackServerEvent(EVENTS.SUBSCRIPTION_ACTIVATED, userId, '', { plan: planId });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await getUserIdFromCustomer(sb, sub.customer as string);
      if (!userId) break;

      await sb.from('user_billing').update({
        plan_id: 'free',
        subscription_id: null,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);

      trackServerEvent(EVENTS.SUBSCRIPTION_CANCELED, userId, '', {});
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      if (!customerId) break;

      await sb.from('user_billing').update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', customerId);
      break;
    }
  }

  return Response.json({ received: true });
}
