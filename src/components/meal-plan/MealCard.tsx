'use client';

import { useState, memo } from 'react';
import { MealSlot, MealType, SuggestedRecipe, DayPlan, NutritionInfo } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { MEAL_TYPE_COLORS } from '@/lib/constants';
import { Sparkles, Heart, Flame } from 'lucide-react';
import { MealDetail } from './MealDetail';
import { MealOptionsMenu } from './MealOptionsMenu';
import { ReplaceFromRecipes } from './ReplaceFromRecipes';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MealCardProps {
  meal: MealSlot;
  currentDayIndex?: number;
  weekDays?: DayPlan[];
  onRemove?: () => void;
  onMoveTo?: (targetDayIndex: number) => void;
  onReplaceMeal?: (newMeal: MealSlot) => void;
  suggestedRecipe?: SuggestedRecipe;
  onAddToLibrary?: (recipe: SuggestedRecipe) => void;
}

const MealCardComponent = ({ meal, currentDayIndex, weekDays, onRemove, onMoveTo, onReplaceMeal, suggestedRecipe, onAddToLibrary }: MealCardProps) => {
  const { getRecipe } = useRecipes();
  const { settings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { track } = useAnalytics();
  const { showToast } = useToast();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const recipe = meal.recipeId ? getRecipe(meal.recipeId) : null;

  const isUnmatched = meal.recipeTitleFallback !== undefined;
  const isInLibrary = !!meal.recipeId && !!recipe;
  const title = isUnmatched
    ? meal.recipeTitleFallback
    : (recipe?.title || 'Unknown Recipe');

  const nutrition: NutritionInfo | undefined = meal.estimatedNutrition || suggestedRecipe?.estimatedNutrition;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    setIsDetailOpen(true);
  };

  const handleReplaceFromLibrary = (recipeId: string) => {
    if (onReplaceMeal) {
      onReplaceMeal({
        ...meal,
        recipeId,
        recipeTitleFallback: undefined,
      });
      track(EVENTS.MEAL_REPLACED_FROM_LIBRARY, { meal_type: meal.mealType });
      showToast('Meal replaced!');
    }
  };

  const handleSaveToLibrary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (suggestedRecipe && onAddToLibrary) {
      onAddToLibrary(suggestedRecipe);
    }
  };

  const handleRegenerate = async () => {
    if (!onReplaceMeal) return;
    setIsRegenerating(true);

    try {
      const currentMeals = weekDays?.[currentDayIndex!]?.meals
        .filter(m => m.id !== meal.id)
        .map(m => ({
          title: m.recipeTitleFallback || 'Existing recipe',
          mealType: m.mealType,
        })) || [];

      const response = await fetch('/api/regenerate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: meal.mealType,
          dayOfWeek: weekDays?.[currentDayIndex!]?.dayOfWeek,
          currentMeals,
          systemPrompt: settings.mealPlanSystemPrompt,
          userId,
          anonymousId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to regenerate');
      }

      const newRecipeData = await response.json();

      onReplaceMeal({
        id: meal.id,
        recipeId: '',
        mealType: meal.mealType,
        recipeTitleFallback: newRecipeData.title,
        estimatedNutrition: newRecipeData.estimatedNutrition,
      });

      track(EVENTS.MEAL_REGENERATED, {
        meal_type: meal.mealType,
        day_of_week: weekDays?.[currentDayIndex!]?.dayOfWeek,
        new_recipe_title: newRecipeData.title,
      });

      showToast(`Replaced with "${newRecipeData.title}"!`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to regenerate meal', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative ${
          isUnmatched
            ? 'border-2 border-dashed border-secondary'
            : 'border border-border'
        } ${isRegenerating ? 'opacity-75' : ''}`}
        title={isUnmatched ? 'Click to view details and add to your library' : 'Click to view recipe details'}
        onClick={handleCardClick}
      >
        {isRegenerating && (
          <div className="absolute top-1 right-1">
            <LoadingSpinner size="sm" />
          </div>
        )}
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-1 flex-wrap">
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${MEAL_TYPE_COLORS[meal.mealType]}`}>
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
            {nutrition && (
              <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" />
                {nutrition.calories} cal
              </p>
            )}
            {isRegenerating && (
              <p className="text-[10px] text-muted mt-0.5">Regenerating...</p>
            )}
          </div>
          <div className="flex items-start gap-0.5">
            {/* Save to library button */}
            {isUnmatched && suggestedRecipe && onAddToLibrary && (
              <button
                onClick={handleSaveToLibrary}
                className="p-1 rounded-md hover:bg-accent/10 transition-colors"
                title="Save to recipe library"
              >
                <Heart className="w-3.5 h-3.5 text-accent" />
              </button>
            )}
            {isInLibrary && (
              <div className="p-1" title="In your recipe library">
                <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
              </div>
            )}
            {onRemove && weekDays && currentDayIndex !== undefined && (
              <MealOptionsMenu
                weekDays={weekDays}
                currentDayIndex={currentDayIndex}
                onMoveTo={(targetDayIndex) => onMoveTo?.(targetDayIndex)}
                onRemove={onRemove}
                onReplaceFromLibrary={() => setIsReplaceOpen(true)}
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
              />
            )}
          </div>
        </div>
      </div>

      <MealDetail
        meal={meal}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        suggestedRecipe={suggestedRecipe}
        onAddToLibrary={onAddToLibrary}
      />

      <ReplaceFromRecipes
        isOpen={isReplaceOpen}
        onClose={() => setIsReplaceOpen(false)}
        onSelectRecipe={handleReplaceFromLibrary}
        mealType={meal.mealType}
      />
    </>
  );
};

export const MealCard = memo(MealCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.meal.id === nextProps.meal.id &&
    prevProps.meal.recipeId === nextProps.meal.recipeId &&
    prevProps.meal.recipeTitleFallback === nextProps.meal.recipeTitleFallback &&
    prevProps.currentDayIndex === nextProps.currentDayIndex &&
    prevProps.suggestedRecipe?.title === nextProps.suggestedRecipe?.title
  );
});
