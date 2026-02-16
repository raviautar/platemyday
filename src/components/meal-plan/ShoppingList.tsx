'use client';

import { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WeekPlan, Recipe, SuggestedRecipe } from '@/types';
import { ConsolidatedCategory } from '@/contexts/MealPlanContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useToast } from '@/components/ui/Toast';
import { Check, ShoppingCart, Copy } from 'lucide-react';

interface ShoppingListProps {
  isOpen: boolean;
  onClose: () => void;
  weekPlan: WeekPlan;
  recipes: Recipe[];
  suggestedRecipes: Record<string, SuggestedRecipe>;
  shoppingList: ConsolidatedCategory[] | null;
  shoppingPantryItems: string[];
  shoppingListLoading: boolean;
}

const LOADING_MESSAGES = [
  "Negotiating with the avocados about cart placement 🥑",
  "The tomatoes and potatoes are having a turf war 🍅🥔",
  "Counting every last grain of rice… almost there 🍚",
  "Convincing the cheese it's not being replaced 🧀",
  "The onions are making us cry with their math 🧅",
  "Bribing the garlic to stop multiplying 🧄",
];

function getRandomLoadingMessage() {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

export function ShoppingList({ isOpen, onClose, weekPlan, recipes, suggestedRecipes, shoppingList, shoppingPantryItems, shoppingListLoading }: ShoppingListProps) {
  const [consolidatedChecked, setConsolidatedChecked] = useState<Set<string>>(new Set());
  const [loadingMessage] = useState(getRandomLoadingMessage);
  const { track } = useAnalytics();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && shoppingList) {
      const totalItems = shoppingList.reduce((sum, cat) => sum + cat.items.length, 0);
      track(EVENTS.SHOPPING_LIST_VIEWED, { ingredient_count: totalItems });
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleItem = (key: string) => {
    setConsolidatedChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleCopyToClipboard = async () => {
    if (!shoppingList) return;

    let text = '';
    for (const category of shoppingList) {
      text += `${category.name}\n`;
      for (const item of category.items) {
        const key = `${category.name}:${item}`;
        const checked = consolidatedChecked.has(key);
        text += `  ${checked ? '[x]' : '[ ]'} ${item}\n`;
      }
      text += '\n';
    }

    if (shoppingPantryItems.length > 0) {
      text += `Probably in Your Pantry\n`;
      for (const item of shoppingPantryItems) {
        text += `  - ${item}\n`;
      }
      text += '\n';
    }

    try {
      await navigator.clipboard.writeText(text.trim());
      const totalCount = shoppingList.reduce((sum, cat) => sum + cat.items.length, 0);
      track(EVENTS.SHOPPING_LIST_COPIED, { is_consolidated: true, item_count: totalCount });
      showToast('Shopping list copied to clipboard!');
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const checkedCount = consolidatedChecked.size;
  const totalCount = shoppingList
    ? shoppingList.reduce((sum, cat) => sum + cat.items.length, 0)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Shopping List</h2>
              {shoppingList && (
                <p className="text-sm text-muted">
                  {checkedCount} of {totalCount} items
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {shoppingList && (
              <button
                onClick={handleCopyToClipboard}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-muted" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground text-xl leading-none p-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full bg-surface-dark rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        {shoppingListLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-muted mt-4 text-sm italic">{loadingMessage}</p>
          </div>
        ) : shoppingList && shoppingList.length > 0 ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto -mx-1 px-1">
            {shoppingList.map(category => (
              <div key={category.name}>
                <h3 className="text-sm font-semibold text-foreground mb-1.5 px-1">{category.name}</h3>
                <div className="space-y-0.5">
                  {category.items.map(item => {
                    const key = `${category.name}:${item}`;
                    const checked = consolidatedChecked.has(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleItem(key)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-200 ${checked ? 'bg-emerald-50/50' : 'hover:bg-surface'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-border'
                          }`}>
                          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm transition-all ${checked ? 'text-muted line-through' : 'text-foreground'
                          }`}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Pantry staples (non-checkable) */}
            {shoppingPantryItems.length > 0 && (
              <div className="mt-2 pt-3 border-t border-border/60">
                <h3 className="text-sm font-semibold text-muted mb-1.5 px-1">🏠 Probably in Your Pantry</h3>
                <div className="space-y-0.5">
                  {shoppingPantryItems.map(item => (
                    <div key={item} className="flex items-center gap-3 p-2.5 rounded-lg">
                      <span className="text-sm text-muted">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No ingredients found in your meal plan.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
