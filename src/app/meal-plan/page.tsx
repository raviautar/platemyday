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
import { useBilling } from '@/contexts/BillingContext';
import Link from 'next/link';
import { History, ShoppingCart, AlertTriangle, RefreshCw, Trash2, Crown, Settings2, Sparkles } from 'lucide-react';

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
    isPaywalled,
    partialPlan,
    isStreaming,
    handleGenerate,
    retryGeneration,
    handleAddToLibrary,
    clearWeekPlan,
  } = useMealPlanGeneration();
  const { unlimited, creditsRemaining, loading: billingLoading } = useBilling();

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
            data-tour="meal-plan-history"
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
            data-tour="meal-plan-shopping"
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
        ) : isPaywalled ? (
          <div className="bg-white rounded-xl border border-amber-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                <Crown className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">You&apos;ve used all your free generations</h3>
              <p className="text-sm text-muted mb-6">
                Upgrade to a paid plan for unlimited meal plan generations, or come back later.
              </p>
              <Link
                href="/upgrade"
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
          <div className="-mt-2">
            <div className="flex justify-between items-end">
              {/* Left doodle — curves left then up toward Customize */}
              <div className="flex flex-col-reverse items-center gap-2 sm:gap-3 w-36 sm:w-44 md:w-52">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400">
                    <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-base sm:text-lg md:text-xl font-semibold font-[family-name:var(--font-outfit)]">
                      Customize first
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400/80 mt-1 font-[family-name:var(--font-outfit)]">
                    Set your diet, cuisines, and ingredients you want to use up
                  </p>
                </div>
                <svg viewBox="0 0 80 200" className="w-12 sm:w-14 md:w-16 h-auto" fill="none">
                  <path
                    d="M50 195 C48 175, 55 155, 58 140 C62 120, 55 105, 40 95 C25 85, 15 75, 12 60 C9 45, 15 30, 22 20 C28 12, 30 6, 30 2"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="5 4"
                  />
                  <path d="M25 6 L30 0 L35 7" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Right doodle — curves right then up toward Generate */}
              <div className="flex flex-col-reverse items-center gap-2 sm:gap-3 w-36 sm:w-44 md:w-52">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-base sm:text-lg md:text-xl font-semibold font-[family-name:var(--font-outfit)]">
                      Then generate!
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400/80 mt-1 font-[family-name:var(--font-outfit)]">
                    Get personalized meal plans for the next week!
                  </p>
                </div>
                <svg viewBox="0 0 80 200" className="w-12 sm:w-14 md:w-16 h-auto" fill="none">
                  <path
                    d="M30 195 C32 175, 25 155, 22 140 C18 120, 25 105, 40 95 C55 85, 65 75, 68 60 C71 45, 65 30, 58 20 C52 12, 50 6, 50 2"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="5 4"
                  />
                  <path d="M45 6 L50 0 L55 7" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
