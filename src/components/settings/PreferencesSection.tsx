'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { UserPreferences } from '@/types';
import { FaSeedling, FaLeaf, FaDrumstickBite, FaFish, FaAppleAlt, FaFire } from 'react-icons/fa';
import { GiMeat, GiBread, GiWheat, GiOlive, GiFruitBowl } from 'react-icons/gi';
import { MdOutlineNoFood } from 'react-icons/md';
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

  const DIET_OPTIONS = [
    { value: 'omnivore', label: 'Omnivore', icon: FaDrumstickBite },
    { value: 'vegetarian', label: 'Vegetarian', icon: FaSeedling },
    { value: 'vegan', label: 'Vegan', icon: FaLeaf },
    { value: 'pescatarian', label: 'Pescatarian', icon: FaFish },
    { value: 'keto', label: 'Keto', icon: GiMeat },
    { value: 'paleo', label: 'Paleo', icon: FaFish },
    { value: 'primal', label: 'Primal', icon: GiMeat },
    { value: 'mediterranean', label: 'Mediterranean', icon: GiOlive },
    { value: 'low-carb', label: 'Low-Carb', icon: FaAppleAlt },
    { value: 'flexitarian', label: 'Flexitarian', icon: GiFruitBowl },
    { value: 'whole30', label: 'Whole30', icon: MdOutlineNoFood },
    { value: 'gluten-free', label: 'Gluten-Free', icon: GiBread },
  ];

  const ALLERGY_OPTIONS = [
    { value: 'nuts', label: 'Nuts', icon: '🥜' },
    { value: 'peanuts', label: 'Peanuts', icon: '🥜' },
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'gluten', label: 'Gluten', icon: '🌾' },
    { value: 'soy', label: 'Soy', icon: '🫘' },
    { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
    { value: 'fish', label: 'Fish', icon: '🐟' },
    { value: 'eggs', label: 'Eggs', icon: '🥚' },
    { value: 'sesame', label: 'Sesame', icon: '🫘' },
    { value: 'corn', label: 'Corn', icon: '🌽' },
    { value: 'nightshades', label: 'Nightshades', icon: '🍅' },
    { value: 'red-meat', label: 'Red Meat', icon: '🥩' },
    { value: 'poultry', label: 'Poultry', icon: '🍗' },
    { value: 'alcohol', label: 'Alcohol', icon: '🍷' },
  ];

  return (
    <div className="space-y-6">
      {/* Dietary Type */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold text-lg text-foreground">Dietary Preference</h2>
        <div className="grid grid-cols-3 gap-2">
          {DIET_OPTIONS.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleUpdate({ dietaryType: option.value as any })}
                className={`px-3 py-2 rounded-lg border-2 transition-all text-sm flex items-center justify-center gap-2 ${
                  prefs.dietaryType === option.value
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border bg-white text-muted hover:border-primary/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleUpdate({ dietaryType: null })}
          className={`w-full px-3 py-2 rounded-lg border-2 transition-all text-sm flex items-center justify-center gap-2 ${
            !prefs.dietaryType
              ? 'border-primary bg-primary/5 text-primary font-medium'
              : 'border-border bg-white text-muted hover:border-primary/50'
          }`}
        >
          I don't care
        </button>
      </div>

      {/* Allergies */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold text-lg text-foreground">Allergies & Restrictions</h2>
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
                className={`px-3 py-1.5 rounded-full border-2 transition-all text-sm flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-accent-dark font-medium'
                    : 'border-border bg-white text-muted hover:border-accent/50'
                }`}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            );
          })}
          <button
            onClick={() => handleUpdate({ allergies: [] })}
            className={`px-3 py-1.5 rounded-full border-2 transition-all text-sm flex items-center gap-1.5 ${
              prefs.allergies.length === 0
                ? 'border-accent bg-accent/10 text-accent-dark font-medium'
                : 'border-border bg-white text-muted hover:border-accent/50'
            }`}
          >
            None
          </button>
        </div>
        {prefs.allergies.length === 0 && (
          <p className="text-sm text-muted italic">No allergies selected</p>
        )}
      </div>

      {/* Servings */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold text-lg text-foreground">Number of People</h2>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={prefs.servings}
            onChange={(e) => handleServingsChange(Number(e.target.value))}
            onMouseUp={handleServingsEnd}
            onTouchEnd={handleServingsEnd}
            className="flex-1 h-3 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
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
                <div className="flex items-center gap-2">
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
                    className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            <div className="flex items-center gap-2">
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
                className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            Anything else you'd like to add?
          </p>
        </div>
        <div className="space-y-2">
          {(prefs.mealNotes || []).map((note, index) => (
            <div key={index} className="flex items-center gap-2">
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
                className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
