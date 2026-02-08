'use client';

import { useState } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { WeekPlan, MealSlot, MealType, LoadingRecipe } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';

export interface UnmatchedRecipe {
  title: string;
  mealType: MealType;
}

export default function MealPlanPage() {
  const { recipes, addRecipe } = useRecipes();
  const { weekPlan, setWeekPlan, moveMeal, removeMeal, clearWeekPlan } = useMealPlan();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [unmatchedRecipes, setUnmatchedRecipes] = useState<UnmatchedRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState<Map<string, LoadingRecipe>>(new Map());
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const updateWeekPlanFromPartial = (partialData: any) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    
    const days = partialData.days.map((day: any, index: number) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      
      return {
        date: date.toISOString().split('T')[0],
        dayOfWeek: day.dayOfWeek || DAYS_OF_WEEK[index],
        meals: (day.meals || []).map((meal: any) => ({
          id: crypto.randomUUID(),
          recipeId: meal.recipeId || '',
          mealType: meal.mealType,
          recipeTitleFallback: meal.recipeId ? undefined : meal.recipeTitle,
        })),
      };
    });
    
    setWeekPlan({
      id: crypto.randomUUID(),
      weekStartDate: monday.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      days,
    });
  };

  const updateLoadingRecipes = (newRecipes: any[]) => {
    setLoadingRecipes(prev => {
      const updated = new Map(prev);
      
      newRecipes.forEach((recipe: any) => {
        const existing = updated.get(recipe.title);
        const isComplete = recipe.ingredients?.length > 0 && 
                          recipe.instructions?.length > 0 &&
                          recipe.description &&
                          recipe.servings &&
                          recipe.prepTimeMinutes !== undefined &&
                          recipe.cookTimeMinutes !== undefined;
        
        updated.set(recipe.title, {
          title: recipe.title,
          description: recipe.description || existing?.description,
          ingredients: recipe.ingredients || existing?.ingredients || [],
          instructions: recipe.instructions || existing?.instructions || [],
          servings: recipe.servings || existing?.servings,
          prepTimeMinutes: recipe.prepTimeMinutes ?? existing?.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes ?? existing?.cookTimeMinutes,
          tags: recipe.tags || existing?.tags || [],
          mealTypes: [],
          isLoading: !isComplete,
          loadedFields: new Set(Object.keys(recipe)),
        });
      });
      
      return updated;
    });
  };

  const markRecipesComplete = (newRecipes: any[]) => {
    setLoadingRecipes(prev => {
      const updated = new Map(prev);
      newRecipes.forEach((recipe: any) => {
        const existing = updated.get(recipe.title);
        if (existing) {
          updated.set(recipe.title, { ...existing, isLoading: false });
        }
      });
      return updated;
    });
  };

  const handleGenerate = async (preferences: string, systemPrompt?: string) => {
    if (recipes.length === 0) {
      showToast('Add some recipes first to generate a meal plan!', 'error');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    setLoadingRecipes(new Map());
    setUnmatchedRecipes([]);
    
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipes: recipes.map(r => ({ id: r.id, title: r.title, tags: r.tags })),
          systemPrompt: systemPrompt || settings.mealPlanSystemPrompt,
          preferences 
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate meal plan');
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const message = JSON.parse(line.slice(6));
            
            if (message.type === 'update') {
              const partialData = message.data;
              
              if (partialData.days && partialData.days.length > 0) {
                updateWeekPlanFromPartial(partialData);
              }
              
              if (partialData.newRecipes && partialData.newRecipes.length > 0) {
                updateLoadingRecipes(partialData.newRecipes);
              }
            } else if (message.type === 'done') {
              const finalData = message.data;
              updateWeekPlanFromPartial(finalData);
              if (finalData.newRecipes) {
                markRecipesComplete(finalData.newRecipes);
              }
              
              const newRecipeCount = finalData.newRecipes?.length || 0;
              if (newRecipeCount > 0) {
                showToast(`Meal plan generated with ${newRecipeCount} new recipe${newRecipeCount > 1 ? 's' : ''}!`);
              } else {
                showToast('Meal plan generated!');
              }
            } else if (message.type === 'error') {
              throw new Error(message.error);
            }
          } catch (parseError) {
            console.error('Failed to parse SSE message:', parseError);
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setLoadingRecipes(prev => {
          const filtered = new Map();
          prev.forEach((recipe, title) => {
            if (!recipe.isLoading) {
              filtered.set(title, recipe);
            }
          });
          return filtered;
        });
        showToast('Generation cancelled - kept completed recipes');
      } else {
        showToast(error instanceof Error ? error.message : 'Failed to generate meal plan', 'error');
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleAddToLibrary = (loadingRecipe: LoadingRecipe) => {
    const newRecipe = {
      title: loadingRecipe.title,
      description: loadingRecipe.description || '',
      ingredients: loadingRecipe.ingredients,
      instructions: loadingRecipe.instructions,
      servings: loadingRecipe.servings || 4,
      prepTimeMinutes: loadingRecipe.prepTimeMinutes || 0,
      cookTimeMinutes: loadingRecipe.cookTimeMinutes || 0,
      tags: loadingRecipe.tags,
      isAIGenerated: true,
    };
    
    const recipe = addRecipe(newRecipe);
    handleRecipeAdded(loadingRecipe.title, recipe.id);
    
    setLoadingRecipes(prev => {
      const updated = new Map(prev);
      updated.delete(loadingRecipe.title);
      return updated;
    });
    
    showToast(`${loadingRecipe.title} added to your library!`);
  };

  const handleRecipeAdded = (title: string, newRecipeId: string) => {
    setUnmatchedRecipes(prev => prev.filter(r => r.title !== title));
    
    if (weekPlan) {
      const updatedPlan: WeekPlan = {
        ...weekPlan,
        days: weekPlan.days.map(day => ({
          ...day,
          meals: day.meals.map(meal => 
            meal.recipeTitleFallback?.toLowerCase() === title.toLowerCase()
              ? { ...meal, recipeId: newRecipeId, recipeTitleFallback: undefined }
              : meal
          ),
        })),
      };
      setWeekPlan(updatedPlan);
    }
  };

  const handleClearPlan = () => {
    if (abortController) {
      abortController.abort();
    }
    clearWeekPlan();
    setUnmatchedRecipes([]);
    setLoadingRecipes(new Map());
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meal Plan</h1>

      <MealPlanControls
        onGenerate={handleGenerate}
        onClear={handleClearPlan}
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
            unmatchedRecipes={unmatchedRecipes}
            onRecipeAdded={handleRecipeAdded}
            loadingRecipes={loadingRecipes}
            onAddToLibrary={handleAddToLibrary}
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
