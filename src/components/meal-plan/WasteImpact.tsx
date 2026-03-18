'use client';

import { useMemo } from 'react';
import { Leaf } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { DEFAULT_USER_PREFERENCES } from '@/lib/constants';
import { WeekPlan, SuggestedRecipe } from '@/types';

interface WasteImpactProps {
  weekPlan: WeekPlan;
  suggestedRecipes: Record<string, SuggestedRecipe>;
}

export function WasteImpact({ weekPlan, suggestedRecipes }: WasteImpactProps) {
  const { settings } = useSettings();
  const prefs = { ...DEFAULT_USER_PREFERENCES, ...settings.preferences };
  const pantryIngredients = prefs.pantryIngredients;

  const usedCount = useMemo(() => {
    if (pantryIngredients.length === 0) return 0;

    const allIngredients: string[] = [];
    for (const day of weekPlan.days) {
      for (const meal of day.meals) {
        const suggested = suggestedRecipes[meal.recipeId];
        if (suggested?.ingredients) {
          allIngredients.push(...suggested.ingredients);
        }
      }
    }

    const ingredientText = allIngredients.join(' ').toLowerCase();
    let count = 0;
    for (const pantryItem of pantryIngredients) {
      if (ingredientText.includes(pantryItem.toLowerCase())) {
        count++;
      }
    }
    return count;
  }, [weekPlan, suggestedRecipes, pantryIngredients]);

  if (pantryIngredients.length === 0 || usedCount === 0) return null;

  return (
    <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
      <Leaf className="w-5 h-5 text-primary shrink-0" />
      <p className="text-sm text-foreground">
        This plan uses <strong className="text-primary">{usedCount}</strong> of your pantry items — less waste, more savings!
      </p>
    </div>
  );
}
