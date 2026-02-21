import { useMemo } from 'react';
import { useUserIdentity } from './useUserIdentity';
import { createBrowserClient } from '@/lib/supabase/client';

export function useSupabase() {
  const { anonymousId } = useUserIdentity();

  return useMemo(() => {
    return createBrowserClient(anonymousId);
  }, [anonymousId]);
}
