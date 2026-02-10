'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { WeekPlan, SuggestedRecipe } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { History } from 'lucide-react';

export default function MealPlanPage() {
  const { recipes, addRecipe } = useRecipes();
  const { weekPlan, setWeekPlan, moveMeal, removeMeal, clearWeekPlan, updateSuggestedRecipes, markRecipesComplete, removeSuggestedRecipe, clearSuggestedRecipes } = useMealPlan();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const weekPlanRef = useRef(weekPlan);
  const suggestedRecipesRef = useRef<Record<string, SuggestedRecipe>>(weekPlan?.suggestedRecipes || {});

  useEffect(() => {
    weekPlanRef.current = weekPlan;
    suggestedRecipesRef.current = weekPlan?.suggestedRecipes || {};
  }, [weekPlan]);

  const suggestedRecipes = useMemo(() => weekPlan?.suggestedRecipes || {}, [weekPlan?.suggestedRecipes]);

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
    const currentWeekPlan = weekPlanRef.current;

    const days = partialData.days.map((day: any, index: number) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const existingDayMeals = currentWeekPlan?.days[index]?.meals || [];
      const usedExistingIds = new Set<string>();

      return {
        date: date.toISOString().split('T')[0],
        dayOfWeek: day.dayOfWeek || DAYS_OF_WEEK[index],
        meals: (day.meals || []).map((meal: any, mealIndex: number) => {
          const recipeId = meal.recipeId || '';
          const recipeTitleFallback = meal.recipeId ? undefined : meal.recipeTitle;
          const positionalMatch = existingDayMeals[mealIndex];
          const signatureMatchesPositional =
            positionalMatch &&
            positionalMatch.mealType === meal.mealType &&
            positionalMatch.recipeId === recipeId &&
            positionalMatch.recipeTitleFallback === recipeTitleFallback;

          if (signatureMatchesPositional && !usedExistingIds.has(positionalMatch.id)) {
            usedExistingIds.add(positionalMatch.id);
            return {
              id: positionalMatch.id,
              recipeId,
              mealType: meal.mealType,
              recipeTitleFallback,
            };
          }

          const matchingMeal = existingDayMeals.find((existingMeal) =>
            !usedExistingIds.has(existingMeal.id) &&
            existingMeal.mealType === meal.mealType &&
            existingMeal.recipeId === recipeId &&
            existingMeal.recipeTitleFallback === recipeTitleFallback
          );

          if (matchingMeal) {
            usedExistingIds.add(matchingMeal.id);
            return {
              id: matchingMeal.id,
              recipeId,
              mealType: meal.mealType,
              recipeTitleFallback,
            };
          }

          return {
            id: crypto.randomUUID(),
            recipeId,
            mealType: meal.mealType,
            recipeTitleFallback,
          };
        }),
      };
    });

    const nextWeekPlan: WeekPlan = {
      id: currentWeekPlan?.id || crypto.randomUUID(),
      weekStartDate: weekStart.toISOString().split('T')[0],
      createdAt: currentWeekPlan?.createdAt || new Date().toISOString(),
      days,
      suggestedRecipes: suggestedRecipesRef.current,
    };

    weekPlanRef.current = nextWeekPlan;
    setWeekPlan(nextWeekPlan);
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
      loadedFields: Object.keys(recipe),
    }));

    const updatedSuggestions = { ...suggestedRecipesRef.current };
    recipesToUpdate.forEach((recipe) => {
      const existing = updatedSuggestions[recipe.title];
      const isComplete = recipe.ingredients.length > 0 &&
        recipe.instructions.length > 0 &&
        !!recipe.description &&
        recipe.servings !== undefined &&
        recipe.prepTimeMinutes !== undefined &&
        recipe.cookTimeMinutes !== undefined;

      updatedSuggestions[recipe.title] = {
        title: recipe.title,
        description: recipe.description || existing?.description,
        ingredients: recipe.ingredients || existing?.ingredients || [],
        instructions: recipe.instructions || existing?.instructions || [],
        servings: recipe.servings ?? existing?.servings,
        prepTimeMinutes: recipe.prepTimeMinutes ?? existing?.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes ?? existing?.cookTimeMinutes,
        tags: recipe.tags || existing?.tags || [],
        mealTypes: [],
        isLoading: !isComplete,
        loadedFields: recipe.loadedFields,
      };
    });
    suggestedRecipesRef.current = updatedSuggestions;

    updateSuggestedRecipes(recipesToUpdate);
  };

  const markRecipesCompleteLocal = (newRecipes: any[]) => {
    const titles = newRecipes.map((recipe: any) => recipe.title);
    const updatedSuggestions = { ...suggestedRecipesRef.current };
    titles.forEach((title: string) => {
      const existing = updatedSuggestions[title];
      if (existing) {
        updatedSuggestions[title] = { ...existing, isLoading: false };
      }
    });
    suggestedRecipesRef.current = updatedSuggestions;
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
    suggestedRecipesRef.current = {};
    clearSuggestedRecipes();
    
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
      let receivedData = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream reading completed');
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
          
          try {
            const jsonStr = trimmedLine.slice(6).trim();
            if (!jsonStr) continue;
            
            const message = JSON.parse(jsonStr);
            receivedData = true;
            
            if (message.type === 'start') {
              console.log('Stream started:', new Date(message.timestamp).toISOString());
            } else if (message.type === 'update') {
              const partialData = message.data;
              
              if (partialData.newRecipes && partialData.newRecipes.length > 0) {
                updateSuggestedRecipesLocal(partialData.newRecipes);
              }
              
              if (partialData.days && partialData.days.length > 0) {
                updateWeekPlanFromPartial(partialData);
              }
            } else if (message.type === 'done') {
              const finalData = message.data;
              if (finalData.newRecipes) {
                markRecipesCompleteLocal(finalData.newRecipes);
              }
              updateWeekPlanFromPartial(finalData);
              
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
            console.error('Failed to parse SSE message:', parseError, 'Line:', trimmedLine);
          }
        }
      }
      
      if (!receivedData) {
        throw new Error('No data received from server');
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

    const updatedSuggestions = { ...suggestedRecipesRef.current };
    delete updatedSuggestions[suggestedRecipe.title];
    suggestedRecipesRef.current = updatedSuggestions;
    removeSuggestedRecipe(suggestedRecipe.title);
    
    showToast(`${suggestedRecipe.title} added to your library!`);
  };

  const handleRecipeAdded = (title: string, newRecipeId: string) => {
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
    suggestedRecipesRef.current = {};
    clearWeekPlan();
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
