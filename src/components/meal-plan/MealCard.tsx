'use client';

import { useState } from 'react';
import { MealSlot, MealType, SuggestedRecipe, DayPlan } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { Sparkles } from 'lucide-react';
import { MealDetail } from './MealDetail';
import { MealOptionsMenu } from './MealOptionsMenu';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MealCardProps {
  meal: MealSlot;
  currentDayIndex?: number;
  weekDays?: DayPlan[];
  onRemove?: () => void;
  onMoveTo?: (targetDayIndex: number) => void;
  onMealUpdated?: (oldTitle: string, newRecipeId: string) => void;
  suggestedRecipe?: SuggestedRecipe;
  onAddToLibrary?: (recipe: SuggestedRecipe) => void;
}

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-secondary/30 text-yellow-800',
  lunch: 'bg-primary/20 text-primary-dark',
  dinner: 'bg-accent/20 text-accent-dark',
  snack: 'bg-surface-dark text-muted',
};

export function MealCard({ meal, currentDayIndex, weekDays, onRemove, onMoveTo, onMealUpdated, suggestedRecipe, onAddToLibrary }: MealCardProps) {
  const { getRecipe, addRecipe } = useRecipes();
  const { showToast } = useToast();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const recipe = meal.recipeId ? getRecipe(meal.recipeId) : null;
  
  const isUnmatched = meal.recipeTitleFallback !== undefined;
  const isLoading = suggestedRecipe?.isLoading ?? false;
  const title = isUnmatched 
    ? meal.recipeTitleFallback 
    : (recipe?.title || 'Unknown Recipe');

  const handleAddToLibraryLegacy = (mealToAdd: MealSlot) => {
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

  const handleRemove = () => {
    if (onRemove) onRemove();
  };

  const handleMoveTo = (targetDayIndex: number) => {
    if (onMoveTo) onMoveTo(targetDayIndex);
  };

  return (
    <>
      <div 
        className={`bg-white rounded-lg p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative ${
          isUnmatched 
            ? 'border-2 border-dashed border-secondary' 
            : 'border border-border'
        } ${isLoading ? 'opacity-75' : ''}`}
        title={isLoading ? 'Generating recipe details...' : isUnmatched ? 'Click to view details and add to your library' : 'Click to view recipe details'}
        onClick={handleCardClick}
      >
        {isLoading && (
          <div className="absolute top-1 right-1">
            <LoadingSpinner size="sm" />
          </div>
        )}
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-1 flex-wrap">
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
            {isLoading && (
              <p className="text-[10px] text-muted mt-0.5">Generating details...</p>
            )}
          </div>
          {onRemove && weekDays && currentDayIndex !== undefined && (
            <MealOptionsMenu
              weekDays={weekDays}
              currentDayIndex={currentDayIndex}
              onMoveTo={handleMoveTo}
              onRemove={handleRemove}
              onLockedFeatureClick={() => showToast('This feature is locked')}
            />
          )}
        </div>
      </div>

      <MealDetail
        meal={meal}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToLibrary={handleAddToLibraryLegacy}
        suggestedRecipe={suggestedRecipe}
        onAddToLibraryNew={onAddToLibrary}
      />
    </>
  );
}
