'use client';

import { MealType } from '@/types';
import { MEAL_TYPE_COLORS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

interface PartialMeal {
  mealType?: string;
  recipeTitle?: string;
  recipeId?: string;
  estimatedNutrition?: { calories?: number };
}

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

export function StreamingMealView({ partialPlan, totalDays = 7 }: StreamingMealViewProps) {
  const streamedDays = partialPlan.days || [];

  return (
    <div className="md:overflow-x-auto md:pb-4 md:-mx-4 md:px-4 lg:-mx-6 lg:px-6">
      <div className="flex flex-col md:flex-row gap-6 md:w-max">
        {Array.from({ length: totalDays }).map((_, index) => {
          const day = streamedDays[index];
          const hasData = day?.dayOfWeek;

          return (
            <div
              key={index}
              className="w-full md:flex-shrink-0 md:w-[200px] lg:w-[220px]"
            >
              <div className={`bg-surface rounded-xl p-3 h-full transition-opacity duration-500 ${
                hasData ? 'opacity-100' : 'opacity-50'
              }`}>
                {/* Day header */}
                <h3 className="font-semibold text-sm text-center text-primary-dark mb-2 h-5">
                  {hasData ? day.dayOfWeek!.slice(0, 3) : (
                    <span className="inline-block w-12 h-3 bg-border/60 rounded animate-pulse" />
                  )}
                </h3>

                {/* Meals */}
                <div className="space-y-2 min-h-[120px]">
                  {hasData && day.meals ? (
                    day.meals.map((meal, mealIndex) => (
                      <div
                        key={mealIndex}
                        className="animate-[fadeIn_0.4s_ease-out]"
                      >
                        <StreamingMealCard meal={meal} />
                      </div>
                    ))
                  ) : (
                    // Skeleton meal cards
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
  );
}

function StreamingMealCard({ meal }: { meal: PartialMeal }) {
  const mealType = meal.mealType as MealType | undefined;
  const colorClass = mealType ? MEAL_TYPE_COLORS[mealType] || MEAL_TYPE_COLORS.snack : 'bg-border/30 text-muted';

  return (
    <div className="bg-white rounded-lg p-2.5 border border-border/50 shadow-sm">
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1 min-w-0">
          {mealType && (
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide mb-1 ${colorClass}`}>
              {mealType}
            </span>
          )}
          {meal.recipeTitle ? (
            <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
              {meal.recipeTitle}
            </p>
          ) : (
            <div className="w-full h-3 bg-border/30 rounded animate-pulse mt-1" />
          )}
        </div>
        <Loader2
          className="w-3 h-3 text-primary/40 animate-spin shrink-0 mt-0.5"
          style={{ animationDuration: '2s' }}
        />
      </div>
    </div>
  );
}
