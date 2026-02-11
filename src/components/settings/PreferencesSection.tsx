'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { UserPreferences } from '@/types';
import { FaSeedling, FaLeaf, FaDrumstickBite, FaFish } from 'react-icons/fa';
import { GiMeat, GiBread, GiWheat } from 'react-icons/gi';

export function PreferencesSection() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const prefs = settings.preferences;

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    updateSettings({
      preferences: {
        ...prefs,
        ...updates,
      },
    });
    showToast('Preferences updated');
  };

  const DIET_OPTIONS = [
    { value: 'omnivore', label: 'Omnivore', icon: FaDrumstickBite },
    { value: 'vegetarian', label: 'Vegetarian', icon: FaSeedling },
    { value: 'vegan', label: 'Vegan', icon: FaLeaf },
    { value: 'keto', label: 'Keto', icon: GiMeat },
    { value: 'paleo', label: 'Paleo', icon: FaFish },
    { value: 'primal', label: 'Primal', icon: GiMeat },
  ];

  const ALLERGY_OPTIONS = [
    { value: 'nuts', label: 'Nuts', icon: '🥜' },
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'gluten', label: 'Gluten', icon: '🌾' },
    { value: 'soy', label: 'Soy', icon: '🫘' },
    { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
    { value: 'eggs', label: 'Eggs', icon: '🥚' },
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
        {prefs.dietaryType && (
          <button
            onClick={() => handleUpdate({ dietaryType: null })}
            className="text-sm text-muted hover:text-foreground underline"
          >
            Clear selection
          </button>
        )}
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
            onChange={(e) => handleUpdate({ servings: Number(e.target.value) })}
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
        <h2 className="font-semibold text-lg text-foreground">Macro Goals</h2>
        {['protein', 'carbs', 'fiber'].map(macro => (
          <div key={macro} className="flex items-center justify-between">
            <label className="text-sm font-medium capitalize flex items-center gap-2">
              {macro === 'protein' && <GiMeat className="w-5 h-5 text-accent" />}
              {macro === 'carbs' && <GiBread className="w-5 h-5 text-secondary" />}
              {macro === 'fiber' && <GiWheat className="w-5 h-5 text-primary" />}
              {macro}
            </label>
            <select
              value={prefs.macroGoals[macro as keyof typeof prefs.macroGoals] || ''}
              onChange={(e) =>
                handleUpdate({
                  macroGoals: {
                    ...prefs.macroGoals,
                    [macro]: e.target.value || undefined,
                  },
                })
              }
              className="px-3 py-1.5 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Not specified</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
        ))}
        <p className="text-xs text-muted italic">
          These goals help us tailor recipe suggestions to your nutritional needs
        </p>
      </div>
    </div>
  );
}
