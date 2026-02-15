'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ALLERGY_OPTIONS } from '@/lib/constants';

interface AllergiesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function AllergiesStep({ value, onChange }: AllergiesStepProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleAllergy = (allergy: string) => {
    if (value.includes(allergy)) {
      onChange(value.filter(a => a !== allergy));
    } else {
      onChange([...value, allergy]);
    }
  };

  const addCustomAllergy = () => {
    const trimmed = customInput.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustomInput('');
    }
  };

  const customAllergies = value.filter(a => !ALLERGY_OPTIONS.some(o => o.value === a));

  return (
    <div className="space-y-4">
      <p className="text-center text-muted">
        Select any allergies or dietary restrictions you have
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ALLERGY_OPTIONS.map(option => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleAllergy(option.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                isSelected
                  ? 'border-accent bg-accent/10 shadow-md'
                  : 'border-border bg-white hover:border-accent/50'
              }`}
            >
              <div className="text-3xl mb-2">{option.icon}</div>
              <div className="font-semibold text-foreground">{option.label}</div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom allergies */}
      {customAllergies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customAllergies.map(allergy => (
            <span
              key={allergy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-accent bg-accent/10 text-accent-dark font-medium text-sm capitalize"
            >
              {allergy}
              <button onClick={() => onChange(value.filter(a => a !== allergy))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add custom allergy..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustomAllergy();
            }
          }}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
        />
        <button
          onClick={addCustomAllergy}
          className="px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-center text-sm text-muted italic mt-4">
          No allergies? Great! You can skip this step.
        </p>
      )}
    </div>
  );
}
