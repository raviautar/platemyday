export type CreditPackId = 'credit_pack_1' | 'credit_pack_2' | 'credit_pack_3';

export interface CreditPackConfig {
  id: CreditPackId;
  name: string;
  subtitle: string;
  credits: number;
  cta: string;
  badge?: string;
}

// Edit `credits` here to change how many credits each pack grants.
// The matching Stripe price IDs are set via STRIPE_PRICE_CREDIT_PACK_1/2/3 in .env.
export const CREDIT_PACKS: Record<CreditPackId, CreditPackConfig> = {
  credit_pack_1: {
    id: 'credit_pack_1',
    name: 'Snack Stash',
    subtitle: 'For casual weekly planners',
    credits: 100,
    cta: 'Grab Snack Stash',
  },
  credit_pack_2: {
    id: 'credit_pack_2',
    name: 'Feast Mode',
    subtitle: 'For regular household planning',
    credits: 500,
    cta: 'Enter Feast Mode',
    badge: 'Most Popular',
  },
  credit_pack_3: {
    id: 'credit_pack_3',
    name: 'Kitchen Legend',
    subtitle: 'For serious prep champions',
    credits: 1000,
    cta: 'Become a Kitchen Legend',
    badge: 'Best Value',
  },
};

export const CREDIT_PACK_ORDER: CreditPackId[] = ['credit_pack_1', 'credit_pack_2', 'credit_pack_3'];
