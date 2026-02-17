'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import type { BillingInfo } from '@/types';

interface BillingContextValue extends BillingInfo {
  loading: boolean;
  refetch: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue>({
  plan: 'free',
  unlimited: false,
  creditsUsed: 0,
  creditsLimit: 10,
  creditsRemaining: 10,
  loading: true,
  refetch: async () => {},
});

export function BillingProvider({ children }: { children: ReactNode }) {
  const { userId, anonymousId, isLoaded } = useUserIdentity();
  const [billing, setBilling] = useState<BillingInfo>({
    plan: 'free',
    unlimited: false,
    creditsUsed: 0,
    creditsLimit: 10,
    creditsRemaining: 10,
  });
  const [loading, setLoading] = useState(true);

  const fetchBilling = useCallback(async () => {
    if (!isLoaded) return;
    if (!userId && !anonymousId) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (anonymousId) params.set('anonymousId', anonymousId);
      const res = await fetch(`/api/billing/credits?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBilling(data);
      }
    } catch (err) {
      console.error('Failed to fetch billing info:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, anonymousId, isLoaded]);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  return (
    <BillingContext.Provider value={{ ...billing, loading, refetch: fetchBilling }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  return useContext(BillingContext);
}
