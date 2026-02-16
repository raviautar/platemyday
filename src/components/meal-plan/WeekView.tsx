'use client';

import { WeekPlan, MealSlot, SuggestedRecipe } from '@/types';
import { DayColumn } from './DayColumn';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';

interface WeekViewProps {
  weekPlan: WeekPlan;
  onMoveMeal: (mealId: string, sourceDayIndex: number, destDayIndex: number, destMealIndex: number) => void;
  onRemoveMeal: (dayIndex: number, mealId: string) => void;
  onReplaceMeal: (dayIndex: number, mealId: string, newMeal: MealSlot) => void;
  suggestedRecipes: Record<string, SuggestedRecipe>;
  onAddToLibrary: (recipe: SuggestedRecipe) => void;
}

export function WeekView({ weekPlan, onMoveMeal, onRemoveMeal, onReplaceMeal, suggestedRecipes, onAddToLibrary }: WeekViewProps) {
  const { track } = useAnalytics();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceDayIndex = parseInt(result.source.droppableId.replace('day-', ''));
    const destDayIndex = parseInt(result.destination.droppableId.replace('day-', ''));
    const destIndex = result.destination.index;

    if (sourceDayIndex !== destDayIndex) {
      track(EVENTS.MEAL_MOVED, {
        from_day: weekPlan.days[sourceDayIndex]?.dayOfWeek,
        to_day: weekPlan.days[destDayIndex]?.dayOfWeek,
      });
    }

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
                onReplaceMeal={onReplaceMeal}
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
