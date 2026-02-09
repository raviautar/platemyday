'use client';

import { WeekPlan, SuggestedRecipe } from '@/types';
import { DayColumn } from './DayColumn';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { UnmatchedRecipe } from '@/app/meal-plan/page';

interface WeekViewProps {
  weekPlan: WeekPlan;
  onMoveMeal: (mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => void;
  onRemoveMeal: (dayIndex: number, mealId: string) => void;
  unmatchedRecipes: UnmatchedRecipe[];
  onRecipeAdded: (title: string, newRecipeId: string) => void;
  suggestedRecipes: Record<string, SuggestedRecipe>;
  onAddToLibrary: (recipe: SuggestedRecipe) => void;
}

export function WeekView({ weekPlan, onMoveMeal, onRemoveMeal, unmatchedRecipes, onRecipeAdded, suggestedRecipes, onAddToLibrary }: WeekViewProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceDayIndex = parseInt(result.source.droppableId.replace('day-', ''));
    const destDayIndex = parseInt(result.destination.droppableId.replace('day-', ''));
    const destIndex = result.destination.index;

    onMoveMeal(result.draggableId, sourceDayIndex, destDayIndex, destIndex);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="md:overflow-x-auto md:pb-4 md:-mx-4 md:px-4 lg:-mx-6 lg:px-6">
        <div className="flex flex-col md:flex-row gap-6 md:w-max">
          {weekPlan.days.map((day, index) => (
            <div key={day.dayOfWeek} className="w-full md:flex-shrink-0 md:w-[200px] lg:w-[220px]">
              <DayColumn
                day={day}
                dayIndex={index}
                weekDays={weekPlan.days}
                onRemoveMeal={onRemoveMeal}
                onMoveMeal={(mealId, sourceDayIndex, targetDayIndex) => {
                  onMoveMeal(mealId, sourceDayIndex, targetDayIndex, weekPlan.days[targetDayIndex].meals.length);
                }}
                onRecipeAdded={onRecipeAdded}
                suggestedRecipes={suggestedRecipes}
                onAddToLibrary={onAddToLibrary}
              />
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
