'use client';

import { MealSlot, MealType } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';

interface MealCardProps {
  meal: MealSlot;
  onRemove?: () => void;
}

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-secondary/30 text-yellow-800',
  lunch: 'bg-primary/20 text-primary-dark',
  dinner: 'bg-accent/20 text-accent-dark',
  snack: 'bg-surface-dark text-muted',
};

export function MealCard({ meal, onRemove }: MealCardProps) {
  const { getRecipe } = useRecipes();
  const recipe = getRecipe(meal.recipeId);
  const title = recipe?.title || 'Unknown Recipe';

  return (
    <div className="bg-white rounded-lg border border-border p-2 shadow-sm">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1 ${mealTypeColors[meal.mealType]}`}>
            {meal.mealType}
          </span>
          <p className="text-sm font-medium line-clamp-2">{title}</p>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-muted hover:text-danger text-sm shrink-0">&times;</button>
        )}
      </div>
    </div>
  );
}
