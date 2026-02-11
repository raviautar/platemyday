'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { WeekPlan, MealSlot, SuggestedRecipe } from '@/types';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import {
  getActiveMealPlan,
  getMealPlans,
  saveMealPlan as saveMealPlanDb,
  restoreMealPlanDb,
  deleteMealPlanDb,
} from '@/lib/supabase/db';

interface MealPlanContextType {
  weekPlan: WeekPlan | null;
  setWeekPlan: (plan: WeekPlan, suggestedRecipes?: Record<string, SuggestedRecipe>) => Promise<void>;
  moveMeal: (mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => void;
  removeMeal: (dayIndex: number, mealId: string) => void;
  addMealToDay: (dayIndex: number, meal: MealSlot) => void;
  clearWeekPlan: () => void;
  replaceMeal: (dayIndex: number, mealId: string, newMeal: MealSlot) => void;
  mealPlanHistory: WeekPlan[];
  loadHistory: () => Promise<void>;
  restoreMealPlan: (planId: string) => Promise<void>;
  deleteMealPlan: (planId: string) => Promise<void>;
  historyLoading: boolean;
  loading: boolean;
}

const MealPlanContext = createContext<MealPlanContextType | null>(null);

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const { userId, anonymousId, isLoaded } = useUserIdentity();
  const [weekPlan, setWeekPlanState] = useState<WeekPlan | null>(null);
  const [mealPlanHistory, setMealPlanHistory] = useState<WeekPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !anonymousId) return;

    let cancelled = false;
    setLoading(true);

    getActiveMealPlan(userId, anonymousId)
      .then((plan) => {
        if (!cancelled) setWeekPlanState(plan);
      })
      .catch((err) => console.error('Failed to load meal plan:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId, anonymousId, isLoaded]);

  const setWeekPlan = useCallback(async (plan: WeekPlan, suggestedRecipes?: Record<string, SuggestedRecipe>) => {
    setWeekPlanState(plan);
    try {
      const saved = await saveMealPlanDb(plan, userId, anonymousId, suggestedRecipes);
      setWeekPlanState(prev => prev ? { ...prev, id: saved.id, createdAt: saved.createdAt } : prev);
    } catch (err) {
      console.error('Failed to save meal plan:', err);
    }
  }, [userId, anonymousId]);

  const updateLocalPlan = useCallback((updater: (prev: WeekPlan) => WeekPlan) => {
    setWeekPlanState(prev => {
      if (!prev) return prev;
      return updater(prev);
    });
  }, []);

  const moveMeal = useCallback((mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => {
    updateLocalPlan(prev => {
      const newDays = prev.days.map(d => ({ ...d, meals: [...d.meals] }));
      const sourceDay = newDays[sourceDayIndex];
      const mealIndex = sourceDay.meals.findIndex(m => m.id === mealId);
      if (mealIndex === -1) return prev;
      const [meal] = sourceDay.meals.splice(mealIndex, 1);
      newDays[destDayIndex].meals.splice(destMealIndex, 0, meal);
      return { ...prev, days: newDays };
    });
  }, [updateLocalPlan]);

  const removeMeal = useCallback((dayIndex: number, mealId: string) => {
    updateLocalPlan(prev => {
      const newDays = prev.days.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, meals: d.meals.filter(m => m.id !== mealId) };
      });
      return { ...prev, days: newDays };
    });
  }, [updateLocalPlan]);

  const addMealToDay = useCallback((dayIndex: number, meal: MealSlot) => {
    updateLocalPlan(prev => {
      const newDays = prev.days.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, meals: [...d.meals, meal] };
      });
      return { ...prev, days: newDays };
    });
  }, [updateLocalPlan]);

  const replaceMeal = useCallback((dayIndex: number, mealId: string, newMeal: MealSlot) => {
    updateLocalPlan(prev => {
      const newDays = prev.days.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          meals: d.meals.map(m => m.id === mealId ? newMeal : m),
        };
      });
      return { ...prev, days: newDays };
    });
  }, [updateLocalPlan]);

  const clearWeekPlan = useCallback(() => {
    setWeekPlanState(null);
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const plans = await getMealPlans(userId, anonymousId);
      setMealPlanHistory(plans);
    } catch (err) {
      console.error('Failed to load meal plan history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId, anonymousId]);

  const restoreMealPlan = useCallback(async (planId: string) => {
    try {
      await restoreMealPlanDb(planId, userId, anonymousId);
      const plan = await getActiveMealPlan(userId, anonymousId);
      setWeekPlanState(plan);
    } catch (err) {
      console.error('Failed to restore meal plan:', err);
    }
  }, [userId, anonymousId]);

  const deleteMealPlan = useCallback(async (planId: string) => {
    try {
      await deleteMealPlanDb(planId);
      setMealPlanHistory(prev => prev.filter(p => p.id !== planId));
      if (weekPlan?.id === planId) {
        setWeekPlanState(null);
      }
    } catch (err) {
      console.error('Failed to delete meal plan:', err);
    }
  }, [weekPlan?.id]);

  return (
    <MealPlanContext.Provider value={{
      weekPlan,
      setWeekPlan,
      moveMeal,
      removeMeal,
      addMealToDay,
      clearWeekPlan,
      replaceMeal,
      mealPlanHistory,
      loadHistory,
      restoreMealPlan,
      deleteMealPlan,
      historyLoading,
      loading,
    }}>
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) throw new Error('useMealPlan must be used within MealPlanProvider');
  return context;
}
