'use client';

import { useEffect, useRef } from 'react';
import { useUserIdentity } from '@/hooks/useUserIdentity';

export function UserbackProvider({ children }: { children: React.ReactNode }) {
  const { userId, anonymousId, isAuthenticated, isLoaded, user } = useUserIdentity();
  const scriptLoadedRef = useRef(false);

  // Initialize Userback widget once on mount
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_USERBACK_ACCESS_TOKEN;
    if (!token || scriptLoadedRef.current) return;

    window.Userback = window.Userback || {};
    window.Userback.access_token = token;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://static.userback.io/widget/v1.js';
    (document.head || document.body).appendChild(script);
    scriptLoadedRef.current = true;
  }, []);

  // Update user_data when identity loads or changes
  useEffect(() => {
    if (!isLoaded || !window.Userback) return;

    if (isAuthenticated && userId) {
      window.Userback.user_data = {
        id: userId,
        info: {
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || undefined,
          email: user?.email || undefined,
        },
      };
    } else if (anonymousId) {
      window.Userback.user_data = {
        id: anonymousId,
        info: {},
      };
    }
  }, [userId, anonymousId, isAuthenticated, isLoaded, user]);

  return <>{children}</>;
}
