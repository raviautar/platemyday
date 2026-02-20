'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Settings2, Sparkles, X, Plus, ChefHat, Leaf, Flame, Zap, UtensilsCrossed, ChevronDown, ChevronRight } from 'lucide-react';
import { CUISINE_OPTIONS } from '@/lib/constants';
import { PreferencesSection } from '@/components/settings/PreferencesSection';
import { useBilling } from '@/contexts/BillingContext';

export interface AdHocCustomizations {
  pantryIngredients: string[];
  mealTypes: string[];
  cuisines: string[];
  freeformNotes: string;
}

const EMPTY_CUSTOMIZATIONS: AdHocCustomizations = {
  pantryIngredients: [],
  mealTypes: [],
  cuisines: [],
  freeformNotes: '',
};

const MEAL_TYPE_OPTIONS = [
  { label: 'Quick & Easy', icon: Zap },
  { label: 'Comfort Food', icon: Flame },
  { label: 'Light & Healthy', icon: Leaf },
  { label: 'One-Pot Meals', icon: ChefHat },
  { label: 'Meal Prep Friendly', icon: UtensilsCrossed },
];

interface MealPlanControlsProps {
  onGenerate: (preferences: string, systemPrompt?: string) => Promise<void>;
  hasExistingPlan: boolean;
  loading: boolean;
  defaultSystemPrompt: string;
  onboardingCompleted?: boolean;
}

export function MealPlanControls({ onGenerate, hasExistingPlan, loading }: MealPlanControlsProps) {
  const { unlimited, creditsRemaining, loading: billingLoading } = useBilling();
  const [customizations, setCustomizations] = useState<AdHocCustomizations>(EMPTY_CUSTOMIZATIONS);
  const [showCustomize, setShowCustomize] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [cuisineInput, setCuisineInput] = useState('');
  const [savedPrefsOpen, setSavedPrefsOpen] = useState(false);

  const hasCustomizations =
    customizations.pantryIngredients.length > 0 ||
    customizations.mealTypes.length > 0 ||
    customizations.cuisines.length > 0 ||
    customizations.freeformNotes.trim().length > 0;

  const buildPreferencesString = useCallback(() => {
    const parts: string[] = [];
    if (customizations.pantryIngredients.length > 0) {
      parts.push(`I have these ingredients available: ${customizations.pantryIngredients.join(', ')}`);
    }
    if (customizations.mealTypes.length > 0) {
      parts.push(`I'd like these types of meals: ${customizations.mealTypes.join(', ')}`);
    }
    if (customizations.cuisines.length > 0) {
      parts.push(`Preferred cuisines: ${customizations.cuisines.join(', ')}`);
    }
    if (customizations.freeformNotes.trim()) {
      parts.push(customizations.freeformNotes.trim());
    }
    return parts.join('. ');
  }, [customizations]);

  const handleGenerate = () => {
    onGenerate(buildPreferencesString(), undefined);
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !customizations.pantryIngredients.includes(trimmed)) {
      setCustomizations(prev => ({
        ...prev,
        pantryIngredients: [...prev.pantryIngredients, trimmed],
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setCustomizations(prev => ({
      ...prev,
      pantryIngredients: prev.pantryIngredients.filter(i => i !== ingredient),
    }));
  };

  const toggleMealType = (type: string) => {
    setCustomizations(prev => ({
      ...prev,
      mealTypes: prev.mealTypes.includes(type)
        ? prev.mealTypes.filter(t => t !== type)
        : [...prev.mealTypes, type],
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setCustomizations(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const addCuisine = () => {
    const trimmed = cuisineInput.trim();
    if (trimmed && !customizations.cuisines.includes(trimmed)) {
      setCustomizations(prev => ({
        ...prev,
        cuisines: [...prev.cuisines, trimmed],
      }));
      setCuisineInput('');
    }
  };

  const removeCuisine = (cuisine: string) => {
    setCustomizations(prev => ({
      ...prev,
      cuisines: prev.cuisines.filter(c => c !== cuisine),
    }));
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-border p-3 sm:p-4">
        <div className="flex gap-1.5 sm:gap-2 md:gap-3">
          <button
            onClick={() => setShowCustomize(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted hover:text-primary transition-all duration-200 relative"
            aria-label="Customize meal plan"
          >
            <Settings2 className="w-5 h-5 shrink-0" />
            <span className="font-medium hidden sm:inline">Customize</span>
            {hasCustomizations && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          <Button
            onClick={handleGenerate}
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
                <span className="whitespace-nowrap">{hasExistingPlan ? 'Regenerate' : 'Generate'}</span>
              </>
            )}
          </Button>
        </div>

        {!billingLoading && !unlimited && (
          <p className={`text-xs mt-2 text-center ${(creditsRemaining ?? 0) <= 2 ? 'text-accent font-medium' : 'text-muted'
            }`}>
            {(creditsRemaining ?? 0) === 0
              ? 'No free generations remaining'
              : `${creditsRemaining} free generation${creditsRemaining === 1 ? '' : 's'} remaining`}
          </p>
        )}

      </div>

      {/* Customize Modal */}
      <Modal isOpen={showCustomize} onClose={() => setShowCustomize(false)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Customize This Week</h2>
              <p className="text-sm text-muted mt-1">Tailor your meal plan for the coming week</p>
            </div>
            <button onClick={() => setShowCustomize(false)} className="text-muted hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSavedPrefsOpen(o => !o)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-surface hover:bg-surface/80 text-left transition-colors"
            >
              <span className="font-semibold text-foreground">Saved preferences</span>
              {savedPrefsOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
            </button>
            {savedPrefsOpen && (
              <div className="border-t border-border p-4 bg-white max-h-[60vh] overflow-y-auto">
                <PreferencesSection />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight mb-4">Options for this week&apos;s plan</h3>
            <div className="space-y-6">
              {/* Pantry Ingredients */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  What&apos;s in your pantry?
                </label>
                <p className="text-xs text-muted mb-2">Add ingredients you&apos;d like to use up this week</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                    placeholder="e.g., chicken, rice, broccoli..."
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <button
                    onClick={addIngredient}
                    className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {customizations.pantryIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customizations.pantryIngredients.map(ing => (
                      <span
                        key={ing}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm border border-emerald-200"
                      >
                        {ing}
                        <button onClick={() => removeIngredient(ing)} className="hover:text-emerald-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Meal Types */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  What kind of meals?
                </label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPE_OPTIONS.map(({ label, icon: Icon }) => {
                    const selected = customizations.mealTypes.includes(label);
                    return (
                      <button
                        key={label}
                        onClick={() => toggleMealType(label)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${selected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Preferred cuisines
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map(cuisine => {
                    const selected = customizations.cuisines.includes(cuisine);
                    return (
                      <button
                        key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${selected
                            ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                            : 'bg-white text-foreground border-border hover:border-teal-300 hover:bg-teal-50'
                          }`}
                      >
                        {cuisine}
                      </button>
                    );
                  })}
                  {customizations.cuisines
                    .filter(c => !(CUISINE_OPTIONS as readonly string[]).includes(c))
                    .map(cuisine => (
                      <span
                        key={cuisine}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm border border-teal-200 font-medium"
                      >
                        {cuisine}
                        <button
                          type="button"
                          onClick={() => removeCuisine(cuisine)}
                          className="hover:text-teal-900"
                          aria-label={`Remove ${cuisine}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
                <div className="flex gap-2 min-w-0 mt-2">
                  <input
                    type="text"
                    value={cuisineInput}
                    onChange={e => setCuisineInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCuisine())}
                    placeholder="Add custom cuisine..."
                    className="min-w-0 flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCuisine}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Freeform Notes */}
              <Textarea
                label="Anything else?"
                value={customizations.freeformNotes}
                onChange={e => setCustomizations(prev => ({ ...prev, freeformNotes: e.target.value }))}
                placeholder="e.g., No red meat this week, extra protein, kid-friendly meals, birthday dinner on Friday..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setCustomizations(EMPTY_CUSTOMIZATIONS);
                setIngredientInput('');
                setCuisineInput('');
              }}
            >
              Clear All
            </Button>
            <Button
              className="flex-1"
              onClick={() => setShowCustomize(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
