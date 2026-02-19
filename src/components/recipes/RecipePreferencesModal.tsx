'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/contexts/SettingsContext';
import { UserPreferences } from '@/types';
import { DIET_OPTIONS, ALLERGY_OPTIONS } from '@/lib/constants';
import { DIET_ICON_MAP } from '@/lib/diet-icons';
import { Plus, X } from 'lucide-react';

interface RecipePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function RecipePreferencesModal({ isOpen, onClose, onSave }: RecipePreferencesModalProps) {
  const { settings, updateSettings } = useSettings();
  const [preferences, setPreferences] = useState<UserPreferences>(settings.preferences);
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [customDietInput, setCustomDietInput] = useState('');

  useEffect(() => {
    setPreferences(settings.preferences);
    const isCustomDiet = settings.preferences.dietaryType && !DIET_OPTIONS.some(o => o.value === settings.preferences.dietaryType);
    setCustomDietInput(isCustomDiet ? settings.preferences.dietaryType : '');
  }, [settings.preferences, isOpen]);

  const handleSave = () => {
    updateSettings({ preferences });
    if (onSave) {
      onSave();
    }
    onClose();
  };

  const handleDietChange = (value: string | null) => {
    setPreferences(p => ({ ...p, dietaryType: value }));
    if (value && DIET_OPTIONS.some(o => o.value === value)) {
      setCustomDietInput('');
    }
  };

  const handleCustomDietChange = (value: string) => {
    setCustomDietInput(value);
    setPreferences(p => ({ ...p, dietaryType: value || null }));
  };

  const toggleAllergy = (allergy: string) => {
    setPreferences(p => ({
      ...p,
      allergies: p.allergies.includes(allergy)
        ? p.allergies.filter(a => a !== allergy)
        : [...p.allergies, allergy],
    }));
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergyInput.trim().toLowerCase();
    if (trimmed && !preferences.allergies.includes(trimmed)) {
      setPreferences(p => ({ ...p, allergies: [...p.allergies, trimmed] }));
      setCustomAllergyInput('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setPreferences(p => ({ ...p, allergies: p.allergies.filter(a => a !== allergy) }));
  };

  const customAllergies = preferences.allergies.filter(a => !ALLERGY_OPTIONS.some(o => o.value === a));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recipe Preferences" fullscreen>
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-white to-surface/30 rounded-2xl border-2 border-border/60 shadow-lg p-6 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Dietary Preference</h3>
              <p className="text-sm text-muted">Select your dietary preference to personalize recipe suggestions</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {DIET_OPTIONS.map(option => {
                const Icon = DIET_ICON_MAP[option.value];
                const isSelected = preferences.dietaryType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleDietChange(isSelected ? null : option.value)}
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
            <div className="mt-2">
              <input
                type="text"
                placeholder="Or type a custom diet..."
                value={customDietInput}
                onChange={(e) => handleCustomDietChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-surface/30 rounded-2xl border-2 border-border/60 shadow-lg p-6 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Allergies & Restrictions</h3>
              <p className="text-sm text-muted">Select any allergies or dietary restrictions</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALLERGY_OPTIONS.map(option => {
                const isSelected = preferences.allergies.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleAllergy(option.value)}
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
            {customAllergies.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                <p className="w-full text-xs font-medium text-muted mb-2">Custom allergies:</p>
                {customAllergies.map(allergy => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-accent bg-accent/10 text-accent-dark font-medium text-sm capitalize"
                  >
                    {allergy}
                    <button 
                      onClick={() => removeAllergy(allergy)}
                      className="hover:text-accent transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
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
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
              />
              <Button
                onClick={addCustomAllergy}
                variant="ghost"
                className="px-4 py-2.5 border-2 border-accent/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40">
          <Button 
            onClick={handleSave} 
            className="flex-1 px-6 py-3 text-base font-semibold"
          >
            Save Preferences
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="px-6 py-3 text-base"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
