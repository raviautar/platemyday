'use client';

import { useState, memo } from 'react';
import { MealSlot, MealType, SuggestedRecipe, DayPlan } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { Sparkles } from 'lucide-react';
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

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-secondary/30 text-yellow-800',
  lunch: 'bg-primary/20 text-primary-dark',
  dinner: 'bg-accent/20 text-accent-dark',
  snack: 'bg-surface-dark text-muted',
};

const MealCardComponent = ({ meal, currentDayIndex, weekDays, onRemove, onMoveTo, onReplaceMeal, suggestedRecipe, onAddToLibrary }: MealCardProps) => {
  const { getRecipe } = useRecipes();
  const { settings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { showToast } = useToast();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const recipe = meal.recipeId ? getRecipe(meal.recipeId) : null;

  const isUnmatched = meal.recipeTitleFallback !== undefined;
  const title = isUnmatched
    ? meal.recipeTitleFallback
    : (recipe?.title || 'Unknown Recipe');

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
      showToast('Meal replaced!');
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
            {isRegenerating && (
              <p className="text-[10px] text-muted mt-0.5">Regenerating...</p>
            )}
          </div>
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
