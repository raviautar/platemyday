'use client';

import { useState } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { WeekPlan, MealSlot, MealType, SuggestedRecipe } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { History } from 'lucide-react';

export interface UnmatchedRecipe {
  title: string;
  mealType: MealType;
}

export default function MealPlanPage() {
  const { recipes, addRecipe } = useRecipes();
  const { weekPlan, setWeekPlan, moveMeal, removeMeal, clearWeekPlan, updateSuggestedRecipes, markRecipesComplete, removeSuggestedRecipe, clearSuggestedRecipes } = useMealPlan();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [unmatchedRecipes, setUnmatchedRecipes] = useState<UnmatchedRecipe[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  const suggestedRecipes = weekPlan?.suggestedRecipes || {};

  const getWeekStartDate = (weekStartDay: string) => {
    const today = new Date();
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    
    const targetDay = dayMap[weekStartDay];
    const currentDay = today.getDay();
    
    let daysToSubtract = currentDay - targetDay;
    if (daysToSubtract < 0) {
      daysToSubtract += 7;
    }
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysToSubtract);
    
    return weekStart;
  };

  const updateWeekPlanFromPartial = (partialData: any) => {
    const weekStart = getWeekStartDate(settings.weekStartDay);
    
    const days = partialData.days.map((day: any, index: number) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      
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
      weekStartDate: weekStart.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      days,
      suggestedRecipes: {},
    });
  };

  const updateSuggestedRecipesLocal = (newRecipes: any[]) => {
    const recipesToUpdate: SuggestedRecipe[] = newRecipes.map((recipe: any) => ({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      servings: recipe.servings,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      tags: recipe.tags || [],
      mealTypes: [],
      isLoading: true,
      loadedFields: new Set(Object.keys(recipe)),
    }));
    
    updateSuggestedRecipes(recipesToUpdate);
  };

  const markRecipesCompleteLocal = (newRecipes: any[]) => {
    const titles = newRecipes.map((recipe: any) => recipe.title);
    markRecipesComplete(titles);
  };

  const handleGenerate = async (preferences: string, systemPrompt?: string) => {
    if (recipes.length === 0) {
      showToast('Add some recipes first to generate a meal plan!', 'error');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    clearSuggestedRecipes();
    setUnmatchedRecipes([]);
    
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipes: recipes.map(r => ({ id: r.id, title: r.title, tags: r.tags })),
          systemPrompt: systemPrompt || settings.mealPlanSystemPrompt,
          preferences,
          weekStartDay: settings.weekStartDay
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
                updateSuggestedRecipesLocal(partialData.newRecipes);
              }
            } else if (message.type === 'done') {
              const finalData = message.data;
              updateWeekPlanFromPartial(finalData);
              if (finalData.newRecipes) {
                markRecipesCompleteLocal(finalData.newRecipes);
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
        showToast('Generation cancelled');
      } else {
        showToast(error instanceof Error ? error.message : 'Failed to generate meal plan', 'error');
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleAddToLibrary = (suggestedRecipe: SuggestedRecipe) => {
    const newRecipe = {
      title: suggestedRecipe.title,
      description: suggestedRecipe.description || '',
      ingredients: suggestedRecipe.ingredients,
      instructions: suggestedRecipe.instructions,
      servings: suggestedRecipe.servings || 4,
      prepTimeMinutes: suggestedRecipe.prepTimeMinutes || 0,
      cookTimeMinutes: suggestedRecipe.cookTimeMinutes || 0,
      tags: suggestedRecipe.tags,
      isAIGenerated: true,
    };
    
    const recipe = addRecipe(newRecipe);
    handleRecipeAdded(suggestedRecipe.title, recipe.id);
    
    removeSuggestedRecipe(suggestedRecipe.title);
    
    showToast(`${suggestedRecipe.title} added to your library!`);
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
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/60 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark font-[family-name:var(--font-outfit)]">
          Meal Plan
        </h1>
        <button
          type="button"
          aria-label="History of past generations"
          title="History"
          onClick={() => showToast('This feature is locked')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-muted opacity-75 cursor-not-allowed hover:opacity-75 hover:text-muted shadow-sm shrink-0"
        >
          <History className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium hidden sm:inline">History</span>
        </button>
      </div>

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
            suggestedRecipes={suggestedRecipes}
            onAddToLibrary={handleAddToLibrary}
          />
        ) : (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No meal plan yet</h3>
              <p className="text-sm text-muted">
                Generate a weekly meal plan using your recipes and AI to get started with organized meal planning.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
