'use client';

import { MdClose } from 'react-icons/md';

interface AllergiesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

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

export function AllergiesStep({ value, onChange }: AllergiesStepProps) {
  const toggleAllergy = (allergy: string) => {
    if (value.includes(allergy)) {
      onChange(value.filter(a => a !== allergy));
    } else {
      onChange([...value, allergy]);
    }
  };

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

      {value.length === 0 && (
        <p className="text-center text-sm text-muted italic mt-4">
          No allergies? Great! You can skip this step.
        </p>
      )}
    </div>
  );
}
