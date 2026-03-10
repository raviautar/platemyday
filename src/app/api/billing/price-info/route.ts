import { getStripe, STRIPE_PRICES } from '@/lib/stripe';
import { CREDIT_PACK_ORDER, CREDIT_PACKS, type CreditPackId } from '@/lib/credit-packs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const defaultCurrency = 'usd';
    const prices = await Promise.all(
      CREDIT_PACK_ORDER.map(async (packId) => {
        const priceId = STRIPE_PRICES[packId];
        if (!priceId) {
          throw new Error(`Missing Stripe price id for ${packId}`);
        }

        const pack = CREDIT_PACKS[packId];
        const price = await getStripe().prices.retrieve(priceId);
        const amount = price.unit_amount ? price.unit_amount / 100 : 0;
        const currency = price.currency || defaultCurrency;

        return {
          packId: packId as CreditPackId,
          name: pack.name,
          credits: pack.credits,
          amount,
          currency: currency.toUpperCase(),
          formatted: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(amount),
        };
      })
    );

    return Response.json({
      packs: prices,
    });
  } catch (error) {
    console.error('Failed to fetch price info:', error);
    return Response.json({ error: 'Failed to fetch price info' }, { status: 500 });
  }
}
