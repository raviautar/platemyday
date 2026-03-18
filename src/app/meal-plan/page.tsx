'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { WeekView } from '@/components/meal-plan/WeekView';
import { MealPlanControls } from '@/components/meal-plan/MealPlanControls';
import { MealPlanHistory } from '@/components/meal-plan/MealPlanHistory';
import { ShoppingList } from '@/components/meal-plan/ShoppingList';
import { NutritionSummary } from '@/components/meal-plan/NutritionSummary';
import { GeneratingAnimation, ACTION_IMAGES } from '@/components/ui/GeneratingAnimation';
import { StreamingMealView } from '@/components/meal-plan/StreamingMealView';
import { WasteImpact } from '@/components/meal-plan/WasteImpact';
import { PieChartIcon } from '@/components/ui/PieChartIcon';
import { useMealPlanGeneration } from '@/hooks/useMealPlanGeneration';
import { useBilling } from '@/contexts/BillingContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import Link from 'next/link';
import { History, ShoppingCart, AlertTriangle, RefreshCw, Trash2, Crown } from 'lucide-react';

export default function MealPlanPage() {
  const { recipes } = useRecipes();
  const {
    weekPlan, moveMeal, removeMeal, replaceMeal,
    shoppingList, shoppingPantryItems, shoppingListLoading,
    shoppingListUpdated, nutritionUpdated,
    dismissShoppingListUpdated, dismissNutritionUpdated,
    addPantryItemToShoppingList,
  } = useMealPlan();
  const {
    loading,
    generationError,
    isPaywalled,
    partialPlan,
    isStreaming,
    handleGenerate,
    retryGeneration,
    handleAddToLibrary,
    clearWeekPlan,
  } = useMealPlanGeneration();
  const { unlimited, creditsRemaining, loading: billingLoading } = useBilling();
  const { track } = useAnalytics();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);

  // Prefetch generating animation images
  useEffect(() => {
    ACTION_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

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
            title={!weekPlan && !shoppingListLoading ? 'Generate a meal plan first' : 'Shopping List'}
            onClick={() => {
              if (weekPlan || shoppingListLoading) {
                setShoppingListOpen(true);
                dismissShoppingListUpdated();
              }
            }}
            disabled={!weekPlan && !shoppingListLoading}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm shrink-0 transition-all ${weekPlan
              ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-[#1F4D28] shadow-md hover:shadow-lg'
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
        onGenerate={(recipeMix) => handleGenerate(recipeMix)}
        hasExistingPlan={!!weekPlan}
        loading={loading}
      />

      {weekPlan && !loading && (
        <WasteImpact weekPlan={weekPlan} suggestedRecipes={suggestedRecipes} />
      )}

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
        ) : isPaywalled ? (
          <div className="bg-white rounded-xl border border-amber-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                <Crown className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">You&apos;ve used all your generations</h3>
              <p className="text-sm text-muted mb-6">
                Get more credits to keep generating meal plans.
              </p>
              <Link
                href="/upgrade"
                onClick={() => track(EVENTS.UPGRADE_CTA_CLICKED, { source: 'paywall' })}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-600 shadow-sm hover:shadow-md transition-all"
              >
                <Crown className="w-4 h-4" />
                Upgrade Now
              </Link>
            </div>
          </div>
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium text-sm hover:from-primary-dark hover:to-[#1F4D28] shadow-sm hover:shadow-md transition-all"
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
          <div className="relative bg-gradient-to-b from-surface/50 to-transparent rounded-2xl border border-border/40 p-6 sm:p-8 md:p-10">
            {/* Mascot illustration */}
            <div className="flex justify-center mb-6">
              <img
                src="/assets/actions/salad.png"
                alt=""
                className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-xl opacity-90"
              />
            </div>

            {/* Heading */}
            <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2 font-[family-name:var(--font-outfit)]">
              What&apos;s in your kitchen?
            </h2>
            <p className="text-sm text-muted text-center max-w-md mx-auto mb-8 leading-relaxed">
              Add ingredients above and hit generate. We&apos;ll build a full week of meals using what you already have — so nothing goes to waste.
            </p>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="flex sm:flex-col items-center gap-3 sm:gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div className="sm:text-center">
                  <p className="text-sm font-semibold text-foreground">Add pantry items</p>
                  <p className="text-xs text-muted mt-0.5">What do you need to use up?</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center gap-3 sm:gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-accent-dark">2</span>
                </div>
                <div className="sm:text-center">
                  <p className="text-sm font-semibold text-foreground">Generate your plan</p>
                  <p className="text-xs text-muted mt-0.5">Meals built around your ingredients</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center gap-3 sm:gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-secondary-dark">3</span>
                </div>
                <div className="sm:text-center">
                  <p className="text-sm font-semibold text-foreground">Cook & save</p>
                  <p className="text-xs text-muted mt-0.5">Less waste, smaller grocery bills</p>
                </div>
              </div>
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
