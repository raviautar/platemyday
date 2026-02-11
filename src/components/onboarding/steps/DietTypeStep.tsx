'use client';

import { FaSeedling, FaLeaf, FaDrumstickBite, FaFish, FaAppleAlt } from 'react-icons/fa';
import { GiMeat, GiOlive, GiFruitBowl, GiBread } from 'react-icons/gi';
import { MdOutlineNoFood } from 'react-icons/md';
import { UserPreferences } from '@/types';

type DietaryType = UserPreferences['dietaryType'];
type DietaryTypeValue = Exclude<DietaryType, null>;

interface DietTypeStepProps {
  value: DietaryType;
  onChange: (value: DietaryType) => void;
}

const DIET_OPTIONS: Array<{
  value: DietaryTypeValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}> = [
  { value: 'omnivore', label: 'Omnivore', icon: FaDrumstickBite, desc: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian', icon: FaSeedling, desc: 'No meat or fish' },
  { value: 'vegan', label: 'Vegan', icon: FaLeaf, desc: 'No animal products' },
  { value: 'pescatarian', label: 'Pescatarian', icon: FaFish, desc: 'Fish but no meat' },
  { value: 'keto', label: 'Keto', icon: GiMeat, desc: 'Low-carb, high-fat' },
  { value: 'paleo', label: 'Paleo', icon: FaFish, desc: 'Whole foods, no grains' },
  { value: 'primal', label: 'Primal', icon: GiMeat, desc: 'Like paleo, includes dairy' },
  { value: 'mediterranean', label: 'Mediterranean', icon: GiOlive, desc: 'Olive oil, fish, vegetables' },
  { value: 'low-carb', label: 'Low-Carb', icon: FaAppleAlt, desc: 'Reduced carbohydrates' },
  { value: 'flexitarian', label: 'Flexitarian', icon: GiFruitBowl, desc: 'Mostly plant-based' },
  { value: 'whole30', label: 'Whole30', icon: MdOutlineNoFood, desc: '30-day reset program' },
  { value: 'gluten-free', label: 'Gluten-Free', icon: GiBread, desc: 'No gluten-containing foods' },
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
