'use client';

import { FaSeedling, FaLeaf, FaDrumstickBite, FaFish } from 'react-icons/fa';
import { GiMeat } from 'react-icons/gi';

interface DietTypeStepProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const DIET_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore', icon: FaDrumstickBite, desc: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian', icon: FaSeedling, desc: 'No meat or fish' },
  { value: 'vegan', label: 'Vegan', icon: FaLeaf, desc: 'No animal products' },
  { value: 'keto', label: 'Keto', icon: GiMeat, desc: 'Low-carb, high-fat' },
  { value: 'paleo', label: 'Paleo', icon: FaFish, desc: 'Whole foods, no grains' },
  { value: 'primal', label: 'Primal', icon: GiMeat, desc: 'Like paleo, includes dairy' },
];

export function DietTypeStep({ value, onChange }: DietTypeStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-center text-muted">
        Select your dietary preference to get personalized meal suggestions
      </p>

      <div className="grid grid-cols-2 gap-3">
        {DIET_OPTIONS.map(option => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onChange(value === option.value ? null : option.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                value === option.value
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-white hover:border-primary/50'
              }`}
            >
              <Icon className="w-8 h-8 text-primary mb-2" />
              <div className="font-semibold text-foreground">{option.label}</div>
              <div className="text-xs text-muted mt-1">{option.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
