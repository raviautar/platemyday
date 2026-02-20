'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Settings2, Sparkles, X, Plus, ChefHat, Leaf, Flame, Zap, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { CUISINE_OPTIONS } from '@/lib/constants';
import { useBilling } from '@/contexts/BillingContext';
import { searchIngredients } from '@/lib/ingredients';

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
  const router = useRouter();
  const { unlimited, creditsRemaining, loading: billingLoading } = useBilling();
  const [customizations, setCustomizations] = useState<AdHocCustomizations>(EMPTY_CUSTOMIZATIONS);
  const [showCustomize, setShowCustomize] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [cuisineInput, setCuisineInput] = useState('');
  const [ingredientSuggestions, setIngredientSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const ingredientInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (ingredientInput.trim()) {
      const suggestions = searchIngredients(ingredientInput, 8);
      setIngredientSuggestions(suggestions);
      setSelectedSuggestionIndex(-1);
    } else {
      setIngredientSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  }, [ingredientInput]);

  const addIngredient = (ingredient?: string) => {
    const trimmed = (ingredient || ingredientInput).trim();
    if (trimmed && !customizations.pantryIngredients.includes(trimmed)) {
      setCustomizations(prev => ({
        ...prev,
        pantryIngredients: [...prev.pantryIngredients, trimmed],
      }));
      setIngredientInput('');
      setIngredientSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (ingredientSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addIngredient();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < ingredientSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < ingredientSuggestions.length) {
        addIngredient(ingredientSuggestions[selectedSuggestionIndex]);
      } else {
        addIngredient();
      }
    } else if (e.key === 'Escape') {
      setIngredientSuggestions([]);
      setSelectedSuggestionIndex(-1);
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
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 pb-2 border-b border-border/40">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Customize This Week</h2>
              <p className="text-xs text-muted mt-0.5">Tailor your meal plan for the coming week</p>
            </div>
            <button onClick={() => setShowCustomize(false)} className="text-muted hover:text-foreground p-1.5 hover:bg-surface/50 rounded-lg transition-colors -mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCustomize(false);
              router.push('/customize');
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface/50 hover:bg-surface border border-border/50 text-left transition-colors group"
          >
            <span className="text-xs font-medium text-foreground">Modify general preferences</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0 group-hover:text-primary transition-colors" />
          </button>

          <div className="space-y-4">
            {/* Pantry Ingredients */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Pantry ingredients</label>
                <p className="text-xs text-muted/80 mt-0.5">Add ingredients to use up this week</p>
              </div>
              <div className="relative">
                <div className="flex gap-1.5">
                  <input
                    ref={ingredientInputRef}
                    type="text"
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={handleIngredientKeyDown}
                    onBlur={() => {
                      setTimeout(() => {
                        setIngredientSuggestions([]);
                        setSelectedSuggestionIndex(-1);
                      }, 200);
                    }}
                    placeholder="e.g., chicken, rice, broccoli..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border/60 bg-white text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary text-sm"
                  />
                  <button
                    onClick={() => addIngredient()}
                    className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {ingredientSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-border/60 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {ingredientSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addIngredient(suggestion)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          index === selectedSuggestionIndex
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-surface/50'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {customizations.pantryIngredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {customizations.pantryIngredients.map(ing => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/8 text-primary text-xs border border-primary/20"
                    >
                      {ing}
                      <button onClick={() => removeIngredient(ing)} className="hover:text-primary-dark">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meal Types */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Meal types</label>
              <div className="flex flex-wrap gap-1.5">
                {MEAL_TYPE_OPTIONS.map(({ label, icon: Icon }) => {
                  const selected = customizations.mealTypes.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleMealType(label)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${selected
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface/60 text-foreground hover:bg-surface border border-border/50'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Cuisines</label>
              <div className="flex flex-wrap gap-1.5">
                {CUISINE_OPTIONS.map(cuisine => {
                  const selected = customizations.cuisines.includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${selected
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface/60 text-foreground hover:bg-surface border border-border/50'
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/8 text-primary text-xs border border-primary/20 font-medium"
                    >
                      {cuisine}
                      <button
                        type="button"
                        onClick={() => removeCuisine(cuisine)}
                        className="hover:text-primary-dark"
                        aria-label={`Remove ${cuisine}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={cuisineInput}
                  onChange={e => setCuisineInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCuisine())}
                  placeholder="Add custom cuisine..."
                  className="min-w-0 flex-1 px-3 py-1.5 rounded-lg border border-border/60 bg-white text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary text-sm"
                />
                <button
                  type="button"
                  onClick={addCuisine}
                  className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Freeform Notes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Additional notes</label>
              <textarea
                value={customizations.freeformNotes}
                onChange={e => setCustomizations(prev => ({ ...prev, freeformNotes: e.target.value }))}
                placeholder="e.g., No red meat this week, extra protein, kid-friendly meals..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-white text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary resize-y min-h-[80px] text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              className="flex-1 text-sm"
              onClick={() => {
                setCustomizations(EMPTY_CUSTOMIZATIONS);
                setIngredientInput('');
                setCuisineInput('');
              }}
            >
              Clear All
            </Button>
            <Button
              className="flex-1 text-sm"
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
