'use client';

import { GiMeat, GiBread, GiWheat } from 'react-icons/gi';

interface MacroGoalsStepProps {
  value: {
    protein?: 'low' | 'moderate' | 'high';
    carbs?: 'low' | 'moderate' | 'high';
    fiber?: 'low' | 'moderate' | 'high';
  };
  onChange: (value: MacroGoalsStepProps['value']) => void;
}

const MACRO_OPTIONS = [
  { key: 'protein' as const, label: 'Protein', icon: GiMeat, color: 'text-accent' },
  { key: 'carbs' as const, label: 'Carbs', icon: GiBread, color: 'text-secondary' },
  { key: 'fiber' as const, label: 'Fiber', icon: GiWheat, color: 'text-primary' },
];

const LEVEL_OPTIONS: Array<{ value: 'low' | 'moderate' | 'high' | undefined; label: string }> = [
  { value: undefined, label: 'Not specified' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

export function MacroGoalsStep({ value, onChange }: MacroGoalsStepProps) {
  const handleChange = (macro: 'protein' | 'carbs' | 'fiber', level: 'low' | 'moderate' | 'high' | undefined) => {
    onChange({
      ...value,
      [macro]: level,
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-muted">
        Set your macro nutrition goals (optional)
      </p>

      <div className="space-y-4">
        {MACRO_OPTIONS.map(macro => {
          const Icon = macro.icon;
          return (
            <div key={macro.key} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-6 h-6 ${macro.color}`} />
                <label className="text-sm font-semibold text-foreground">{macro.label}</label>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {LEVEL_OPTIONS.map(level => (
                  <button
                    key={level.label}
                    onClick={() => handleChange(macro.key, level.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      value[macro.key] === level.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface text-muted hover:bg-surface-dark hover:text-foreground'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted italic">
        These goals help us tailor recipe suggestions to your nutritional needs
      </p>
    </div>
  );
}
