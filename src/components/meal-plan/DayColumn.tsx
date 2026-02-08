'use client';

import { DayPlan, LoadingRecipe } from '@/types';
import { MealCard } from './MealCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface DayColumnProps {
  day: DayPlan;
  dayIndex: number;
  onRemoveMeal: (dayIndex: number, mealId: string) => void;
  onRecipeAdded: (title: string, newRecipeId: string) => void;
  loadingRecipes: Map<string, LoadingRecipe>;
  onAddToLibrary: (recipe: LoadingRecipe) => void;
}

export function DayColumn({ day, dayIndex, onRemoveMeal, onRecipeAdded, loadingRecipes, onAddToLibrary }: DayColumnProps) {
  return (
    <div className="bg-surface rounded-xl p-3 min-w-[160px]">
      <h3 className="font-semibold text-sm text-center text-primary-dark mb-2">
        {day.dayOfWeek}
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
                        onRemove={() => onRemoveMeal(dayIndex, meal.id)}
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
