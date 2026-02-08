'use client';

import { WeekPlan } from '@/types';
import { DayColumn } from './DayColumn';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { UnmatchedRecipe } from '@/app/meal-plan/page';

interface WeekViewProps {
  weekPlan: WeekPlan;
  onMoveMeal: (mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => void;
  onRemoveMeal: (dayIndex: number, mealId: string) => void;
  unmatchedRecipes: UnmatchedRecipe[];
  onRecipeAdded: (title: string, newRecipeId: string) => void;
}

export function WeekView({ weekPlan, onMoveMeal, onRemoveMeal, unmatchedRecipes, onRecipeAdded }: WeekViewProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceDayIndex = parseInt(result.source.droppableId.replace('day-', ''));
    const destDayIndex = parseInt(result.destination.droppableId.replace('day-', ''));
    const destIndex = result.destination.index;

    onMoveMeal(result.draggableId, sourceDayIndex, destDayIndex, destIndex);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekPlan.days.map((day, index) => (
          <DayColumn
            key={day.dayOfWeek}
            day={day}
            dayIndex={index}
            onRemoveMeal={onRemoveMeal}
            onRecipeAdded={onRecipeAdded}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
