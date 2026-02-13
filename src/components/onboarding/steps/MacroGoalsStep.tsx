'use client';

import { useState } from 'react';
import { GiMeat, GiBread, GiWheat } from 'react-icons/gi';
import { FaFire } from 'react-icons/fa';

interface MacroGoalsStepProps {
  value: {
    protein?: 'low' | 'moderate' | 'high' | number;
    carbs?: 'low' | 'moderate' | 'high' | number;
    fiber?: 'low' | 'moderate' | 'high' | number;
    calories?: number;
  };
  onChange: (value: MacroGoalsStepProps['value']) => void;
}

const MACRO_OPTIONS = [
  { key: 'protein' as const, label: 'Protein', icon: GiMeat, color: 'text-accent', unit: 'g' },
  { key: 'carbs' as const, label: 'Carbs', icon: GiBread, color: 'text-secondary', unit: 'g' },
  { key: 'fiber' as const, label: 'Fiber', icon: GiWheat, color: 'text-primary', unit: 'g' },
];

const LEVEL_OPTIONS: Array<{ value: 'low' | 'moderate' | 'high' | undefined; label: string }> = [
  { value: undefined, label: 'Not specified' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

export function MacroGoalsStep({ value, onChange }: MacroGoalsStepProps) {
  const [mode, setMode] = useState<Record<'protein' | 'carbs' | 'fiber', 'preset' | 'custom'>>({
    protein: typeof value.protein === 'number' ? 'custom' : 'preset',
    carbs: typeof value.carbs === 'number' ? 'custom' : 'preset',
    fiber: typeof value.fiber === 'number' ? 'custom' : 'preset',
  });

  const handlePresetChange = (macro: 'protein' | 'carbs' | 'fiber', level: 'low' | 'moderate' | 'high' | undefined) => {
    onChange({
      ...value,
      [macro]: level,
    });
  };

  const handleCustomChange = (macro: 'protein' | 'carbs' | 'fiber', amount: string) => {
    const numValue = amount === '' ? undefined : Number(amount);
    onChange({
      ...value,
      [macro]: numValue,
    });
  };

  const toggleMode = (macro: 'protein' | 'carbs' | 'fiber') => {
    const newMode = mode[macro] === 'preset' ? 'custom' : 'preset';
    setMode({ ...mode, [macro]: newMode });
    
    if (newMode === 'preset') {
      onChange({
        ...value,
        [macro]: undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-muted">
        Set your macro nutrition goals (optional)
      </p>

      <div className="space-y-4">
        {MACRO_OPTIONS.map(macro => {
          const Icon = macro.icon;
          const currentValue = value[macro.key];
          const isCustom = mode[macro.key] === 'custom';
          const isPreset = typeof currentValue === 'string' || currentValue === undefined;

          return (
            <div key={macro.key} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${macro.color}`} />
                  <label className="text-sm font-semibold text-foreground">{macro.label}</label>
                </div>
                <button
                  onClick={() => toggleMode(macro.key)}
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
                    onChange={(e) => handleCustomChange(macro.key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-muted">{macro.unit}</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {LEVEL_OPTIONS.map(level => (
                    <button
                      key={level.label}
                      onClick={() => handlePresetChange(macro.key, level.value)}
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
              )}
            </div>
          );
        })}
      </div>

      {/* Calories */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <FaFire className="w-6 h-6 text-orange-500" />
          <label className="text-sm font-semibold text-foreground">
            Calories <span className="text-xs text-muted font-normal">(per day)</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="50"
            placeholder="Enter daily calories"
            value={value.calories || ''}
            onChange={(e) => {
              const numValue = e.target.value === '' ? undefined : Number(e.target.value);
              onChange({
                ...value,
                calories: numValue,
              });
            }}
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <span className="text-sm text-muted">kcal</span>
        </div>
      </div>

      <p className="text-xs text-center text-muted italic">
        These goals help us tailor recipe suggestions to your nutritional needs
      </p>
    </div>
  );
}
