import { useRef, useMemo } from 'react';
import { useSession } from '@clerk/nextjs';
import { useUserIdentity } from './useUserIdentity';
import { createAuthenticatedClient } from '@/lib/supabase/client';

export function useSupabase() {
    const { session } = useSession();
    const { anonymousId } = useUserIdentity();

    const sessionRef = useRef(session);
    sessionRef.current = session;

    return useMemo(() => {
        return createAuthenticatedClient(
            async () => {
                const s = sessionRef.current;
                if (!s) return '';
                const token = await s.getToken();
                return token ?? '';
            },
            anonymousId
        );
    }, [anonymousId]);
}
