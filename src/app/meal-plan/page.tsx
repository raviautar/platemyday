'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useToast } from '@/components/ui/Toast';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { MealPlanHistory } from '@/components/meal-plan/MealPlanHistory';
import { ShoppingList } from '@/components/meal-plan/ShoppingList';
import { NutritionSummary } from '@/components/meal-plan/NutritionSummary';
import { GeneratingAnimation } from '@/components/ui/GeneratingAnimation';
import { StreamingMealView } from '@/components/meal-plan/StreamingMealView';
import { WeekPlan, SuggestedRecipe } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { History, ShoppingCart, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface PartialPlan {
  days?: Array<{
    dayOfWeek?: string;
    meals?: Array<{
      mealType?: string;
      recipeTitle?: string;
      recipeId?: string;
      estimatedNutrition?: { calories?: number };
    }>;
  }>;
}

function PieChartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
      <path
        d="M12 2 A10 10 0 0 1 22 12 L12 12 Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M12 12 L22 12 A10 10 0 0 1 12 22 Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M12 12 L12 22 A10 10 0 0 1 2 12 Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path d="M12 2 L12 12 L22 12" stroke="currentColor" fill="none" />
    </svg>
  );
}

export default function MealPlanPage() {
  const { recipes, addRecipe } = useRecipes();
  const { weekPlan, setWeekPlan, moveMeal, removeMeal, replaceMeal, clearWeekPlan } = useMealPlan();
  const { settings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { track } = useAnalytics();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [partialPlan, setPartialPlan] = useState<PartialPlan | null>(null);
  const lastPreferencesRef = useRef('');

  const suggestedRecipes = useMemo(() => weekPlan?.suggestedRecipes || {}, [weekPlan?.suggestedRecipes]);

  const getWeekStartDate = useCallback((weekStartDay: string) => {
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
  }, []);

  const buildWeekPlan = useCallback((data: any): WeekPlan => {
    const weekStart = getWeekStartDate(settings.weekStartDay);

    const suggestedRecipesMap: Record<string, SuggestedRecipe> = {};
    if (data.newRecipes) {
      data.newRecipes.forEach((recipe: any) => {
        suggestedRecipesMap[recipe.title] = {
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          servings: recipe.servings,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          tags: recipe.tags || [],
          estimatedNutrition: recipe.estimatedNutrition,
        };
      });
    }

    const days = data.days.map((day: any, index: number) => {
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
          estimatedNutrition: meal.estimatedNutrition,
        })),
      };
    });

    return {
      id: crypto.randomUUID(),
      weekStartDate: weekStart.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      days,
      suggestedRecipes: Object.keys(suggestedRecipesMap).length > 0 ? suggestedRecipesMap : undefined,
    };
  }, [getWeekStartDate, settings.weekStartDay]);

  const handleGenerate = async (preferences: string, systemPrompt?: string) => {
    setLoading(true);
    setGenerationError(null);
    setPartialPlan(null);
    lastPreferencesRef.current = preferences;
    const isFirstPlan = !weekPlan;
    const generationStartTime = Date.now();

    track(EVENTS.MEAL_PLAN_GENERATION_STARTED, {
      has_existing_plan: !!weekPlan,
      has_preferences: !!preferences,
      recipe_library_size: recipes.length,
    });

    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipes: recipes.map(r => ({ id: r.id, title: r.title, tags: r.tags })),
          systemPrompt: systemPrompt || settings.mealPlanSystemPrompt,
          preferences,
          weekStartDay: settings.weekStartDay,
          userId,
          anonymousId,
        }),
      });

      // Non-streaming errors (validation, rate limit) still return proper HTTP codes
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate meal plan');
      }

      // Read NDJSON stream: each line is a partial or final object
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('ERROR:')) {
            const errorData = JSON.parse(trimmed.slice(6));
            throw new Error(errorData.error || 'Generation failed');
          }

          if (trimmed.startsWith('DONE:')) {
            finalData = JSON.parse(trimmed.slice(5));
          } else {
            // Partial object update — show progressive UI
            try {
              const partial = JSON.parse(trimmed);
              setPartialPlan(partial);
            } catch {
              // Ignore malformed partial lines
            }
          }
        }
      }

      // Process any remaining buffer
      const remaining = buffer.trim();
      if (remaining) {
        if (remaining.startsWith('ERROR:')) {
          const errorData = JSON.parse(remaining.slice(6));
          throw new Error(errorData.error || 'Generation failed');
        }
        if (remaining.startsWith('DONE:')) {
          finalData = JSON.parse(remaining.slice(5));
        }
      }

      if (!finalData) {
        throw new Error('Failed to generate meal plan. The AI returned an incomplete response.');
      }

      const newWeekPlan = buildWeekPlan(finalData);
      const newSuggested = newWeekPlan.suggestedRecipes;
      await setWeekPlan(newWeekPlan, newSuggested);

      const newRecipeCount = finalData.newRecipes?.length || 0;
      const generationTime = Date.now() - generationStartTime;

      track(EVENTS.MEAL_PLAN_GENERATION_COMPLETED, {
        new_recipe_count: newRecipeCount,
        generation_time_ms: generationTime,
        total_meals: finalData.days?.reduce((sum: number, d: { meals?: unknown[] }) => sum + (d.meals?.length || 0), 0) || 0,
      });

      if (isFirstPlan) {
        track(EVENTS.FIRST_MEAL_PLAN_GENERATED);
      }

      if (newRecipeCount > 0) {
        showToast(`Meal plan generated with ${newRecipeCount} new recipe${newRecipeCount > 1 ? 's' : ''}!`);
      } else {
        showToast('Meal plan generated!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate meal plan';
      track(EVENTS.MEAL_PLAN_GENERATION_FAILED, { error_message: message });
      setGenerationError(message);
    } finally {
      setLoading(false);
      setPartialPlan(null);
    }
  };

  const handleAddToLibrary = async (suggestedRecipe: SuggestedRecipe) => {
    const recipe = await addRecipe({
      title: suggestedRecipe.title,
      description: suggestedRecipe.description || '',
      ingredients: suggestedRecipe.ingredients,
      instructions: suggestedRecipe.instructions,
      servings: suggestedRecipe.servings || 4,
      prepTimeMinutes: suggestedRecipe.prepTimeMinutes || 0,
      cookTimeMinutes: suggestedRecipe.cookTimeMinutes || 0,
      tags: suggestedRecipe.tags,
      isAIGenerated: true,
    });

    handleRecipeAdded(suggestedRecipe.title, recipe.id);
    track(EVENTS.SUGGESTED_RECIPE_SAVED, { recipe_title: suggestedRecipe.title });
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
    clearWeekPlan();
  };

  const isStreaming = loading && partialPlan && partialPlan.days && partialPlan.days.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/60 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark font-[family-name:var(--font-outfit)]">
            Meal Plan
          </h1>
          <button
            type="button"
            aria-label="History of past generations"
            title="History"
            onClick={() => setHistoryOpen(true)}
            className="p-1.5 hover:bg-surface rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <History className="w-5 h-5" strokeWidth={2} />
          </button>
          {weekPlan && (
            <>
              <button
                type="button"
                aria-label="Clear meal plan"
                title="Clear Plan"
                onClick={handleClearPlan}
                className="p-1.5 hover:bg-surface rounded-lg transition-colors text-muted hover:text-red-600"
              >
                <Trash2 className="w-5 h-5" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Shopping list"
            title="Shopping List"
            onClick={() => weekPlan && setShoppingListOpen(true)}
            disabled={!weekPlan}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm shrink-0 transition-all ${
              weekPlan
                ? 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary-dark hover:to-emerald-700 shadow-md hover:shadow-lg'
                : 'bg-surface border border-border text-muted cursor-not-allowed opacity-60'
            }`}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-semibold hidden sm:inline">Shopping List</span>
          </button>
          {weekPlan && (
            <button
              type="button"
              aria-label="View nutrition summary"
              title="Nutrition Summary"
              onClick={() => setNutritionOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-dark shadow-sm shrink-0 transition-colors"
            >
              <PieChartIcon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Nutrition</span>
            </button>
          )}
        </div>
      </div>

      <MealPlanControls
        onGenerate={handleGenerate}
        hasExistingPlan={!!weekPlan}
        loading={loading}
        defaultSystemPrompt={settings.mealPlanSystemPrompt}
        onboardingCompleted={settings.preferences.onboardingCompleted}
      />

      <div className="mt-6">
        {loading ? (
          <>
            <div className="bg-white rounded-xl border border-border mb-6">
              <GeneratingAnimation compact={isStreaming ? true : false} />
            </div>
            {isStreaming && (
              <StreamingMealView partialPlan={partialPlan!} />
            )}
          </>
        ) : generationError ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Generation failed</h3>
              <p className="text-sm text-muted mb-6">{generationError}</p>
              <button
                onClick={() => { setGenerationError(null); handleGenerate(lastPreferencesRef.current); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-medium text-sm hover:from-primary-dark hover:to-emerald-700 shadow-sm hover:shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        ) : weekPlan ? (
          <>
            <WeekView
              weekPlan={weekPlan}
              onMoveMeal={moveMeal}
              onRemoveMeal={removeMeal}
              onReplaceMeal={replaceMeal}
              suggestedRecipes={suggestedRecipes}
              onAddToLibrary={handleAddToLibrary}
            />
          </>
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
                Hit Generate to create a weekly meal plan powered by AI. Customize your week first for the best results.
              </p>
            </div>
          </div>
        )}
      </div>

      <MealPlanHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {weekPlan && (
        <>
          <NutritionSummary
            weekPlan={weekPlan}
            isOpen={nutritionOpen}
            onClose={() => setNutritionOpen(false)}
          />
          <ShoppingList
            isOpen={shoppingListOpen}
            onClose={() => setShoppingListOpen(false)}
            weekPlan={weekPlan}
            recipes={recipes}
            suggestedRecipes={suggestedRecipes}
          />
        </>
      )}
    </div>
  );
}
