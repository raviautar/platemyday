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
  const recipe = meal.recipeId ? getRecipe(meal.recipeId) : null;
  
  const isUnmatched = meal.recipeTitleFallback !== undefined;
  const title = isUnmatched 
    ? meal.recipeTitleFallback 
    : (recipe?.title || 'Unknown Recipe');

  return (
    <div 
      className={`bg-white rounded-lg p-2 shadow-sm ${
        isUnmatched 
          ? 'border-2 border-dashed border-secondary' 
          : 'border border-border'
      }`}
      title={isUnmatched ? 'This recipe needs to be added to your library' : undefined}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${mealTypeColors[meal.mealType]}`}>
              {meal.mealType}
            </span>
            {isUnmatched && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary-dark">
                New
              </span>
            )}
          </div>
          <p className={`text-sm font-medium line-clamp-2 ${isUnmatched ? 'text-muted' : ''}`}>
            {title}
          </p>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-muted hover:text-danger text-sm shrink-0">&times;</button>
        )}
      </div>
    </div>
  );
}
