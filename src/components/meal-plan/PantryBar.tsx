'use client';

import { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { UserPreferences } from '@/types';
import { DEFAULT_USER_PREFERENCES } from '@/lib/constants';
import { searchIngredients } from '@/lib/ingredients';
import { Package, Plus, X, ChevronDown } from 'lucide-react';

interface PantryBarProps {
  compact?: boolean;
}

export function PantryBar({ compact }: PantryBarProps) {
  const { settings, updateSettings } = useSettings();
  const prefs: UserPreferences = { ...DEFAULT_USER_PREFERENCES, ...settings.preferences };

  const [ingredientInput, setIngredientInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ingredientInput.trim()) {
      setSuggestions(searchIngredients(ingredientInput, 8));
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [ingredientInput]);

  const handleUpdate = (pantryIngredients: string[]) => {
    updateSettings({
      preferences: { ...prefs, pantryIngredients },
    });
  };

  const addIngredient = (ingredient?: string) => {
    const trimmed = (ingredient || ingredientInput).trim();
    if (trimmed && !prefs.pantryIngredients.includes(trimmed)) {
      handleUpdate([...prefs.pantryIngredients, trimmed]);
      setIngredientInput('');
      setSuggestions([]);
      setSelectedIndex(-1);
      // Keep focus on input for rapid adding
      inputRef.current?.focus();
    }
  };

  const removeIngredient = (ingredient: string) => {
    handleUpdate(prefs.pantryIngredients.filter(i => i !== ingredient));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addIngredient();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        addIngredient(suggestions[selectedIndex]);
      } else {
        addIngredient();
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  const ingredientCount = prefs.pantryIngredients.length;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-surface rounded-xl border border-primary/20">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-3 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary shrink-0" />
          <span className="font-semibold text-foreground text-xs sm:text-sm">
            What&apos;s in your kitchen?
          </span>
          {ingredientCount > 0 && (
            <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
              {ingredientCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {ingredientCount > 0 && !isCollapsed && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleUpdate([]); }}
              className="p-1 rounded-md text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Clear all ingredients"
              title="Clear all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
          />
        </div>
      </button>

      {/* Collapsed preview — show chips inline */}
      {isCollapsed && ingredientCount > 0 && (
        <div className="px-3 sm:px-4 pb-3 -mt-1">
          <div className="flex flex-wrap gap-1.5">
            {prefs.pantryIngredients.slice(0, 8).map(ing => (
              <span
                key={ing}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
              >
                {ing}
              </span>
            ))}
            {ingredientCount > 8 && (
              <span className="text-xs text-muted py-0.5">
                +{ingredientCount - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded content */}
      {!isCollapsed && (
        <div className="px-3 sm:px-4 pb-4 space-y-3">
          {/* Input with autocomplete */}
          <div className="relative">
            <div className="flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  setTimeout(() => {
                    setSuggestions([]);
                    setSelectedIndex(-1);
                  }, 200);
                }}
                placeholder="Add chicken, rice, broccoli..."
                className={`flex-1 px-3 rounded-lg border border-primary/30 bg-white text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${compact ? 'py-2 text-sm' : 'py-2.5 text-sm'}`}
              />
              <button
                onClick={() => addIngredient()}
                disabled={!ingredientInput.trim()}
                className="rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors px-2.5 py-2 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-border/60 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addIngredient(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-surface/50'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
                {ingredientInput.trim() && !suggestions.some(s => s.toLowerCase() === ingredientInput.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => addIngredient(ingredientInput.trim())}
                    className="w-full text-left px-3 py-2 text-sm text-primary border-t border-border/40 hover:bg-primary/5 transition-colors font-medium"
                  >
                    Add &quot;{ingredientInput.trim()}&quot;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ingredient chips */}
          {ingredientCount > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {prefs.pantryIngredients.map(ing => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-primary text-sm border border-primary/20 font-medium shadow-sm"
                >
                  {ing}
                  <button
                    onClick={() => removeIngredient(ing)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted text-center py-2 italic leading-relaxed">
              Add what&apos;s in your fridge and pantry — we&apos;ll plan meals around them so nothing goes to waste.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
