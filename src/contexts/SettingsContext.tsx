'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { AppSettings, UnitSystem } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_SETTINGS, STORAGE_KEYS, getRecipeSystemPrompt, getMealPlanSystemPrompt } from '@/lib/constants';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateUnitSystem: (unitSystem: UnitSystem) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  const updateUnitSystem = useCallback((unitSystem: UnitSystem) => {
    setSettings(prev => ({
      ...prev,
      unitSystem,
      recipeSystemPrompt: getRecipeSystemPrompt(unitSystem),
      mealPlanSystemPrompt: getMealPlanSystemPrompt(unitSystem),
    }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateUnitSystem, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
