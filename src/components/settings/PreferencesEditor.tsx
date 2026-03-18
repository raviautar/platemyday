'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { UserPreferences } from '@/types';
import { DIET_OPTIONS, ALLERGY_OPTIONS, CUISINE_OPTIONS, MEAL_TYPE_LABELS, DEFAULT_USER_PREFERENCES, MACRO_PRESET_GRAMS } from '@/lib/constants';
import { DIET_ICON_MAP } from '@/lib/diet-icons';
import { FaFire } from 'react-icons/fa';
import { GiMeat, GiBread, GiWheat } from 'react-icons/gi';
import { Plus, X, ChevronDown, Zap, Flame, Leaf, ChefHat, UtensilsCrossed, Check } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';

const MEAL_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Quick & Easy': Zap,
  'Comfort Food': Flame,
  'Light & Healthy': Leaf,
  'One-Pot Meals': ChefHat,
  'Meal Prep Friendly': UtensilsCrossed,
};

interface PreferencesEditorProps {
  defaultExpanded?: string[];
  compact?: boolean;
}

function CollapsibleSection({
  id,
  title,
  description,
  defaultOpen,
  compact,
  onClear,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  defaultOpen: boolean;
  compact?: boolean;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border transition-colors bg-white border-border ${compact ? 'p-3' : 'p-4'}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
        className="w-full flex items-center justify-between gap-2 cursor-pointer"
      >
        <div className="text-left">
          <h2 className={`font-semibold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
            {title}
          </h2>
          {description && !compact && (
            <p className="text-xs text-muted mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onClear && isOpen && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-1 rounded-md text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label={`Clear ${title}`}
              title="Clear all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {isOpen && (
        <div className={`space-y-3 ${compact ? 'mt-2' : 'mt-3'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function PreferencesEditor({ defaultExpanded = ['pantry', 'notes'], compact = false }: PreferencesEditorProps) {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const { track } = useAnalytics();
  const rawPrefs = settings.preferences;
  const prefs: UserPreferences = { ...DEFAULT_USER_PREFERENCES, ...rawPrefs };

  const [macroMode, setMacroMode] = useState<Record<'protein' | 'carbs' | 'fiber' | 'calories', 'preset' | 'custom'>>({
    protein: typeof prefs.macroGoals.protein === 'number' ? 'custom' : 'preset',
    carbs: typeof prefs.macroGoals.carbs === 'number' ? 'custom' : 'preset',
    fiber: typeof prefs.macroGoals.fiber === 'number' ? 'custom' : 'preset',
    calories: typeof prefs.macroGoals.calories === 'number' ? 'custom' : 'preset',
  });

  const [customDietInput, setCustomDietInput] = useState(() => {
    const isCustom = prefs.dietaryType && !DIET_OPTIONS.some(o => o.value === prefs.dietaryType);
    return isCustom ? (prefs.dietaryType ?? '') : '';
  });
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [customCuisineInput, setCustomCuisineInput] = useState('');
  const [focusedNoteIndex, setFocusedNoteIndex] = useState<number | null>(null);

  useEffect(() => {
    setMacroMode({
      protein: typeof prefs.macroGoals.protein === 'number' ? 'custom' : 'preset',
      carbs: typeof prefs.macroGoals.carbs === 'number' ? 'custom' : 'preset',
      fiber: typeof prefs.macroGoals.fiber === 'number' ? 'custom' : 'preset',
      calories: typeof prefs.macroGoals.calories === 'number' ? 'custom' : 'preset',
    });
  }, [prefs.macroGoals]);

  const isCustomDiet = prefs.dietaryType && !DIET_OPTIONS.some(o => o.value === prefs.dietaryType);

  useEffect(() => {
    if (isCustomDiet) {
      setCustomDietInput(prefs.dietaryType ?? '');
    } else {
      setCustomDietInput('');
    }
  }, [prefs.dietaryType, isCustomDiet]);

  const handleUpdate = (updates: Partial<UserPreferences>, showNotification = true) => {
    updateSettings({
      preferences: {
        ...prefs,
        ...updates,
      },
    });
    if (showNotification && !compact) {
      showToast('Preferences updated');
      track(EVENTS.PREFERENCES_COMPLETED, { changed_fields: Object.keys(updates) });
    }
  };

  const submitCustomDiet = () => {
    const value = customDietInput.trim();
    if (value) {
      handleUpdate({ dietaryType: value });
    }
  };

  const handleServingsChange = (value: number) => {
    updateSettings({
      preferences: {
        ...prefs,
        servings: value,
      },
    });
  };

  const handleServingsEnd = () => {
    if (!compact) showToast('Preferences updated');
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergyInput.trim().toLowerCase();
    if (trimmed && !prefs.allergies.includes(trimmed)) {
      handleUpdate({ allergies: [...prefs.allergies, trimmed] });
      setCustomAllergyInput('');
    }
  };

  const addCustomCuisine = () => {
    const trimmed = customCuisineInput.trim();
    if (trimmed && !(prefs.cuisinePreferences || []).includes(trimmed)) {
      handleUpdate({ cuisinePreferences: [...(prefs.cuisinePreferences || []), trimmed] });
      setCustomCuisineInput('');
    }
  };

  // Meal type helpers
  const toggleMealType = (type: string) => {
    const current = prefs.mealTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    handleUpdate({ mealTypes: updated });
  };

  const isExpanded = (key: string) => defaultExpanded.includes(key);

  return (
    <div className={`space-y-3 ${compact ? 'max-h-[60vh] overflow-y-auto pr-1' : ''}`}>
      {/* Additional Meal Preferences */}
      <CollapsibleSection
        id="notes"
        title="Additional Preferences"
        description="Anything else you'd like to add?"
        defaultOpen={isExpanded('notes')}
        compact={compact}
        onClear={(prefs.mealNotes || []).length > 0 ? () => handleUpdate({ mealNotes: [] }) : undefined}
      >
        <div className="space-y-2">
          {(prefs.mealNotes || []).map((note, index) => {
            const isFocused = focusedNoteIndex === index;
            const saveNote = () => {
              const updated = (prefs.mealNotes || []).filter(n => n.trim() !== '');
              if (updated.length !== (prefs.mealNotes || []).length) {
                handleUpdate({ mealNotes: updated });
              } else if (!compact) {
                showToast('Preferences updated');
              }
            };
            const handleBlur = () => {
              setFocusedNoteIndex(null);
              saveNote();
            };
            return (
              <div key={index} className="flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => {
                    const updated = [...(prefs.mealNotes || [])];
                    updated[index] = e.target.value;
                    handleUpdate({ mealNotes: updated }, false);
                  }}
                  onFocus={() => setFocusedNoteIndex(index)}
                  onBlur={handleBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="e.g., No cilantro in my dishes"
                  className="min-w-0 flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                {isFocused ? (
                  <button
                    type="button"
                    onClick={() => (document.activeElement as HTMLElement | null)?.blur()}
                    className="p-1.5 text-primary hover:text-primary/80 transition-colors"
                    aria-label="Save"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (prefs.mealNotes || []).filter((_, i) => i !== index);
                      handleUpdate({ mealNotes: updated });
                    }}
                    className="p-1.5 text-muted hover:text-foreground transition-colors"
                    aria-label="Remove note"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={() => handleUpdate({ mealNotes: [...(prefs.mealNotes || []), ''] })}
            className="w-full px-3 py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add preference
          </button>
        </div>
      </CollapsibleSection>

      {/* Meal Types */}
      <CollapsibleSection
        id="mealTypes"
        title="Meal Types"
        description="What types of meals do you prefer?"
        defaultOpen={isExpanded('mealTypes')}
        compact={compact}
        onClear={prefs.mealTypes.length > 0 ? () => handleUpdate({ mealTypes: [] }) : undefined}
      >
        <div className="flex flex-wrap gap-1.5">
          {MEAL_TYPE_LABELS.map(label => {
            const Icon = MEAL_TYPE_ICONS[label];
            const selected = prefs.mealTypes.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleMealType(label)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  selected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface/60 text-foreground hover:bg-surface border border-border/50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Dietary Type */}
      <CollapsibleSection
        id="dietary"
        title="Dietary Preference"
        description="Select your dietary preference"
        defaultOpen={isExpanded('dietary')}
        compact={compact}
        onClear={prefs.dietaryType ? () => handleUpdate({ dietaryType: null }) : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map(option => {
            const Icon = DIET_ICON_MAP[option.value];
            const isSelected = prefs.dietaryType === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleUpdate({ dietaryType: option.value })}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted'}`} />}
                {option.label}
              </button>
            );
          })}
          <button
            onClick={() => handleUpdate({ dietaryType: null })}
            className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all border ${
              !prefs.dietaryType
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-white text-muted hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            No preference
          </button>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="text"
            placeholder="Or type a custom diet..."
            value={customDietInput}
            onChange={(e) => setCustomDietInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitCustomDiet();
              }
            }}
            onBlur={() => {
              if (customDietInput.trim()) submitCustomDiet();
            }}
            className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
          <button
            onClick={submitCustomDiet}
            disabled={!customDietInput.trim()}
            className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </CollapsibleSection>

      {/* Allergies */}
      <CollapsibleSection
        id="allergies"
        title="Allergies & Restrictions"
        description="Select any allergies or dietary restrictions"
        defaultOpen={isExpanded('allergies')}
        compact={compact}
        onClear={prefs.allergies.length > 0 ? () => handleUpdate({ allergies: [] }) : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map(option => {
            const isSelected = prefs.allergies.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => {
                  const updated = isSelected
                    ? prefs.allergies.filter(a => a !== option.value)
                    : [...prefs.allergies, option.value];
                  handleUpdate({ allergies: updated });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-accent-dark'
                    : 'border-border bg-white text-foreground hover:border-accent/50 hover:bg-accent/5'
                }`}
              >
                <span className="text-base">{option.icon}</span>
                {option.label}
              </button>
            );
          })}
        </div>
        {prefs.allergies
          .filter(a => !ALLERGY_OPTIONS.some(o => o.value === a))
          .length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            <p className="w-full text-xs font-medium text-muted mb-1">Custom:</p>
            {prefs.allergies
              .filter(a => !ALLERGY_OPTIONS.some(o => o.value === a))
              .map(customAllergy => (
                <span
                  key={customAllergy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-accent bg-accent/10 text-accent-dark font-medium text-sm capitalize"
                >
                  {customAllergy}
                  <button
                    onClick={() => handleUpdate({ allergies: prefs.allergies.filter(a => a !== customAllergy) })}
                    className="hover:text-accent transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            }
          </div>
        )}
        <div className="flex gap-2 min-w-0">
          <input
            type="text"
            placeholder="Add custom allergy..."
            value={customAllergyInput}
            onChange={(e) => setCustomAllergyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomAllergy();
              }
            }}
            className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
          />
          <button
            onClick={addCustomAllergy}
            className="px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {prefs.allergies.length === 0 && (
          <p className="text-xs text-muted italic text-center py-1">No allergies selected</p>
        )}
      </CollapsibleSection>

      {/* Cuisine Preferences */}
      <CollapsibleSection
        id="cuisines"
        title="Cuisine Preferences"
        description="Select cuisines you enjoy. We'll include more of these but still mix in variety."
        defaultOpen={isExpanded('cuisines')}
        compact={compact}
        onClear={(prefs.cuisinePreferences || []).length > 0 ? () => handleUpdate({ cuisinePreferences: [] }) : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map(cuisine => {
            const isSelected = (prefs.cuisinePreferences || []).includes(cuisine);
            return (
              <button
                key={cuisine}
                onClick={() => {
                  const current = prefs.cuisinePreferences || [];
                  const updated = isSelected
                    ? current.filter(c => c !== cuisine)
                    : [...current, cuisine];
                  handleUpdate({ cuisinePreferences: updated });
                }}
                className={`px-3 py-1.5 rounded-full border-2 transition-all text-sm ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary-dark font-medium'
                    : 'border-border bg-white text-muted hover:border-primary/50'
                }`}
              >
                {cuisine}
              </button>
            );
          })}
          {(prefs.cuisinePreferences || [])
            .filter(c => !CUISINE_OPTIONS.includes(c as typeof CUISINE_OPTIONS[number]))
            .map(customCuisine => (
              <span
                key={customCuisine}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 text-primary-dark font-medium text-sm"
              >
                {customCuisine}
                <button onClick={() => handleUpdate({ cuisinePreferences: (prefs.cuisinePreferences || []).filter(c => c !== customCuisine) })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          }
        </div>
        <div className="flex gap-2 min-w-0">
          <input
            type="text"
            placeholder="Add custom cuisine..."
            value={customCuisineInput}
            onChange={(e) => setCustomCuisineInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomCuisine();
              }
            }}
            className="min-w-0 flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          <button
            onClick={addCustomCuisine}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </CollapsibleSection>

      {/* Servings */}
      <CollapsibleSection
        id="servings"
        title="Number of People"
        defaultOpen={isExpanded('servings')}
        compact={compact}
      >
        <div className="flex items-center gap-4 min-w-0">
          <input
            type="range"
            min="1"
            max="10"
            value={prefs.servings}
            onChange={(e) => handleServingsChange(Number(e.target.value))}
            onMouseUp={handleServingsEnd}
            onTouchEnd={handleServingsEnd}
            className="min-w-0 flex-1 h-3 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((prefs.servings - 1) / 9) * 100}%, var(--color-border) ${((prefs.servings - 1) / 9) * 100}%, var(--color-border) 100%)`
            }}
          />
          <span className="text-2xl font-bold text-primary w-12 text-center">
            {prefs.servings}
          </span>
        </div>
        <p className="text-sm text-muted">
          {prefs.servings === 1 && "Just for me"}
          {prefs.servings === 2 && "For two people"}
          {prefs.servings >= 3 && prefs.servings <= 4 && "Small family"}
          {prefs.servings >= 5 && prefs.servings <= 6 && "Large family"}
          {prefs.servings >= 7 && "Big gatherings"}
        </p>
      </CollapsibleSection>

      {/* Macro Goals */}
      <CollapsibleSection
        id="macros"
        title="Daily Macro Goals"
        defaultOpen={isExpanded('macros')}
        compact={compact}
        onClear={Object.values(prefs.macroGoals).some(v => v !== undefined) ? () => handleUpdate({ macroGoals: {} }) : undefined}
      >
        {(['protein', 'carbs', 'fiber'] as const).map(macro => {
          const currentValue = prefs.macroGoals[macro];
          const isCustom = macroMode[macro] === 'custom';
          const macroConfig = {
            protein: { icon: GiMeat, color: 'text-accent', unit: 'g' },
            carbs: { icon: GiBread, color: 'text-secondary', unit: 'g' },
            fiber: { icon: GiWheat, color: 'text-primary', unit: 'g' },
          }[macro];
          const Icon = macroConfig.icon;
          const presets = (['low', 'moderate', 'high'] as const).map(key => ({
            key,
            grams: MACRO_PRESET_GRAMS[macro][key],
          }));

          return (
            <div key={macro} className="space-y-2">
              <label className="text-sm font-medium capitalize flex items-center gap-2">
                <Icon className={`w-5 h-5 ${macroConfig.color}`} />
                {macro}
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate({
                      macroGoals: { ...prefs.macroGoals, [macro]: undefined },
                    })
                  }
                  className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                    currentValue === undefined && !isCustom
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-muted hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  —
                </button>
                {presets.map(({ key, grams }) => {
                  const selected = !isCustom && currentValue === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMacroMode({ ...macroMode, [macro]: 'preset' });
                        handleUpdate({
                          macroGoals: { ...prefs.macroGoals, [macro]: key },
                        });
                      }}
                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      {grams}g
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setMacroMode({ ...macroMode, [macro]: 'custom' });
                    if (typeof currentValue !== 'number') {
                      handleUpdate({
                        macroGoals: { ...prefs.macroGoals, [macro]: undefined },
                      });
                    }
                  }}
                  className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                    isCustom
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  Custom
                </button>
              </div>
              {isCustom && (
                <div className="flex items-center gap-2 min-w-0 pt-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter grams"
                    value={typeof currentValue === 'number' ? currentValue : ''}
                    onChange={(e) => {
                      const numValue = e.target.value === '' ? undefined : Number(e.target.value);
                      handleUpdate({
                        macroGoals: { ...prefs.macroGoals, [macro]: numValue },
                      }, false);
                    }}
                    onBlur={() => {
                      if (!compact) showToast('Preferences updated');
                    }}
                    className="min-w-0 flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-muted">{macroConfig.unit}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Calories */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FaFire className="w-5 h-5 text-orange-500" />
            Calories
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMacroMode({ ...macroMode, calories: 'preset' });
                handleUpdate({
                  macroGoals: { ...prefs.macroGoals, calories: undefined },
                });
              }}
              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                prefs.macroGoals.calories === undefined && macroMode.calories !== 'custom'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-white text-muted hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              —
            </button>
            {([1200, 2000, 2500] as const).map(kcal => {
              const selected = macroMode.calories !== 'custom' && prefs.macroGoals.calories === kcal;
              return (
                <button
                  key={kcal}
                  type="button"
                  onClick={() => {
                    setMacroMode({ ...macroMode, calories: 'preset' });
                    handleUpdate({
                      macroGoals: { ...prefs.macroGoals, calories: kcal },
                    });
                  }}
                  className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {kcal}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setMacroMode({ ...macroMode, calories: 'custom' });
                const cal = prefs.macroGoals.calories;
                if (cal === undefined || [1200, 2000, 2500].includes(cal)) {
                  handleUpdate({
                    macroGoals: { ...prefs.macroGoals, calories: undefined },
                  });
                }
              }}
              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                macroMode.calories === 'custom'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              Custom
            </button>
          </div>
          {macroMode.calories === 'custom' && (
            <div className="flex items-center gap-2 min-w-0 pt-1">
              <input
                type="number"
                min="0"
                step="50"
                placeholder="Enter daily calories"
                value={prefs.macroGoals.calories ?? ''}
                onChange={(e) => {
                  const numValue = e.target.value === '' ? undefined : Number(e.target.value);
                  handleUpdate({
                    macroGoals: {
                      ...prefs.macroGoals,
                      calories: numValue,
                    },
                  }, false);
                }}
                onBlur={() => {
                  if (!compact) showToast('Preferences updated');
                }}
                className="min-w-0 flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-sm text-muted">kcal</span>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Reset all preferences */}
      <button
        type="button"
        onClick={() => {
          handleUpdate({
            ...DEFAULT_USER_PREFERENCES,
            onboardingCompleted: prefs.onboardingCompleted,
            onboardingDismissed: prefs.onboardingDismissed,
          });
          track(EVENTS.PREFERENCES_COMPLETED, { changed_fields: ['reset_all'] });
        }}
        className="w-full px-3 py-2 text-sm text-muted hover:text-red-500 hover:bg-red-50 rounded-lg border border-border/40 hover:border-red-200 transition-colors"
      >
        Reset all preferences
      </button>
    </div>
  );
}
