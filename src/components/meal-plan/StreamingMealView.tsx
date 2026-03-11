'use client';

import { useState } from 'react';
import { MealType, SuggestedRecipe } from '@/types';
import { MEAL_TYPE_COLORS } from '@/lib/constants';
import { RecipeDetailView } from '@/components/recipes/RecipeDetailView';
import { Sparkles, Flame } from 'lucide-react';
import type { PartialMeal } from '@/contexts/MealPlanContext';

interface PartialDay {
  dayOfWeek?: string;
  meals?: PartialMeal[];
}

interface PartialPlan {
  days?: PartialDay[];
}

interface StreamingMealViewProps {
  partialPlan: PartialPlan;
  totalDays?: number;
}

function buildSuggestedRecipe(meal: PartialMeal): SuggestedRecipe | null {
  if (!meal.recipeTitle || !meal.ingredients?.length) return null;
  return {
    title: meal.recipeTitle,
    description: meal.description,
    ingredients: meal.ingredients,
    instructions: meal.instructions || [],
    servings: meal.servings,
    prepTimeMinutes: meal.prepTimeMinutes,
    cookTimeMinutes: meal.cookTimeMinutes,
    tags: meal.tags || [],
    estimatedNutrition: meal.estimatedNutrition as SuggestedRecipe['estimatedNutrition'],
  };
}

export function StreamingMealView({ partialPlan, totalDays = 7 }: StreamingMealViewProps) {
  const streamedDays = partialPlan.days || [];
  const [selectedMeal, setSelectedMeal] = useState<PartialMeal | null>(null);

  const suggestedRecipe = selectedMeal ? buildSuggestedRecipe(selectedMeal) : null;

  return (
    <>
      <div className="md:overflow-x-auto md:pb-4 md:-mx-4 md:px-4 lg:-mx-6 lg:px-6">
        <div className="flex flex-col md:flex-row gap-6 md:w-max">
          {Array.from({ length: totalDays }).map((_, index) => {
            const day = streamedDays[index];
            const hasData = !!day?.dayOfWeek;

            return (
              <div
                key={index}
                className="w-full md:flex-shrink-0 md:w-[200px] lg:w-[220px]"
              >
                <div className={`bg-surface rounded-xl p-3 h-full transition-opacity duration-500 ${hasData ? 'opacity-100' : 'opacity-50'}`}>
                  <h3 className="font-semibold text-sm text-center text-primary-dark mb-2 h-5">
                    {hasData ? day.dayOfWeek : (
                      <span className="inline-block w-12 h-3 bg-border/60 rounded animate-pulse" />
                    )}
                  </h3>

                  <div className="space-y-2 min-h-[120px]">
                    {hasData && day.meals ? (
                      day.meals.map((meal, mealIndex) => (
                        <div
                          key={mealIndex}
                          className="animate-[fadeIn_0.4s_ease-out]"
                        >
                          <StreamingMealCard
                            meal={meal}
                            onClick={() => setSelectedMeal(meal)}
                          />
                        </div>
                      ))
                    ) : (
                      <>
                        {[0, 1, 2].map(i => (
                          <div key={i} className="bg-white rounded-lg p-2.5 border border-border/50 space-y-2 animate-pulse">
                            <div className="w-14 h-4 bg-border/40 rounded-full" />
                            <div className="w-full h-3 bg-border/30 rounded" />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMeal && (
        <RecipeDetailView
          isOpen={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          suggestedRecipe={suggestedRecipe}
          mealSlot={suggestedRecipe ? undefined : {
            id: '',
            recipeId: '',
            mealType: (selectedMeal.mealType || 'dinner') as MealType,
            recipeTitleFallback: selectedMeal.recipeTitle,
            estimatedNutrition: selectedMeal.estimatedNutrition as any,
          }}
        />
      )}
    </>
  );
}

function StreamingMealCard({ meal, onClick }: { meal: PartialMeal; onClick: () => void }) {
  const mealType = meal.mealType as MealType | undefined;
  const colorClass = mealType ? MEAL_TYPE_COLORS[mealType] || MEAL_TYPE_COLORS.snack : 'bg-border/30 text-muted';
  const calories = meal.estimatedNutrition?.calories;
  const hasInlineDetails = (meal.ingredients?.length ?? 0) > 0;
  const isNew = hasInlineDetails && !meal.recipeId;

  return (
    <div
      className={`bg-white rounded-lg p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
        isNew ? 'border-2 border-dashed border-secondary' : 'border border-border/50'
      }`}
      onClick={onClick}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1 mb-0.5 flex-wrap">
          {mealType && (
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${colorClass}`}>
              {mealType}
            </span>
          )}
          {isNew && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary-dark flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              New
            </span>
          )}
        </div>
        {meal.recipeTitle ? (
          <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
            {meal.recipeTitle}
          </p>
        ) : (
          <div className="w-full h-3 bg-border/30 rounded animate-pulse mt-1" />
        )}
        {calories != null && (
          <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1">
            <Flame className="w-2.5 h-2.5" />
            {calories} cal
          </p>
        )}
      </div>
    </div>
  );
}
