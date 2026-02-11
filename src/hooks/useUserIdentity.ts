'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getAnonymousId } from '@/lib/anonymous-id';

interface UserIdentity {
  userId: string | null;
  anonymousId: string;
  isAuthenticated: boolean;
  isLoaded: boolean;
}

export function useUserIdentity(): UserIdentity {
  const { user, isLoaded } = useUser();
  const [anonymousId, setAnonymousId] = useState('');

  useEffect(() => {
    setAnonymousId(getAnonymousId());
  }, []);

  return {
    userId: user?.id ?? null,
    anonymousId,
    isAuthenticated: !!user,
    isLoaded,
  };
}
