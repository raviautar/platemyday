'use client';

import { DayPlan, LoadingRecipe } from '@/types';
import { MealCard } from './MealCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface DayColumnProps {
  day: DayPlan;
  dayIndex: number;
  weekDays: DayPlan[];
  onRemoveMeal: (dayIndex: number, mealId: string) => void;
  onMoveMeal: (mealId: string, sourceDayIndex: number, targetDayIndex: number) => void;
  onRecipeAdded: (title: string, newRecipeId: string) => void;
  loadingRecipes: Map<string, LoadingRecipe>;
  onAddToLibrary: (recipe: LoadingRecipe) => void;
}

export function DayColumn({ day, dayIndex, weekDays, onRemoveMeal, onMoveMeal, onRecipeAdded, loadingRecipes, onAddToLibrary }: DayColumnProps) {
  const formatDate = (dateStr: string, dayOfWeek: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = date.getDate();
    const dayAbbr = dayOfWeek.slice(0, 3);
    return `${dayAbbr} - ${month} ${dayNum}`;
  };

  return (
    <div className="bg-surface rounded-xl p-3 min-w-[160px]">
      <h3 className="font-semibold text-sm text-center text-primary-dark mb-2">
        {formatDate(day.date, day.dayOfWeek)}
      </h3>
      <Droppable droppableId={`day-${dayIndex}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-[120px] rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/10 border-2 border-dashed border-primary/30' : ''
            }`}
          >
            {day.meals.map((meal, mealIndex) => {
              const loadingRecipe = meal.recipeTitleFallback 
                ? loadingRecipes.get(meal.recipeTitleFallback) 
                : undefined;
              
              return (
                <Draggable key={meal.id} draggableId={meal.id} index={mealIndex} isDragDisabled={loadingRecipe?.isLoading}>
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
                        onMealUpdated={onRecipeAdded}
                        loadingRecipe={loadingRecipe}
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
    </div>
  );
}
