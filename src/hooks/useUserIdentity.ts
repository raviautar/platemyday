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

    // Use onAuthStateChange as the single source of truth.
    // INITIAL_SESSION fires from the cookie-based session (already refreshed
    // by middleware), avoiding the race condition with a separate getUser()
    // network call that could resolve with null before cookies are hydrated.
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
