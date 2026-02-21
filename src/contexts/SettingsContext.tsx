'use client';

import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { AppSettings, UnitSystem } from '@/types';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useSupabase } from '@/hooks/useSupabase';
import { DEFAULT_SETTINGS, getRecipeSystemPrompt, getMealPlanSystemPrompt } from '@/lib/constants';
import { getSettings as fetchSettings, upsertSettings } from '@/lib/supabase/db';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateUnitSystem: (unitSystem: UnitSystem) => void;
  resetSettings: () => void;
  refetchSettings: () => Promise<void>;
  isSettingsLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { userId, anonymousId, isLoaded } = useUserIdentity();
  const supabase = useSupabase();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const fetchAndSetSettings = useCallback(async () => {
    if (!userId && !anonymousId) return;
    try {
      const data = await fetchSettings(supabase, userId, anonymousId);
      if (data) setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsSettingsLoaded(true);
    }
  }, [userId, anonymousId, supabase]);

  useEffect(() => {
    if (!isLoaded || !anonymousId) return;

    let cancelled = false;

    fetchSettings(supabase, userId, anonymousId)
      .then((data) => {
        if (!cancelled) {
          if (data) setSettings(data);
          setIsSettingsLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        if (!cancelled) setIsSettingsLoaded(true);
      });

    return () => { cancelled = true; };
  }, [userId, anonymousId, isLoaded, supabase]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistSettings = useCallback((newSettings: AppSettings) => {
    if (!isLoaded || !anonymousId) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      upsertSettings(supabase, newSettings, userId, anonymousId).catch(err =>
        console.error('Failed to save settings:', err)
      );
    }, 500);
  }, [userId, anonymousId, isLoaded, supabase]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  const updateUnitSystem = useCallback((unitSystem: UnitSystem) => {
    setSettings(prev => {
      const next = {
        ...prev,
        unitSystem,
        recipeSystemPrompt: getRecipeSystemPrompt(unitSystem),
        mealPlanSystemPrompt: getMealPlanSystemPrompt(unitSystem),
      };
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
  }, [persistSettings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateUnitSystem, resetSettings, refetchSettings: fetchAndSetSettings, isSettingsLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
