'use client';

import { useMemo } from 'react';
import { DayPlan, MealSlot, SuggestedRecipe } from '@/types';
import { Flame } from 'lucide-react';
import { MealCard } from './MealCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface DayColumnProps {
  day: DayPlan;
  dayIndex: number;
  weekDays: DayPlan[];
  onRemoveMeal: (dayIndex: number, mealId: string) => void;
  onMoveMeal: (mealId: string, sourceDayIndex: number, targetDayIndex: number) => void;
  onReplaceMeal: (dayIndex: number, mealId: string, newMeal: MealSlot) => void;
  suggestedRecipes: Record<string, SuggestedRecipe>;
  onAddToLibrary: (recipe: SuggestedRecipe) => void;
}

export function DayColumn({ day, dayIndex, weekDays, onRemoveMeal, onMoveMeal, onReplaceMeal, suggestedRecipes, onAddToLibrary }: DayColumnProps) {
  const dailyCalories = useMemo(() => {
    return day.meals.reduce((sum, meal) => sum + (meal.estimatedNutrition?.calories || 0), 0);
  }, [day.meals]);

  return (
    <div className="bg-surface rounded-xl p-3 h-full">
      <h3 className="font-semibold text-sm text-center text-primary-dark mb-2">
        {day.dayOfWeek}
      </h3>
      <Droppable droppableId={`day-${dayIndex}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-[120px] rounded-lg p-1 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/10 border-2 border-dashed border-primary/30' : ''
              }`}
          >
            {day.meals.map((meal, mealIndex) => {
              const suggestedRecipe = meal.recipeTitleFallback
                ? suggestedRecipes[meal.recipeTitleFallback]
                : undefined;

              return (
                <Draggable key={meal.id} draggableId={meal.id} index={mealIndex}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'opacity-90 rotate-2' : ''}
                    >
                      <MealCard
                        meal={meal}
                        currentDayIndex={dayIndex}
                        weekDays={weekDays}
                        onRemove={() => onRemoveMeal(dayIndex, meal.id)}
                        onMoveTo={(targetDayIndex) => onMoveMeal(meal.id, dayIndex, targetDayIndex)}
                        onReplaceMeal={(newMeal) => onReplaceMeal(dayIndex, meal.id, newMeal)}
                        suggestedRecipe={suggestedRecipe}
                        onAddToLibrary={onAddToLibrary}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
            {day.meals.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-muted text-center py-4">No meals</p>
            )}
          </div>
        )}
      </Droppable>
      {dailyCalories > 0 && (
        <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-border/50">
          <Flame className="w-3 h-3 text-muted" />
          <span className="text-xs text-muted font-medium">~{dailyCalories} cal</span>
        </div>
      )}
    </div>
  );
}
