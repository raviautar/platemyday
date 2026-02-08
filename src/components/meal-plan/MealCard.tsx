'use client';

import { useState } from 'react';
import { MealSlot, MealType } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { Sparkles } from 'lucide-react';
import { MealDetail } from './MealDetail';
import { useToast } from '@/components/ui/Toast';

interface MealCardProps {
  meal: MealSlot;
  onRemove?: () => void;
  onMealUpdated?: (oldTitle: string, newRecipeId: string) => void;
}

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-secondary/30 text-yellow-800',
  lunch: 'bg-primary/20 text-primary-dark',
  dinner: 'bg-accent/20 text-accent-dark',
  snack: 'bg-surface-dark text-muted',
};

export function MealCard({ meal, onRemove, onMealUpdated }: MealCardProps) {
  const { getRecipe, addRecipe } = useRecipes();
  const { showToast } = useToast();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const recipe = meal.recipeId ? getRecipe(meal.recipeId) : null;
  
  const isUnmatched = meal.recipeTitleFallback !== undefined;
  const title = isUnmatched 
    ? meal.recipeTitleFallback 
    : (recipe?.title || 'Unknown Recipe');

  const handleAddToLibrary = (mealToAdd: MealSlot) => {
    if (!mealToAdd.recipeTitleFallback) return;

    const newRecipe = addRecipe({
      title: mealToAdd.recipeTitleFallback,
      description: 'Auto-created from meal plan',
      ingredients: [],
      instructions: [],
      servings: 4,
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      tags: [mealToAdd.mealType],
      isAIGenerated: true,
    });

    if (onMealUpdated) {
      onMealUpdated(mealToAdd.recipeTitleFallback, newRecipe.id);
    }

    showToast(`Added "${mealToAdd.recipeTitleFallback}" to your recipes. Go to Recipes to edit details.`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    setIsDetailOpen(true);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <>
      <div 
        className={`bg-white rounded-lg p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
          isUnmatched 
            ? 'border-2 border-dashed border-secondary' 
            : 'border border-border'
        }`}
        title={isUnmatched ? 'Click to view details and add to your library' : 'Click to view recipe details'}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${mealTypeColors[meal.mealType]}`}>
                {meal.mealType}
              </span>
              {isUnmatched && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary-dark flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  New
                </span>
              )}
            </div>
            <p className={`text-sm font-medium line-clamp-2 ${isUnmatched ? 'text-muted' : ''}`}>
              {title}
            </p>
          </div>
          {onRemove && (
            <button onClick={handleRemoveClick} className="text-muted hover:text-danger text-sm shrink-0">&times;</button>
          )}
        </div>
      </div>

      <MealDetail
        meal={meal}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToLibrary={handleAddToLibrary}
      />
    </>
  );
}
