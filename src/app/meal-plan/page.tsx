'use client';

import { useState, useMemo } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSettings } from '@/contexts/SettingsContext';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { MealPlanHistory } from '@/components/meal-plan/MealPlanHistory';
import { ShoppingList } from '@/components/meal-plan/ShoppingList';
import { NutritionSummary } from '@/components/meal-plan/NutritionSummary';
import { GeneratingAnimation } from '@/components/ui/GeneratingAnimation';
import { StreamingMealView } from '@/components/meal-plan/StreamingMealView';
import { PieChartIcon } from '@/components/ui/PieChartIcon';
import { useMealPlanGeneration } from '@/hooks/useMealPlanGeneration';
import { History, ShoppingCart, AlertTriangle, RefreshCw, Trash2, Calendar } from 'lucide-react';

export default function MealPlanPage() {
  const { recipes } = useRecipes();
  const {
    weekPlan, moveMeal, removeMeal, replaceMeal,
    shoppingList, shoppingPantryItems, shoppingListLoading,
    shoppingListUpdated, nutritionUpdated,
    dismissShoppingListUpdated, dismissNutritionUpdated,
    addPantryItemToShoppingList,
  } = useMealPlan();
  const { settings } = useSettings();
  const {
    loading,
    generationError,
    partialPlan,
    isStreaming,
    handleGenerate,
    retryGeneration,
    handleAddToLibrary,
    clearWeekPlan,
  } = useMealPlanGeneration();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);

  const suggestedRecipes = useMemo(() => weekPlan?.suggestedRecipes || {}, [weekPlan?.suggestedRecipes]);

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
            <button
              type="button"
              aria-label="Clear meal plan"
              title="Clear Plan"
              onClick={clearWeekPlan}
              className="p-1.5 hover:bg-surface rounded-lg transition-colors text-muted hover:text-red-600"
            >
              <Trash2 className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Shopping list"
            title="Shopping List"
            onClick={() => {
              if (weekPlan || shoppingListLoading) {
                setShoppingListOpen(true);
                dismissShoppingListUpdated();
              }
            }}
            disabled={!weekPlan && !shoppingListLoading}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm shrink-0 transition-all ${weekPlan
              ? 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary-dark hover:to-emerald-700 shadow-md hover:shadow-lg'
              : 'bg-surface border border-border text-muted cursor-not-allowed opacity-60'
              }`}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-semibold hidden sm:inline">Shopping List</span>
            {shoppingListUpdated && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary border-2 border-white animate-pulse" />
            )}
          </button>
          {weekPlan && (
            <button
              type="button"
              aria-label="View nutrition summary"
              title="Nutrition Summary"
              onClick={() => {
                setNutritionOpen(true);
                dismissNutritionUpdated();
              }}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-dark shadow-sm shrink-0 transition-colors"
            >
              <PieChartIcon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Nutrition</span>
              {nutritionUpdated && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary border-2 border-white animate-pulse" />
              )}
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
                onClick={retryGeneration}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-medium text-sm hover:from-primary-dark hover:to-emerald-700 shadow-sm hover:shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        ) : weekPlan ? (
          <WeekView
            weekPlan={weekPlan}
            onMoveMeal={moveMeal}
            onRemoveMeal={removeMeal}
            onReplaceMeal={replaceMeal}
            suggestedRecipes={suggestedRecipes}
            onAddToLibrary={handleAddToLibrary}
          />
        ) : (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-emerald-600" />
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
            shoppingList={shoppingList}
            shoppingPantryItems={shoppingPantryItems}
            shoppingListLoading={shoppingListLoading}
            onAddPantryItem={addPantryItemToShoppingList}
          />
        </>
      )}
    </div>
  );
}
