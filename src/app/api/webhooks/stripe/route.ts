import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';
import { CREDIT_PACKS, type CreditPackId } from '@/lib/credit-packs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUserIdFromCustomer(sb: ReturnType<typeof createServiceClient>, customerId: string): Promise<string | null> {
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
  if (priceId === process.env.STRIPE_PRICE_LIFETIME_APPSUMO) return 'lifetime_appsumo';
  return 'free';
}

function parseCreditPackMetadata(metadata: Stripe.Metadata | null | undefined): {
  packId: CreditPackId;
  creditsToAdd: number;
} | null {
  const rawPackId = metadata?.pack_id;
  const rawCredits = metadata?.credits_to_add;
  if (!rawPackId || !rawCredits) return null;

  if (!Object.hasOwn(CREDIT_PACKS, rawPackId)) return null;

  const creditsToAdd = Number.parseInt(rawCredits, 10);
  if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) return null;
  if (creditsToAdd !== CREDIT_PACKS[rawPackId as CreditPackId].credits) return null;

  return {
    packId: rawPackId as CreditPackId,
    creditsToAdd,
  };
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

  const sb = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id || session.metadata?.clerk_user_id;
      console.log('[webhook] checkout.session.completed:', { sessionId: session.id, mode: session.mode, userId, metadata: session.metadata });
      if (!userId) break;

      if (session.mode === 'payment') {
        const packPurchase = parseCreditPackMetadata(session.metadata);
        console.log('[webhook] parseCreditPackMetadata result:', packPurchase);

        if (packPurchase) {
          const { data, error } = await sb.rpc('apply_credit_pack_purchase', {
            p_stripe_event_id: event.id,
            p_stripe_session_id: session.id,
            p_user_id: userId,
            p_pack_id: packPurchase.packId,
            p_credits: packPurchase.creditsToAdd,
          });

          if (error) {
            console.error('Failed to apply credit pack purchase:', error);
            return Response.json(
              { error: 'Failed to apply credit pack purchase' },
              { status: 500 }
            );
          }

          const row = Array.isArray(data) ? data[0] : data;
          const applied = Boolean(row?.applied);
          console.log('[webhook] apply_credit_pack_purchase result:', { applied, credits_used: row?.credits_used, credits_limit: row?.credits_limit });

          if (applied) {
            trackServerEvent(EVENTS.SUBSCRIPTION_ACTIVATED, userId, '', {
              plan: 'credit_pack',
              pack_id: packPurchase.packId,
              credits_added: packPurchase.creditsToAdd,
              credits_limit: row?.credits_limit,
            });
          }
        } else if (session.metadata?.purchase_type === 'credit_pack') {
          // Credit pack metadata was present but failed validation — don't fall through to lifetime
          console.error('[webhook] Credit pack metadata validation failed:', session.metadata);
          return Response.json(
            { error: 'Invalid credit pack metadata' },
            { status: 500 }
          );
        } else {
          // Legacy lifetime purchase path (kept for grandfathered users/history)
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
      } else if (session.mode === 'subscription' && session.subscription) {
        // Subscription purchase — set billing immediately so the user is recognized
        // as premium even before the customer.subscription.created event arrives
        const subId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id;

        const sub = await getStripe().subscriptions.retrieve(subId);
        const priceId = sub.items.data[0]?.price.id;
        const planId = sub.status === 'active' ? getPlanIdFromPriceId(priceId) : 'free';

        const { error: upsertError } = await sb.from('user_billing').upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            plan_id: planId,
            subscription_id: sub.id,
            subscription_status: sub.status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

        if (upsertError) {
          console.error('Failed to upsert billing for checkout.session.completed:', upsertError);
        }

        if (sub.status === 'active') {
          trackServerEvent(EVENTS.SUBSCRIPTION_ACTIVATED, userId, '', { plan: planId });
        }
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      let userId: string | null = sub.metadata?.user_id || sub.metadata?.clerk_user_id || null;

      if (!userId) {
        userId = await getUserIdFromCustomer(sb, sub.customer as string);
      }
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const planId = sub.status === 'active' ? getPlanIdFromPriceId(priceId) : 'free';

      const { error: upsertError } = await sb.from('user_billing').upsert(
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

      if (upsertError) {
        console.error('Failed to upsert billing:', upsertError);
      }

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
