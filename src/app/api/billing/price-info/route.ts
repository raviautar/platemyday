import { getStripe, STRIPE_PRICES } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const priceId = STRIPE_PRICES.lifetimeAppsumo;
    
    const price = await getStripe().prices.retrieve(priceId);
    
    const amount = price.unit_amount ? price.unit_amount / 100 : 0;
    const currency = price.currency.toUpperCase();
    
    return Response.json({
      amount,
      currency,
      formatted: new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: price.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount),
    });
  } catch (error) {
    console.error('Failed to fetch price info:', error);
    return Response.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}
