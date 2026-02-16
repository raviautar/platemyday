'use client';

import { useCallback } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useToast } from '@/components/ui/Toast';
import { SuggestedRecipe, WeekPlan } from '@/types';

export type { PartialPlan } from '@/contexts/MealPlanContext';

export function useMealPlanGeneration() {
  const { addRecipe } = useRecipes();
  const {
    weekPlan, setWeekPlan, clearWeekPlan,
    generating: loading,
    generationError,
    partialPlan,
    isStreaming,
    startGeneration,
    retryGeneration,
  } = useMealPlan();
  const { track } = useAnalytics();
  const { showToast } = useToast();

  const handleGenerate = useCallback(async (preferences: string, systemPrompt?: string) => {
    startGeneration(preferences, systemPrompt);
  }, [startGeneration]);

  const handleAddToLibrary = useCallback(async (suggestedRecipe: SuggestedRecipe) => {
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
  }, [addRecipe, weekPlan, setWeekPlan, track, showToast]);

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
