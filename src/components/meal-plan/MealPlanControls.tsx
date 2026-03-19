'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { PreferencesEditor } from '@/components/settings/PreferencesEditor';
import { PantryBar } from '@/components/meal-plan/PantryBar';
import { Settings2, Sparkles, X, BookOpen, CalendarDays, ChevronDown } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useRecipes } from '@/contexts/RecipeContext';
import { DEFAULT_USER_PREFERENCES } from '@/lib/constants';

export type RecipeMix = 'all_new' | 'mostly_new' | 'balanced' | 'mostly_existing' | 'all_existing';

const RECIPE_MIX_OPTIONS: { value: RecipeMix; label: string; description: string }[] = [
  { value: 'all_new', label: 'All new', description: 'Discover entirely new dishes' },
  { value: 'mostly_new', label: 'Mostly new', description: 'Mostly new, a few favorites' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of new and existing' },
  { value: 'mostly_existing', label: 'Mostly saved', description: 'Mostly from your library' },
  { value: 'all_existing', label: 'All saved', description: 'Only from your recipe library' },
];

const DAY_COUNT_OPTIONS = [1, 3, 5, 7, 10, 14] as const;

interface MealPlanControlsProps {
  onGenerate: (recipeMix: RecipeMix, numberOfDays: number) => Promise<void>;
  hasExistingPlan: boolean;
  loading: boolean;
}

export function MealPlanControls({ onGenerate, hasExistingPlan, loading }: MealPlanControlsProps) {
  const { unlimited, creditsRemaining, loading: billingLoading } = useBilling();
  const { settings } = useSettings();
  const { recipes } = useRecipes();
  const [showPreferences, setShowPreferences] = useState(false);
  const [recipeMix, setRecipeMix] = useState<RecipeMix>('balanced');
  const [showRecipeMix, setShowRecipeMix] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [showDayCount, setShowDayCount] = useState(false);

  const prefs = { ...DEFAULT_USER_PREFERENCES, ...settings.preferences };
  const hasCustomizations =
    (prefs.mealTypes?.length ?? 0) > 0 ||
    (prefs.mealNotes?.length ?? 0) > 0;

  const hasLibraryRecipes = recipes.length > 0;

  return (
    <>
      <div className="space-y-3">
        {/* Pantry Bar — hero section */}
        <PantryBar />

        {/* Recipe Mix + Generate */}
        <div className="bg-white rounded-xl border border-border p-3 sm:p-4 space-y-3">
          <div>
            <button
              type="button"
              onClick={() => hasLibraryRecipes && setShowRecipeMix(v => !v)}
              disabled={!hasLibraryRecipes}
              className={`flex items-center gap-1.5 text-xs transition-colors group ${hasLibraryRecipes ? 'text-muted hover:text-foreground' : 'text-muted/70 cursor-not-allowed'}`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>
                Recipe mix:{' '}
                <span className="text-foreground font-medium">
                  {RECIPE_MIX_OPTIONS.find(o => o.value === recipeMix)?.label}
                </span>
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${showRecipeMix ? 'rotate-180' : ''}`}
              />
            </button>

            {!hasLibraryRecipes ? (
              <p className="mt-2 text-xs text-muted">Add saved recipes to customize recipe mix.</p>
            ) : showRecipeMix ? (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {RECIPE_MIX_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setRecipeMix(option.value); setShowRecipeMix(false); }}
                      title={option.description}
                      className={`flex-1 px-1.5 sm:px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        recipeMix === option.value
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-surface/60 text-muted hover:bg-surface border border-transparent hover:text-foreground'
                      }`}
                    >
                      <span className="hidden sm:inline">{option.label}</span>
                      <span className="sm:hidden">{option.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted">
                  {RECIPE_MIX_OPTIONS.find(o => o.value === recipeMix)?.description}
                </p>
              </div>
            ) : null}
          </div>

          {/* Plan duration selector */}
          <div>
            <button
              type="button"
              onClick={() => setShowDayCount(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors group"
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>
                Plan duration:{' '}
                <span className="text-foreground font-medium">
                  {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}
                </span>
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${showDayCount ? 'rotate-180' : ''}`}
              />
            </button>

            {showDayCount && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {DAY_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      onClick={() => { setNumberOfDays(count); setShowDayCount(false); }}
                      className={`flex-1 px-1.5 sm:px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        numberOfDays === count
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-surface/60 text-muted hover:bg-surface border border-transparent hover:text-foreground'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="flex gap-1.5 sm:gap-2 md:gap-3">
            <button
              onClick={() => setShowPreferences(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted hover:text-primary transition-all duration-200 relative"
              aria-label="Meal plan preferences"
            >
              <Settings2 className="w-5 h-5 shrink-0" />
              <span className="font-medium hidden sm:inline">Preferences</span>
              {hasCustomizations && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            <Button
              onClick={() => onGenerate(recipeMix, numberOfDays)}
              disabled={loading}
              size="lg"
              className="flex-1 gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base min-w-0"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="shrink-0" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="whitespace-nowrap">
                    {hasExistingPlan ? 'Regenerate' : prefs.pantryIngredients.length > 0 ? 'Generate from pantry' : 'Generate'}
                  </span>
                </>
              )}
            </Button>
          </div>

          {!billingLoading && !unlimited && (
            <p className={`text-xs text-center ${(creditsRemaining ?? 0) <= 2 ? 'text-accent font-medium' : 'text-muted'}`}>
              {(creditsRemaining ?? 0) === 0
                ? 'No generations remaining'
                : `${creditsRemaining} generation${creditsRemaining === 1 ? '' : 's'} remaining`}
            </p>
          )}
        </div>
      </div>

      {/* Preferences Modal — no longer includes pantry */}
      <Modal isOpen={showPreferences} onClose={() => setShowPreferences(false)}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 pb-2 border-b border-border/40">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
              <p className="text-xs text-muted mt-0.5">Customize your meal plan preferences</p>
            </div>
            <button onClick={() => setShowPreferences(false)} className="text-muted hover:text-foreground p-1.5 hover:bg-surface/50 rounded-lg transition-colors -mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <PreferencesEditor defaultExpanded={['notes']} compact />

          <div className="pt-2 border-t border-border/40">
            <Button
              className="w-full text-sm"
              onClick={() => setShowPreferences(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
