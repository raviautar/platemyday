'use client';

import { useState } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { WeekPlan, MealSlot } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { AIMealPlanOutput } from '@/lib/ai';

export default function MealPlanPage() {
  const { recipes, addRecipe } = useRecipes();
  const { weekPlan, setWeekPlan, moveMeal, removeMeal, clearWeekPlan } = useMealPlan();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (preferences: string, systemPrompt?: string) => {
    if (recipes.length === 0) {
      showToast('Add some recipes first to generate a meal plan!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipes: recipes.map(r => ({ id: r.id, title: r.title, tags: r.tags })),
          systemPrompt: systemPrompt || settings.mealPlanSystemPrompt,
          preferences,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate meal plan');
      }

      const aiPlan: AIMealPlanOutput = await res.json();

      // Convert AI output to WeekPlan format
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

      const newPlan: WeekPlan = {
        id: crypto.randomUUID(),
        weekStartDate: monday.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        days: aiPlan.days.map((aiDay, index) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + index);

          const meals: MealSlot[] = aiDay.meals.map(aiMeal => {
            // Try to match with existing recipe
            let recipeId = aiMeal.recipeId;
            if (!recipeId || !recipes.find(r => r.id === recipeId)) {
              const match = recipes.find(r =>
                r.title.toLowerCase() === aiMeal.recipeTitle.toLowerCase()
              );
              if (match) {
                recipeId = match.id;
              } else {
                // Create a placeholder recipe for unmatched titles
                const newRecipe = addRecipe({
                  title: aiMeal.recipeTitle,
                  description: `Auto-created from meal plan`,
                  ingredients: [],
                  instructions: [],
                  servings: 4,
                  prepTimeMinutes: 0,
                  cookTimeMinutes: 0,
                  tags: [aiMeal.mealType],
                  isAIGenerated: true,
                });
                recipeId = newRecipe.id;
              }
            }

            return {
              id: crypto.randomUUID(),
              recipeId: recipeId!,
              mealType: aiMeal.mealType,
            };
          });

          return {
            date: date.toISOString().split('T')[0],
            dayOfWeek: DAYS_OF_WEEK[index],
            meals,
          };
        }),
      };

      setWeekPlan(newPlan);
      showToast('Meal plan generated!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to generate meal plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meal Plan</h1>

      <MealPlanControls
        onGenerate={handleGenerate}
        onClear={clearWeekPlan}
        hasExistingPlan={!!weekPlan}
        loading={loading}
        defaultSystemPrompt={settings.mealPlanSystemPrompt}
      />

      <div className="mt-6">
        {weekPlan ? (
          <WeekView
            weekPlan={weekPlan}
            onMoveMeal={moveMeal}
            onRemoveMeal={removeMeal}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-lg font-medium text-foreground">No meal plan yet</p>
            <p className="text-muted mt-1">Generate a weekly meal plan using your recipes and AI!</p>
          </div>
        )}
      </div>
    </div>
  );
}
