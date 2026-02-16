'use client';

import { useState, useRef, useCallback } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useToast } from '@/components/ui/Toast';
import { WeekPlan, SuggestedRecipe } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';

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

export function useMealPlanGeneration() {
  const { recipes, addRecipe } = useRecipes();
  const { weekPlan, setWeekPlan, clearWeekPlan } = useMealPlan();
  const { settings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { track } = useAnalytics();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [partialPlan, setPartialPlan] = useState<PartialPlan | null>(null);
  const lastPreferencesRef = useRef('');

  const isStreaming = loading && partialPlan && partialPlan.days && partialPlan.days.length > 0;

  const getWeekStartDate = useCallback((weekStartDay: string) => {
    const today = new Date();
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const targetDay = dayMap[weekStartDay];
    const currentDay = today.getDay();

    let daysToSubtract = currentDay - targetDay;
    if (daysToSubtract < 0) {
      daysToSubtract += 7;
    }

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysToSubtract);

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

  const handleGenerate = async (preferences: string, systemPrompt?: string) => {
    setLoading(true);
    setGenerationError(null);
    setPartialPlan(null);
    lastPreferencesRef.current = preferences;
    const isFirstPlan = !weekPlan;
    const generationStartTime = Date.now();

    track(EVENTS.MEAL_PLAN_GENERATION_STARTED, {
      has_existing_plan: !!weekPlan,
      has_preferences: !!preferences,
      recipe_library_size: recipes.length,
    });

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
        throw new Error(data.error || 'Failed to generate meal plan');
      }

      // Read NDJSON stream: each line is a partial or final object
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

      // Process any remaining buffer
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
        throw new Error('Failed to generate meal plan. The AI returned an incomplete response.');
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
      setLoading(false);
      setPartialPlan(null);
    }
  };

  const retryGeneration = () => {
    setGenerationError(null);
    handleGenerate(lastPreferencesRef.current);
  };

  const handleAddToLibrary = async (suggestedRecipe: SuggestedRecipe) => {
    const recipe = await addRecipe({
      title: suggestedRecipe.title,
      description: suggestedRecipe.description || '',
      ingredients: suggestedRecipe.ingredients,
      instructions: suggestedRecipe.instructions,
      servings: suggestedRecipe.servings || 4,
      prepTimeMinutes: suggestedRecipe.prepTimeMinutes || 0,
      cookTimeMinutes: suggestedRecipe.cookTimeMinutes || 0,
      tags: suggestedRecipe.tags,
      isAIGenerated: true,
    });

    // Update all matching meal slots to reference the new library recipe
    if (weekPlan) {
      const updatedPlan: WeekPlan = {
        ...weekPlan,
        days: weekPlan.days.map(day => ({
          ...day,
          meals: day.meals.map(meal =>
            meal.recipeTitleFallback?.toLowerCase() === suggestedRecipe.title.toLowerCase()
              ? { ...meal, recipeId: recipe.id, recipeTitleFallback: undefined }
              : meal
          ),
        })),
      };
      setWeekPlan(updatedPlan);
    }

    track(EVENTS.SUGGESTED_RECIPE_SAVED, { recipe_title: suggestedRecipe.title });
    showToast(`${suggestedRecipe.title} added to your library!`);
  };

  return {
    loading,
    generationError,
    partialPlan,
    isStreaming,
    handleGenerate,
    retryGeneration,
    handleAddToLibrary,
    clearWeekPlan,
  };
}
