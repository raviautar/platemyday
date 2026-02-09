'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { WeekPlan, DayPlan, MealSlot, SuggestedRecipe } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/constants';

interface MealPlanContextType {
  weekPlan: WeekPlan | null;
  setWeekPlan: (plan: WeekPlan) => void;
  moveMeal: (mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => void;
  removeMeal: (dayIndex: number, mealId: string) => void;
  addMealToDay: (dayIndex: number, meal: MealSlot) => void;
  clearWeekPlan: () => void;
  updateSuggestedRecipes: (recipes: SuggestedRecipe[]) => void;
  markRecipesComplete: (titles: string[]) => void;
  removeSuggestedRecipe: (title: string) => void;
  clearSuggestedRecipes: () => void;
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

  const updateSuggestedRecipes = useCallback((recipes: SuggestedRecipe[]) => {
    setWeekPlanStorage(prev => {
      if (!prev) return prev;
      const updated = { ...(prev.suggestedRecipes || {}) };
      
      recipes.forEach((recipe) => {
        const existing = updated[recipe.title];
        const isComplete = recipe.ingredients?.length > 0 && 
                          recipe.instructions?.length > 0 &&
                          recipe.description &&
                          recipe.servings &&
                          recipe.prepTimeMinutes !== undefined &&
                          recipe.cookTimeMinutes !== undefined;
        
        updated[recipe.title] = {
          title: recipe.title,
          description: recipe.description || existing?.description,
          ingredients: recipe.ingredients || existing?.ingredients || [],
          instructions: recipe.instructions || existing?.instructions || [],
          servings: recipe.servings || existing?.servings,
          prepTimeMinutes: recipe.prepTimeMinutes ?? existing?.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes ?? existing?.cookTimeMinutes,
          tags: recipe.tags || existing?.tags || [],
          mealTypes: [],
          isLoading: !isComplete,
          loadedFields: Object.keys(recipe),
        };
      });
      
      return { ...prev, suggestedRecipes: updated };
    });
  }, [setWeekPlanStorage]);

  const markRecipesComplete = useCallback((titles: string[]) => {
    setWeekPlanStorage(prev => {
      if (!prev || !prev.suggestedRecipes) return prev;
      const updated = { ...prev.suggestedRecipes };
      titles.forEach((title) => {
        const existing = updated[title];
        if (existing) {
          updated[title] = { ...existing, isLoading: false };
        }
      });
      return { ...prev, suggestedRecipes: updated };
    });
  }, [setWeekPlanStorage]);

  const removeSuggestedRecipe = useCallback((title: string) => {
    setWeekPlanStorage(prev => {
      if (!prev || !prev.suggestedRecipes) return prev;
      const updated = { ...prev.suggestedRecipes };
      delete updated[title];
      return { ...prev, suggestedRecipes: updated };
    });
  }, [setWeekPlanStorage]);

  const clearSuggestedRecipes = useCallback(() => {
    setWeekPlanStorage(prev => {
      if (!prev) return prev;
      return { ...prev, suggestedRecipes: {} };
    });
  }, [setWeekPlanStorage]);

  return (
    <MealPlanContext.Provider value={{ 
      weekPlan, 
      setWeekPlan, 
      moveMeal, 
      removeMeal, 
      addMealToDay, 
      clearWeekPlan,
      updateSuggestedRecipes,
      markRecipesComplete,
      removeSuggestedRecipe,
      clearSuggestedRecipes
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
