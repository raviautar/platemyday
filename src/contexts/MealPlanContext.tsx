'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { WeekPlan, DayPlan, MealSlot } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';

interface MealPlanContextType {
  weekPlan: WeekPlan | null;
  setWeekPlan: (plan: WeekPlan) => void;
  moveMeal: (mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => void;
  removeMeal: (dayIndex: number, mealId: string) => void;
  addMealToDay: (dayIndex: number, meal: MealSlot) => void;
  clearWeekPlan: () => void;
}

const MealPlanContext = createContext<MealPlanContextType | null>(null);

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [weekPlan, setWeekPlanStorage] = useLocalStorage<WeekPlan | null>(STORAGE_KEYS.WEEK_PLAN, null);

  const setWeekPlan = useCallback((plan: WeekPlan) => {
    setWeekPlanStorage(plan);
  }, [setWeekPlanStorage]);

  const moveMeal = useCallback((mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => {
    setWeekPlanStorage(prev => {
      if (!prev) return prev;
      const newDays = prev.days.map(d => ({ ...d, meals: [...d.meals] }));

      // Find and remove from source
      const sourceDay = newDays[sourceDayIndex];
      const mealIndex = sourceDay.meals.findIndex(m => m.id === mealId);
      if (mealIndex === -1) return prev;
      const [meal] = sourceDay.meals.splice(mealIndex, 1);

      // Insert at destination
      const destDay = newDays[destDayIndex];
      destDay.meals.splice(destMealIndex, 0, meal);

      return { ...prev, days: newDays };
    });
  }, [setWeekPlanStorage]);

  const removeMeal = useCallback((dayIndex: number, mealId: string) => {
    setWeekPlanStorage(prev => {
      if (!prev) return prev;
      const newDays = prev.days.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, meals: d.meals.filter(m => m.id !== mealId) };
      });
      return { ...prev, days: newDays };
    });
  }, [setWeekPlanStorage]);

  const addMealToDay = useCallback((dayIndex: number, meal: MealSlot) => {
    setWeekPlanStorage(prev => {
      if (!prev) return prev;
      const newDays = prev.days.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, meals: [...d.meals, meal] };
      });
      return { ...prev, days: newDays };
    });
  }, [setWeekPlanStorage]);

  const clearWeekPlan = useCallback(() => {
    setWeekPlanStorage(null);
  }, [setWeekPlanStorage]);

  return (
    <MealPlanContext.Provider value={{ weekPlan, setWeekPlan, moveMeal, removeMeal, addMealToDay, clearWeekPlan }}>
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) throw new Error('useMealPlan must be used within MealPlanProvider');
  return context;
}
