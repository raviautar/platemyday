'use client';

import React, { createContext, useContext, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { WeekPlan, MealSlot, SuggestedRecipe } from '@/types';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useSupabase } from '@/hooks/useSupabase';
import { useRecipes } from '@/contexts/RecipeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useToast } from '@/components/ui/Toast';
import { useBilling } from '@/contexts/BillingContext';
import { EVENTS } from '@/lib/analytics/events';
import { DAYS_OF_WEEK } from '@/lib/constants';
import {
  getActiveMealPlan,
  getMealPlans,
  saveMealPlan as saveMealPlanDb,
  restoreMealPlanDb,
  deleteMealPlanDb,
} from '@/lib/supabase/db';

export interface PartialPlan {
  days?: Array<{
    dayOfWeek?: string;
    meals?: Array<{
      mealType?: string;
      recipeTitle?: string;
      recipeId?: string;
      estimatedNutrition?: { calories?: number };
    }>;
  }>;
}

export interface ConsolidatedCategory {
  name: string;
  items: string[];
}

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
  shoppingList: ConsolidatedCategory[] | null;
  shoppingPantryItems: string[];
  shoppingListLoading: boolean;
  shoppingListUpdated: boolean;
  nutritionUpdated: boolean;
  dismissShoppingListUpdated: () => void;
  dismissNutritionUpdated: () => void;
  addPantryItemToShoppingList: (item: string) => void;
  // Generation state
  generating: boolean;
  generationError: string | null;
  isPaywalled: boolean;
  partialPlan: PartialPlan | null;
  isStreaming: boolean;
  startGeneration: (preferences: string, systemPrompt?: string) => void;
  retryGeneration: () => void;
  clearGenerationError: () => void;
}

const MealPlanContext = createContext<MealPlanContextType | null>(null);

export function collectIngredients(
  weekPlan: WeekPlan,
  recipesMap: Map<string, string[]>,
  suggestedRecipes?: Record<string, SuggestedRecipe>,
): string[] {
  const allIngredients: string[] = [];

  for (const day of weekPlan.days) {
    for (const meal of day.meals) {
      if (meal.recipeId) {
        const ingredients = recipesMap.get(meal.recipeId);
        if (ingredients) allIngredients.push(...ingredients);
      } else if (meal.recipeTitleFallback) {
        const suggested = suggestedRecipes?.[meal.recipeTitleFallback];
        if (suggested) allIngredients.push(...suggested.ingredients);
      }
    }
  }

  return allIngredients.filter(i => i.trim());
}

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const { userId, anonymousId, isLoaded } = useUserIdentity();
  const supabase = useSupabase();
  const { recipes } = useRecipes();
  const { settings } = useSettings();
  const { track } = useAnalytics();
  const { showToast } = useToast();
  const { refetch: refetchBilling } = useBilling();

  const [weekPlan, setWeekPlanState] = useState<WeekPlan | null>(null);
  const [mealPlanHistory, setMealPlanHistory] = useState<WeekPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [shoppingList, setShoppingList] = useState<ConsolidatedCategory[] | null>(null);
  const [shoppingPantryItems, setShoppingPantryItems] = useState<string[]>([]);
  const [shoppingListLoading, setShoppingListLoading] = useState(false);
  const [shoppingListUpdated, setShoppingListUpdated] = useState(false);
  const [nutritionUpdated, setNutritionUpdated] = useState(false);
  const consolidationAbortRef = useRef<AbortController | null>(null);
  const wasGeneratingRef = useRef(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isPaywalled, setIsPaywalled] = useState(false);
  const [partialPlan, setPartialPlan] = useState<PartialPlan | null>(null);
  const lastPreferencesRef = useRef('');

  const isStreaming = generating && !!partialPlan && !!partialPlan.days && partialPlan.days.length > 0;

  // Memoize recipesMap to avoid $O(N)$ recreation on every weekPlan change
  const recipesMap = useMemo(() => new Map(recipes.map(r => [r.id, r.ingredients])), [recipes]);

  useEffect(() => {
    if (!isLoaded || !anonymousId) return;

    let cancelled = false;
    setLoading(true);

    getActiveMealPlan(supabase, userId, anonymousId)
      .then((plan) => {
        if (!cancelled) setWeekPlanState(plan);
      })
      .catch((err) => console.error('Failed to load meal plan:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId, anonymousId, isLoaded, supabase]);

  // Clear stale shopping list when a new generation starts
  useEffect(() => {
    if (generating) {
      wasGeneratingRef.current = true;
      setShoppingList(null);
      setShoppingPantryItems([]);
      setShoppingListLoading(true);
      consolidationAbortRef.current?.abort();
    }
  }, [generating]);

  // Auto-consolidate shopping list whenever weekPlan changes
  useEffect(() => {
    if (!weekPlan) {
      setShoppingList(null);
      setShoppingPantryItems([]);
      return;
    }

    if (generating) return;

    const ingredients = collectIngredients(weekPlan, recipesMap, weekPlan.suggestedRecipes);

    if (ingredients.length === 0) {
      setShoppingList(null);
      setShoppingListLoading(false);
      return;
    }

    consolidationAbortRef.current?.abort();
    const abortController = new AbortController();
    consolidationAbortRef.current = abortController;

    const timer = setTimeout(async () => {
      setShoppingListLoading(true);
      try {
        const response = await fetch('/api/consolidate-shopping-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealPlanId: weekPlan.id,
            userId,
            anonymousId,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error('Failed to consolidate');

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (!abortController.signal.aborted) {
            setShoppingList(data.categories || []);
            setShoppingPantryItems(data.pantryItems || []);
            if (wasGeneratingRef.current) {
              setShoppingListUpdated(true);
              setNutritionUpdated(true);
              wasGeneratingRef.current = false;
            }
          }
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalData: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('ERROR:')) {
              throw new Error(JSON.parse(trimmed.slice(6)).error);
            }
            if (trimmed.startsWith('DONE:')) {
              finalData = JSON.parse(trimmed.slice(5));
            } else {
              try {
                const partial = JSON.parse(trimmed);
                if (!abortController.signal.aborted) {
                  setShoppingList(partial.categories || []);
                  setShoppingPantryItems(partial.pantryItems || []);
                }
              } catch {
                // Ignore malformed partials
              }
            }
          }
        }

        const remaining = buffer.trim();
        if (remaining) {
          if (remaining.startsWith('ERROR:')) {
            throw new Error(JSON.parse(remaining.slice(6)).error);
          }
          if (remaining.startsWith('DONE:')) {
            finalData = JSON.parse(remaining.slice(5));
          }
        }

        if (!abortController.signal.aborted && finalData) {
          setShoppingList(finalData.categories || []);
          setShoppingPantryItems(finalData.pantryItems || []);
          if (wasGeneratingRef.current) {
            setShoppingListUpdated(true);
            setNutritionUpdated(true);
            wasGeneratingRef.current = false;
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Shopping list consolidation error:', error);
      } finally {
        if (!abortController.signal.aborted) {
          setShoppingListLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [weekPlan, recipesMap, userId, anonymousId, generating]);

  const setWeekPlan = useCallback(async (plan: WeekPlan, suggestedRecipes?: Record<string, SuggestedRecipe>) => {
    setWeekPlanState(plan);
    try {
      const saved = await saveMealPlanDb(supabase, plan, userId, anonymousId, suggestedRecipes);
      setWeekPlanState(prev => prev ? { ...prev, id: saved.id, createdAt: saved.createdAt } : prev);
    } catch (err) {
      console.error('Failed to save meal plan:', err);
    }
  }, [userId, anonymousId, supabase]);

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

  const dismissShoppingListUpdated = useCallback(() => {
    setShoppingListUpdated(false);
  }, []);

  const dismissNutritionUpdated = useCallback(() => {
    setNutritionUpdated(false);
  }, []);

  const addPantryItemToShoppingList = useCallback((item: string) => {
    setShoppingPantryItems(prev => prev.filter(p => p !== item));
    setShoppingList(prev => {
      if (!prev || prev.length === 0) return [{ name: 'Other', items: [item] }];
      const otherIdx = prev.findIndex(c => c.name === 'Other');
      if (otherIdx >= 0) {
        return prev.map((c, i) =>
          i === otherIdx ? { ...c, items: [...c.items, item] } : c
        );
      }
      return [...prev, { name: 'Other', items: [item] }];
    });
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const plans = await getMealPlans(supabase, userId, anonymousId);
      setMealPlanHistory(plans);
    } catch (err) {
      console.error('Failed to load meal plan history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId, anonymousId, supabase]);

  const restoreMealPlan = useCallback(async (planId: string) => {
    try {
      await restoreMealPlanDb(supabase, planId, userId, anonymousId);
      const plan = await getActiveMealPlan(supabase, userId, anonymousId);
      setWeekPlanState(plan);
    } catch (err) {
      console.error('Failed to restore meal plan:', err);
    }
  }, [userId, anonymousId, supabase]);

  const deleteMealPlan = useCallback(async (planId: string) => {
    try {
      await deleteMealPlanDb(supabase, planId);
      setMealPlanHistory(prev => prev.filter(p => p.id !== planId));
      if (weekPlan?.id === planId) {
        setWeekPlanState(null);
      }
    } catch (err) {
      console.error('Failed to delete meal plan:', err);
    }
  }, [weekPlan?.id, supabase]);

  // --- Generation logic ---

  const getWeekStartDate = useCallback((weekStartDay: string) => {
    const today = new Date();
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const targetDay = dayMap[weekStartDay];
    const currentDay = today.getDay();

    const daysToAdd = (targetDay - currentDay + 7) % 7;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + daysToAdd);

    return weekStart;
  }, []);

  const buildWeekPlan = useCallback((data: any): WeekPlan => {
    const weekStart = getWeekStartDate(settings.weekStartDay);

    const suggestedRecipesMap: Record<string, SuggestedRecipe> = {};
    if (data.newRecipes) {
      data.newRecipes.forEach((recipe: any) => {
        suggestedRecipesMap[recipe.title] = {
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          servings: recipe.servings,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          tags: recipe.tags || [],
          estimatedNutrition: recipe.estimatedNutrition,
        };
      });
    }

    const days = data.days.map((day: any, index: number) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        date: date.toISOString().split('T')[0],
        dayOfWeek: day.dayOfWeek || DAYS_OF_WEEK[index],
        meals: (day.meals || []).map((meal: any) => ({
          id: crypto.randomUUID(),
          recipeId: meal.recipeId || '',
          mealType: meal.mealType,
          recipeTitleFallback: meal.recipeId ? undefined : meal.recipeTitle,
          estimatedNutrition: meal.estimatedNutrition,
        })),
      };
    });

    return {
      id: crypto.randomUUID(),
      weekStartDate: weekStart.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      days,
      suggestedRecipes: Object.keys(suggestedRecipesMap).length > 0 ? suggestedRecipesMap : undefined,
    };
  }, [getWeekStartDate, settings.weekStartDay]);

  const startGeneration = useCallback((preferences: string, systemPrompt?: string) => {
    setGenerating(true);
    setGenerationError(null);
    setIsPaywalled(false);
    setPartialPlan(null);
    lastPreferencesRef.current = preferences;
    const isFirstPlan = !weekPlan;
    const generationStartTime = Date.now();

    track(EVENTS.MEAL_PLAN_GENERATION_STARTED, {
      has_existing_plan: !!weekPlan,
      has_preferences: !!preferences,
      recipe_library_size: recipes.length,
    });

    (async () => {
      try {
        const response = await fetch('/api/generate-meal-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipes: recipes.map(r => ({ id: r.id, title: r.title, tags: r.tags })),
            systemPrompt: systemPrompt || settings.mealPlanSystemPrompt,
            preferences,
            weekStartDay: settings.weekStartDay,
            userId,
            anonymousId,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 402 && data.error === 'no_credits') {
            setIsPaywalled(true);
            setGenerationError(data.message || 'You\'ve used all your free meal plan generations. Upgrade for unlimited access.');
            setGenerating(false);
            setPartialPlan(null);
            return;
          }
          throw new Error(data.error || 'Failed to generate meal plan');
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalData: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('ERROR:')) {
              const errorData = JSON.parse(trimmed.slice(6));
              throw new Error(errorData.error || 'Generation failed');
            }

            if (trimmed.startsWith('DONE:')) {
              finalData = JSON.parse(trimmed.slice(5));
            } else {
              try {
                const partial = JSON.parse(trimmed);
                setPartialPlan(partial);
              } catch {
                // Ignore malformed partial lines
              }
            }
          }
        }

        const remaining = buffer.trim();
        if (remaining) {
          if (remaining.startsWith('ERROR:')) {
            const errorData = JSON.parse(remaining.slice(6));
            throw new Error(errorData.error || 'Generation failed');
          }
          if (remaining.startsWith('DONE:')) {
            finalData = JSON.parse(remaining.slice(5));
          }
        }

        if (!finalData) {
          throw new Error('Failed to generate meal plan. The server returned an incomplete response.');
        }

        const newWeekPlan = buildWeekPlan(finalData);
        const newSuggested = newWeekPlan.suggestedRecipes;
        await setWeekPlan(newWeekPlan, newSuggested);

        const newRecipeCount = finalData.newRecipes?.length || 0;
        const generationTime = Date.now() - generationStartTime;

        track(EVENTS.MEAL_PLAN_GENERATION_COMPLETED, {
          new_recipe_count: newRecipeCount,
          generation_time_ms: generationTime,
          total_meals: finalData.days?.reduce((sum: number, d: { meals?: unknown[] }) => sum + (d.meals?.length || 0), 0) || 0,
        });

        if (isFirstPlan) {
          track(EVENTS.FIRST_MEAL_PLAN_GENERATED);
        }

        if (newRecipeCount > 0) {
          showToast(`Meal plan generated with ${newRecipeCount} new recipe${newRecipeCount > 1 ? 's' : ''}!`);
        } else {
          showToast('Meal plan generated!');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate meal plan';
        track(EVENTS.MEAL_PLAN_GENERATION_FAILED, { error_message: message });
        setGenerationError(message);
      } finally {
        setGenerating(false);
        setPartialPlan(null);
        refetchBilling();
      }
    })();
  }, [weekPlan, recipes, settings, userId, anonymousId, track, showToast, buildWeekPlan, setWeekPlan, refetchBilling]);

  const retryGeneration = useCallback(() => {
    setGenerationError(null);
    startGeneration(lastPreferencesRef.current);
  }, [startGeneration]);

  const clearGenerationError = useCallback(() => {
    setGenerationError(null);
  }, []);

  const value = useMemo(() => ({
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
    shoppingList,
    shoppingPantryItems,
    shoppingListLoading,
    shoppingListUpdated,
    nutritionUpdated,
    dismissShoppingListUpdated,
    dismissNutritionUpdated,
    addPantryItemToShoppingList,
    generating,
    generationError,
    isPaywalled,
    partialPlan,
    isStreaming,
    startGeneration,
    retryGeneration,
    clearGenerationError,
  }), [
    weekPlan, setWeekPlan, moveMeal, removeMeal, addMealToDay, clearWeekPlan,
    replaceMeal, mealPlanHistory, loadHistory, restoreMealPlan, deleteMealPlan,
    historyLoading, loading, shoppingList, shoppingPantryItems, shoppingListLoading,
    shoppingListUpdated, nutritionUpdated, dismissShoppingListUpdated, dismissNutritionUpdated,
    addPantryItemToShoppingList,
    generating, generationError, isPaywalled, partialPlan, isStreaming,
    startGeneration, retryGeneration, clearGenerationError,
  ]);

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) throw new Error('useMealPlan must be used within MealPlanProvider');
  return context;
}
