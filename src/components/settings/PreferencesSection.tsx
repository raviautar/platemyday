'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { UserPreferences } from '@/types';
import { DIET_OPTIONS, ALLERGY_OPTIONS, CUISINE_OPTIONS } from '@/lib/constants';
import { DIET_ICON_MAP } from '@/lib/diet-icons';
import { FaFire } from 'react-icons/fa';
import { GiMeat, GiBread, GiWheat } from 'react-icons/gi';
import { Plus, X } from 'lucide-react';

export function PreferencesSection() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const prefs = settings.preferences;

  const [macroMode, setMacroMode] = useState<Record<'protein' | 'carbs' | 'fiber' | 'calories', 'preset' | 'custom'>>({
    protein: typeof prefs.macroGoals.protein === 'number' ? 'custom' : 'preset',
    carbs: typeof prefs.macroGoals.carbs === 'number' ? 'custom' : 'preset',
    fiber: typeof prefs.macroGoals.fiber === 'number' ? 'custom' : 'preset',
    calories: typeof prefs.macroGoals.calories === 'number' ? 'custom' : 'preset',
  });

  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [customCuisineInput, setCustomCuisineInput] = useState('');

  useEffect(() => {
    setMacroMode({
      protein: typeof prefs.macroGoals.protein === 'number' ? 'custom' : 'preset',
      carbs: typeof prefs.macroGoals.carbs === 'number' ? 'custom' : 'preset',
      fiber: typeof prefs.macroGoals.fiber === 'number' ? 'custom' : 'preset',
      calories: typeof prefs.macroGoals.calories === 'number' ? 'custom' : 'preset',
    });
  }, [prefs.macroGoals]);

  const handleUpdate = (updates: Partial<UserPreferences>, showNotification = true) => {
    updateSettings({
      preferences: {
        ...prefs,
        ...updates,
      },
    });
    if (showNotification) {
      showToast('Preferences updated');
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
    showToast('Preferences updated');
  };

  const isCustomDiet = prefs.dietaryType && !DIET_OPTIONS.some(o => o.value === prefs.dietaryType);

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

  return (
    <div className="space-y-6">
      {/* Dietary Type */}
      <div className="bg-gradient-to-br from-white to-surface/30 rounded-2xl border-2 border-border/60 shadow-lg p-6 space-y-5">
        <div>
          <h2 className="font-bold text-xl text-foreground mb-1">Dietary Preference</h2>
          <p className="text-sm text-muted">Select your dietary preference to personalize meal suggestions</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {DIET_OPTIONS.map(option => {
            const Icon = DIET_ICON_MAP[option.value];
            const isSelected = prefs.dietaryType === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleUpdate({ dietaryType: option.value })}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                    : 'border-border bg-white hover:border-primary/50 hover:bg-surface/50'
                }`}
              >
                {Icon && <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted'}`} />}
                <div className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-muted mt-1">{option.desc}</div>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleUpdate({ dietaryType: null })}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center justify-center gap-2 ${
            !prefs.dietaryType
              ? 'border-primary bg-primary/10 text-primary shadow-sm'
              : 'border-border bg-white text-muted hover:border-primary/50 hover:bg-surface/50'
          }`}
        >
          I don&apos;t care
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="text"
            placeholder="Or type a custom diet..."
            value={isCustomDiet ? (prefs.dietaryType ?? '') : ''}
            onChange={(e) => handleUpdate({ dietaryType: e.target.value || null }, false)}
            onBlur={() => {
              if (isCustomDiet) showToast('Preferences updated');
            }}
            className="min-w-0 flex-1 px-4 py-2.5 rounded-lg border-2 border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-gradient-to-br from-white to-surface/30 rounded-2xl border-2 border-border/60 shadow-lg p-6 space-y-5">
        <div>
          <h2 className="font-bold text-xl text-foreground mb-1">Allergies & Restrictions</h2>
          <p className="text-sm text-muted">Select any allergies or dietary restrictions</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                className={`p-4 rounded-xl border-2 transition-all text-left relative hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected
                    ? 'border-accent bg-accent/10 shadow-md shadow-accent/20'
                    : 'border-border bg-white hover:border-accent/50 hover:bg-surface/50'
                }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className={`font-semibold text-sm ${isSelected ? 'text-accent-dark' : 'text-foreground'}`}>
                  {option.label}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {prefs.allergies
          .filter(a => !ALLERGY_OPTIONS.some(o => o.value === a))
          .length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            <p className="w-full text-xs font-medium text-muted mb-2">Custom allergies:</p>
            {prefs.allergies
              .filter(a => !ALLERGY_OPTIONS.some(o => o.value === a))
              .map(customAllergy => (
                <span
                  key={customAllergy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-accent bg-accent/10 text-accent-dark font-medium text-sm capitalize"
                >
                  {customAllergy}
                  <button 
                    onClick={() => handleUpdate({ allergies: prefs.allergies.filter(a => a !== customAllergy) })}
                    className="hover:text-accent transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
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
            className="min-w-0 flex-1 px-4 py-2.5 rounded-lg border-2 border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
          />
          <button
            onClick={addCustomAllergy}
            className="px-4 py-2.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors border-2 border-accent/30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {prefs.allergies.length === 0 && (
          <p className="text-sm text-muted italic text-center py-2">No allergies selected</p>
        )}
      </div>

      {/* Cuisine Preferences */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <div>
          <h2 className="font-semibold text-lg text-foreground mb-1">Cuisine Preferences</h2>
          <p className="text-xs text-muted">
            Select cuisines you enjoy. We&apos;ll include more of these but still mix in variety.
          </p>
        </div>
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
                    ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                    : 'border-border bg-white text-muted hover:border-teal-300'
                }`}
              >
                {cuisine}
              </button>
            );
          })}
          {/* Custom cuisines */}
          {(prefs.cuisinePreferences || [])
            .filter(c => !CUISINE_OPTIONS.includes(c as typeof CUISINE_OPTIONS[number]))
            .map(customCuisine => (
              <span
                key={customCuisine}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-teal-500 bg-teal-50 text-teal-700 font-medium text-sm"
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
            className="min-w-0 flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
          />
          <button
            onClick={addCustomCuisine}
            className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Servings */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold text-lg text-foreground">Number of People</h2>
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
      </div>

      {/* Macro Goals */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold text-lg text-foreground">Daily Macro Goals</h2>
        {(['protein', 'carbs', 'fiber'] as const).map(macro => {
          const currentValue = prefs.macroGoals[macro];
          const isCustom = macroMode[macro] === 'custom';
          const macroConfig = {
            protein: { icon: GiMeat, color: 'text-accent', unit: 'g' },
            carbs: { icon: GiBread, color: 'text-secondary', unit: 'g' },
            fiber: { icon: GiWheat, color: 'text-primary', unit: 'g' },
          }[macro];
          const Icon = macroConfig.icon;

          return (
            <div key={macro} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium capitalize flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${macroConfig.color}`} />
                  {macro}
                </label>
                <button
                  onClick={() => {
                    const newMode = macroMode[macro] === 'preset' ? 'custom' : 'preset';
                    setMacroMode({ ...macroMode, [macro]: newMode });
                    if (newMode === 'preset') {
                      handleUpdate({
                        macroGoals: {
                          ...prefs.macroGoals,
                          [macro]: undefined,
                        },
                      });
                    }
                  }}
                  className="text-xs text-muted hover:text-foreground underline"
                >
                  {isCustom ? 'Use preset' : 'Custom amount'}
                </button>
              </div>
              {isCustom ? (
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter grams"
                    value={typeof currentValue === 'number' ? currentValue : ''}
                    onChange={(e) => {
                      const numValue = e.target.value === '' ? undefined : Number(e.target.value);
                      handleUpdate({
                        macroGoals: {
                          ...prefs.macroGoals,
                          [macro]: numValue,
                        },
                      }, false);
                    }}
                    onBlur={() => {
                      showToast('Preferences updated');
                    }}
                    className="min-w-0 flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-muted">{macroConfig.unit}</span>
                </div>
              ) : (
                <select
                  value={typeof currentValue === 'string' ? currentValue : ''}
                  onChange={(e) =>
                    handleUpdate({
                      macroGoals: {
                        ...prefs.macroGoals,
                        [macro]: e.target.value || undefined,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Not specified</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              )}
            </div>
          );
        })}

        {/* Calories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaFire className="w-5 h-5 text-orange-500" />
              Calories
            </label>
            <button
              onClick={() => {
                const newMode = macroMode.calories === 'preset' ? 'custom' : 'preset';
                setMacroMode({ ...macroMode, calories: newMode });
                if (newMode === 'preset') {
                  handleUpdate({
                    macroGoals: {
                      ...prefs.macroGoals,
                      calories: undefined,
                    },
                  });
                }
              }}
              className="text-xs text-muted hover:text-foreground underline"
            >
              {macroMode.calories === 'custom' ? 'Use preset' : 'Custom amount'}
            </button>
          </div>
          {macroMode.calories === 'custom' ? (
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="number"
                min="0"
                step="50"
                placeholder="Enter daily calories"
                value={prefs.macroGoals.calories || ''}
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
                  showToast('Preferences updated');
                }}
                className="min-w-0 flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-sm text-muted">kcal</span>
            </div>
          ) : (
            <select
              value={prefs.macroGoals.calories || ''}
              onChange={(e) =>
                handleUpdate({
                  macroGoals: {
                    ...prefs.macroGoals,
                    calories: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Not specified</option>
              <option value="1200">1200 kcal</option>
              <option value="1500">1500 kcal</option>
              <option value="2000">2000 kcal</option>
              <option value="2500">2500 kcal</option>
            </select>
          )}
        </div>
        <p className="text-xs text-muted italic">
          These goals help us tailor recipe suggestions to your nutritional needs
        </p>
      </div>

      {/* Additional Meal Preferences */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <div>
          <h2 className="font-semibold text-lg text-foreground mb-1">Additional Meal Preferences</h2>
          <p className="text-xs text-muted">
            Anything else you&apos;d like to add?
          </p>
        </div>
        <div className="space-y-2">
          {(prefs.mealNotes || []).map((note, index) => (
            <div key={index} className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={note}
                onChange={(e) => {
                  const updated = [...(prefs.mealNotes || [])];
                  updated[index] = e.target.value;
                  handleUpdate({ mealNotes: updated }, false);
                }}
                onBlur={() => {
                  const updated = (prefs.mealNotes || []).filter(n => n.trim() !== '');
                  if (updated.length !== (prefs.mealNotes || []).length) {
                    handleUpdate({ mealNotes: updated });
                  } else {
                    showToast('Preferences updated');
                  }
                }}
                placeholder="e.g., No cilantro in my dishes"
                className="min-w-0 flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => {
                  const updated = (prefs.mealNotes || []).filter((_, i) => i !== index);
                  handleUpdate({ mealNotes: updated });
                }}
                className="p-1.5 text-muted hover:text-foreground transition-colors"
                aria-label="Remove note"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => handleUpdate({ mealNotes: [...(prefs.mealNotes || []), ''] })}
            className="w-full px-3 py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add preference
          </button>
        </div>
      </div>
    </div>
  );
}
