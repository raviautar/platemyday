'use client';

import { useState, useEffect, useRef } from 'react';
import { getAnonymousId } from '@/lib/anonymous-id';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserIdentity {
  userId: string | null;
  anonymousId: string;
  isAuthenticated: boolean;
  isLoaded: boolean;
  user: User | null;
}

export function useUserIdentity(): UserIdentity {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [anonymousId, setAnonymousId] = useState('');
  const supabaseRef = useRef(createBrowserClient());

  useEffect(() => {
    setAnonymousId(getAnonymousId());
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoaded(true);
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoaded(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    userId: user?.id ?? null,
    anonymousId,
    isAuthenticated: !!user,
    isLoaded,
    user,
  };
}
