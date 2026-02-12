'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useToast } from '@/components/ui/Toast';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { MealPlanHistory } from '@/components/meal-plan/MealPlanHistory';
import { ShoppingList } from '@/components/meal-plan/ShoppingList';
import { GeneratingAnimation } from '@/components/ui/GeneratingAnimation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { WeekPlan, SuggestedRecipe } from '@/types';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { History, Sparkles, ShoppingCart, Settings2 } from 'lucide-react';
import { MdClose } from 'react-icons/md';
import Link from 'next/link';

export default function MealPlanPage() {
  const { recipes, addRecipe } = useRecipes();
  const { weekPlan, setWeekPlan, moveMeal, removeMeal, replaceMeal, clearWeekPlan } = useMealPlan();
  const { settings, updateSettings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCustomizeHint, setShowCustomizeHint] = useState(false);

  useEffect(() => {
    setShowHint(
      !settings.preferences.onboardingCompleted &&
      !settings.preferences.onboardingDismissed
    );
  }, [settings.preferences]);

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

  const buildWeekPlan = (data: any): WeekPlan => {
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
  };

  const handleGenerate = async (preferences: string, systemPrompt?: string) => {
    setLoading(true);
    setShowCustomizeHint(false);

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate meal plan');
      }

      const data = await response.json();
      const newWeekPlan = buildWeekPlan(data);

      const newSuggested = newWeekPlan.suggestedRecipes;
      await setWeekPlan(newWeekPlan, newSuggested);

      const newRecipeCount = data.newRecipes?.length || 0;
      if (newRecipeCount > 0) {
        showToast(`Meal plan generated with ${newRecipeCount} new recipe${newRecipeCount > 1 ? 's' : ''}!`);
      } else {
        showToast('Meal plan generated!');
      }

      setShowCustomizeHint(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to generate meal plan', 'error');
    } finally {
      setLoading(false);
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
    setShowCustomizeHint(false);
  };

  const handleDismissHint = () => {
    updateSettings({
      preferences: {
        ...settings.preferences,
        onboardingDismissed: true,
      },
    });
    setShowHint(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/60 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark font-[family-name:var(--font-outfit)]">
          Meal Plan
        </h1>
        <div className="flex items-center gap-2">
          {weekPlan && (
            <button
              type="button"
              aria-label="Shopping list"
              title="Shopping List"
              onClick={() => setShoppingListOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-dark shadow-sm shrink-0 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-medium hidden sm:inline">Shopping List</span>
            </button>
          )}
          <button
            type="button"
            aria-label="History of past generations"
            title="History"
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-dark shadow-sm shrink-0 transition-colors"
          >
            <History className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-medium hidden sm:inline">History</span>
          </button>
        </div>
      </div>

      {showHint && (
        <div className="bg-gradient-to-r from-primary/10 to-emerald-50 border border-primary/30 rounded-xl p-4 mb-6 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Get Personalized Meal Plans</h3>
              <p className="text-sm text-muted mb-3">
                Get balanced meal plans tailored to your diet and nutrition goals.
              </p>
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-sm font-medium text-primary hover:text-primary-dark underline"
              >
                Set up preferences (2 min)
              </button>
            </div>
          </div>
          <button onClick={handleDismissHint} className="text-muted hover:text-foreground ml-2">
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      )}

      <MealPlanControls
        onGenerate={handleGenerate}
        onClear={handleClearPlan}
        hasExistingPlan={!!weekPlan}
        loading={loading}
        defaultSystemPrompt={settings.mealPlanSystemPrompt}
        onboardingCompleted={settings.preferences.onboardingCompleted}
      />

      <div className="mt-6">
        {loading ? (
          <div className="bg-white rounded-xl border border-border">
            <GeneratingAnimation message="Creating your meal plan..." />
          </div>
        ) : weekPlan ? (
          <>
            {/* Post-generation customize hint */}
            {showCustomizeHint && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 mb-4 flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Settings2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">
                    Want better results? Use the <strong>Customize</strong> button to tell us about ingredients you have, preferred cuisines, and more.
                    {!settings.preferences.onboardingCompleted && (
                      <> You can also <Link href="/customize" className="text-primary font-medium hover:underline">set up your meal preferences</Link> for even better recommendations.</>
                    )}
                  </p>
                </div>
                <button onClick={() => setShowCustomizeHint(false)} className="text-muted hover:text-foreground ml-2">
                  <MdClose className="w-5 h-5" />
                </button>
              </div>
            )}

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
        <ShoppingList
          isOpen={shoppingListOpen}
          onClose={() => setShoppingListOpen(false)}
          weekPlan={weekPlan}
          recipes={recipes}
          suggestedRecipes={suggestedRecipes}
        />
      )}

      <OnboardingWizard isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
