'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useSettings } from '@/contexts/SettingsContext';
import { Settings2, Sparkles, X, Plus, ChefHat, Leaf, Flame, Zap, UtensilsCrossed, Check } from 'lucide-react';
import { UserPreferences } from '@/types';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

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

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian',
  'American', 'Japanese', 'Thai', 'Middle Eastern', 'French',
];

const DIET_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'low-carb', label: 'Low-Carb' },
  { value: 'flexitarian', label: 'Flexitarian' },
  { value: 'gluten-free', label: 'Gluten-Free' },
] as const;

const ALLERGY_OPTIONS = [
  'nuts', 'peanuts', 'dairy', 'gluten', 'soy', 'shellfish',
  'fish', 'eggs', 'sesame', 'corn', 'nightshades', 'red-meat',
];

interface MealPlanControlsProps {
  onGenerate: (preferences: string, systemPrompt?: string) => Promise<void>;
  hasExistingPlan: boolean;
  loading: boolean;
  defaultSystemPrompt: string;
  onboardingCompleted: boolean;
}

export function MealPlanControls({ onGenerate, hasExistingPlan, loading, onboardingCompleted }: MealPlanControlsProps) {
  const { settings, updateSettings } = useSettings();
  const [customizations, setCustomizations] = useState<AdHocCustomizations>(EMPTY_CUSTOMIZATIONS);
  const [showCustomize, setShowCustomize] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<'diet' | 'allergies' | null>(null);
  const [localPrefs, setLocalPrefs] = useState<Pick<UserPreferences, 'dietaryType' | 'allergies'>>({
    dietaryType: settings.preferences.dietaryType,
    allergies: settings.preferences.allergies,
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (onboardingCompleted || settings.preferences.onboardingDismissed) {
      setCurrentQuestion(null);
      return;
    }

    if (!settings.preferences.dietaryType) {
      setCurrentQuestion('diet');
    } else if (settings.preferences.dietaryType && settings.preferences.allergies.length === 0) {
      setCurrentQuestion('allergies');
    } else {
      setCurrentQuestion(null);
    }
  }, [onboardingCompleted, settings.preferences]);

  useEffect(() => {
    setLocalPrefs({
      dietaryType: settings.preferences.dietaryType,
      allergies: settings.preferences.allergies,
    });
  }, [settings.preferences.dietaryType, settings.preferences.allergies]);

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

  const toggleAllergy = (allergy: string) => {
    const updated = {
      ...localPrefs,
      allergies: localPrefs.allergies.includes(allergy)
        ? localPrefs.allergies.filter(a => a !== allergy)
        : [...localPrefs.allergies, allergy],
    };
    setLocalPrefs(updated);
    updateSettings({
      preferences: {
        ...settings.preferences,
        ...updated,
      },
    });
  };

  const handleDietChange = (dietType: UserPreferences['dietaryType']) => {
    const updated = {
      ...localPrefs,
      dietaryType: dietType,
    };
    setLocalPrefs(updated);
    updateSettings({
      preferences: {
        ...settings.preferences,
        ...updated,
      },
    });
  };

  const handleDismissQuestion = () => {
    if (currentQuestion === 'diet') {
      setCurrentQuestion('allergies');
    } else {
      setCurrentQuestion(null);
      updateSettings({
        preferences: {
          ...settings.preferences,
          onboardingDismissed: true,
        },
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowCustomize(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted hover:text-primary transition-all duration-200"
          >
            <Settings2 className="w-5 h-5" />
            <span className="font-medium">Customize</span>
            {hasCustomizations && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="flex-1 gap-2"
          >
            {loading ? (
              <><LoadingSpinner size="sm" /> <span>Generating...</span></>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {hasExistingPlan ? 'Regenerate' : 'Generate'}
              </>
            )}
          </Button>
        </div>

      </div>

      {/* Customize Modal */}
      <Modal isOpen={showCustomize} onClose={() => setShowCustomize(false)}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Customize This Week</h2>
              <p className="text-sm text-muted mt-1">Tailor your meal plan for the coming week</p>
            </div>
            <button onClick={() => setShowCustomize(false)} className="text-muted hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progressive Dietary Preferences (one question at a time) */}
          {!onboardingCompleted && currentQuestion && (
            <div className="bg-gradient-to-r from-primary/5 to-emerald-50 border border-primary/20 rounded-xl overflow-hidden">
              <div className="p-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2 flex-1">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        {currentQuestion === 'diet' ? 'What\'s your dietary preference?' : 'Any allergies or restrictions?'}
                      </h3>
                      
                      {currentQuestion === 'diet' && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {DIET_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => handleDietChange(localPrefs.dietaryType === opt.value ? null : opt.value)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                                localPrefs.dietaryType === opt.value
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-foreground border-border hover:border-primary/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {currentQuestion === 'allergies' && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ALLERGY_OPTIONS.map(allergy => (
                            <button
                              key={allergy}
                              onClick={() => toggleAllergy(allergy)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border capitalize ${
                                localPrefs.allergies.includes(allergy)
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-white text-foreground border-border hover:border-accent/50'
                              }`}
                            >
                              {allergy}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs mt-3">
                        <button
                          onClick={() => setShowOnboarding(true)}
                          className="text-primary hover:text-primary-dark underline font-medium"
                        >
                          Start full onboarding
                        </button>
                        <span className="text-muted">or continue answering questions</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 ml-2">
                    {currentQuestion === 'allergies' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismissQuestion}
                        className="text-xs"
                      >
                        Skip
                      </Button>
                    )}
                    <button
                      onClick={handleDismissQuestion}
                      className="text-muted hover:text-foreground p-1"
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Button - Always show if onboarding not completed */}
          {!onboardingCompleted && !currentQuestion && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 border border-primary/30 hover:bg-primary/10"
              >
                Preferences
              </Button>
            </div>
          )}

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
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      selected
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
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selected
                        ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                        : 'bg-white text-foreground border-border hover:border-teal-300 hover:bg-teal-50'
                    }`}
                  >
                    {cuisine}
                  </button>
                );
              })}
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

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setCustomizations(EMPTY_CUSTOMIZATIONS);
                setIngredientInput('');
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

      <OnboardingWizard 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
        onCompleted={() => {
          setShowOnboarding(false);
          setCurrentQuestion(null);
        }}
      />
    </>
  );
}
