'use client';

import { useState } from 'react';
import { FaSeedling, FaLeaf, FaDrumstickBite, FaFish, FaAppleAlt } from 'react-icons/fa';
import { GiMeat, GiOlive, GiFruitBowl, GiBread } from 'react-icons/gi';
import { MdOutlineNoFood } from 'react-icons/md';
import { UserPreferences } from '@/types';
import { DIET_OPTIONS } from '@/lib/constants';

type DietaryType = UserPreferences['dietaryType'];

const DIET_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  omnivore: FaDrumstickBite,
  vegetarian: FaSeedling,
  vegan: FaLeaf,
  pescatarian: FaFish,
  keto: GiMeat,
  paleo: FaFish,
  primal: GiMeat,
  mediterranean: GiOlive,
  'low-carb': FaAppleAlt,
  flexitarian: GiFruitBowl,
  whole30: MdOutlineNoFood,
  'gluten-free': GiBread,
};

interface DietTypeStepProps {
  value: DietaryType;
  onChange: (value: DietaryType) => void;
}

export function DietTypeStep({ value, onChange }: DietTypeStepProps) {
  const isCustom = value && !DIET_OPTIONS.some(o => o.value === value);
  const [customInput, setCustomInput] = useState(isCustom ? value : '');

  return (
    <div className="space-y-4">
      <p className="text-center text-muted">
        Select your dietary preference to get personalized meal suggestions
      </p>

      <div className="grid grid-cols-2 gap-3">
        {DIET_OPTIONS.map(option => {
          const Icon = DIET_ICON_MAP[option.value];
          return (
            <button
              key={option.value}
              onClick={() => {
                onChange(value === option.value ? null : option.value);
                setCustomInput('');
              }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                value === option.value
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-white hover:border-primary/50'
              }`}
            >
              {Icon && <Icon className="w-8 h-8 text-primary mb-2" />}
              <div className="font-semibold text-foreground">{option.label}</div>
              <div className="text-xs text-muted mt-1">{option.desc}</div>
            </button>
          );
        })}
      </div>

      <div>
        <input
          type="text"
          placeholder="Or type a custom diet..."
          value={customInput}
          onChange={(e) => {
            setCustomInput(e.target.value);
            onChange(e.target.value || null);
          }}
          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>
    </div>
  );
}
