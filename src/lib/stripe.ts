import Stripe from 'stripe';
import type { CreditPackId } from '@/lib/credit-packs';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export type StripePriceKey =
  | 'monthly'
  | 'annual'
  | 'lifetime'
  | 'lifetimeAppsumo'
  | CreditPackId;

export const STRIPE_PRICES: Record<StripePriceKey, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
  lifetimeAppsumo: process.env.STRIPE_PRICE_LIFETIME_APPSUMO!,
  credit_pack_1: process.env.STRIPE_PRICE_CREDIT_PACK_1!,
  credit_pack_2: process.env.STRIPE_PRICE_CREDIT_PACK_2!,
  credit_pack_3: process.env.STRIPE_PRICE_CREDIT_PACK_3!,
};
