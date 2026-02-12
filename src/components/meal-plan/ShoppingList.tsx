'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WeekPlan, Recipe, SuggestedRecipe } from '@/types';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useToast } from '@/components/ui/Toast';
import { Check, ShoppingCart, Sparkles, Copy, ArrowLeft } from 'lucide-react';

interface ShoppingListProps {
  isOpen: boolean;
  onClose: () => void;
  weekPlan: WeekPlan;
  recipes: Recipe[];
  suggestedRecipes: Record<string, SuggestedRecipe>;
}

interface ShoppingItem {
  ingredient: string;
  recipes: string[];
}

interface ConsolidatedCategory {
  name: string;
  items: string[];
}

export function ShoppingList({ isOpen, onClose, weekPlan, recipes, suggestedRecipes }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [consolidating, setConsolidating] = useState(false);
  const [consolidated, setConsolidated] = useState<ConsolidatedCategory[] | null>(null);
  const [consolidatedChecked, setConsolidatedChecked] = useState<Set<string>>(new Set());
  const { userId, anonymousId } = useUserIdentity();
  const { showToast } = useToast();

  const items = useMemo(() => {
    const ingredientMap = new Map<string, Set<string>>();

    for (const day of weekPlan.days) {
      for (const meal of day.meals) {
        let mealIngredients: string[] = [];
        let mealTitle = '';

        if (meal.recipeId) {
          const recipe = recipes.find(r => r.id === meal.recipeId);
          if (recipe) {
            mealIngredients = recipe.ingredients;
            mealTitle = recipe.title;
          }
        } else if (meal.recipeTitleFallback) {
          const suggested = suggestedRecipes[meal.recipeTitleFallback];
          if (suggested) {
            mealIngredients = suggested.ingredients;
            mealTitle = suggested.title;
          }
        }

        for (const ingredient of mealIngredients) {
          const normalized = ingredient.trim();
          if (!normalized) continue;
          if (!ingredientMap.has(normalized)) {
            ingredientMap.set(normalized, new Set());
          }
          if (mealTitle) {
            ingredientMap.get(normalized)!.add(mealTitle);
          }
        }
      }
    }

    const result: ShoppingItem[] = [];
    for (const [ingredient, recipeSet] of ingredientMap) {
      result.push({ ingredient, recipes: Array.from(recipeSet) });
    }
    return result.sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  }, [weekPlan, recipes, suggestedRecipes]);

  const toggleItem = (ingredient: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  };

  const toggleConsolidatedItem = (key: string) => {
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

  const handleConsolidate = async () => {
    setConsolidating(true);
    try {
      const response = await fetch('/api/consolidate-shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: items.map(i => i.ingredient),
          userId,
          anonymousId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to consolidate');
      }

      const data = await response.json();
      setConsolidated(data.categories);
      setConsolidatedChecked(new Set());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to consolidate shopping list', 'error');
    } finally {
      setConsolidating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    let text = '';

    if (consolidated) {
      for (const category of consolidated) {
        text += `${category.name}\n`;
        for (const item of category.items) {
          const key = `${category.name}:${item}`;
          const checked = consolidatedChecked.has(key);
          text += `  ${checked ? '[x]' : '[ ]'} ${item}\n`;
        }
        text += '\n';
      }
    } else {
      text = 'Shopping List\n\n';
      for (const item of items) {
        const checked = checkedItems.has(item.ingredient);
        text += `${checked ? '[x]' : '[ ]'} ${item.ingredient}\n`;
      }
    }

    try {
      await navigator.clipboard.writeText(text.trim());
      showToast('Shopping list copied to clipboard!');
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const checkedCount = consolidated
    ? consolidatedChecked.size
    : checkedItems.size;
  const totalCount = consolidated
    ? consolidated.reduce((sum, cat) => sum + cat.items.length, 0)
    : items.length;

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
              <p className="text-sm text-muted">
                {checkedCount} of {totalCount} items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyToClipboard}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4 text-muted" />
            </button>
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

        {/* Consolidate with AI button */}
        {items.length > 0 && !consolidated && (
          <button
            onClick={handleConsolidate}
            disabled={consolidating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-50 border border-primary/20 text-primary font-medium text-sm hover:from-primary/15 hover:to-emerald-100 transition-all disabled:opacity-60"
          >
            {consolidating ? (
              <><LoadingSpinner size="sm" /> Consolidating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Consolidate & Organize with AI</>
            )}
          </button>
        )}

        {/* Back to raw list button */}
        {consolidated && (
          <button
            onClick={() => setConsolidated(null)}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to raw list
          </button>
        )}

        {/* Item list */}
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No ingredients found in your meal plan.</p>
          </div>
        ) : consolidated ? (
          /* Consolidated categorized view */
          <div className="space-y-4 max-h-[60vh] overflow-y-auto -mx-1 px-1">
            {consolidated.map(category => (
              <div key={category.name}>
                <h3 className="text-sm font-semibold text-foreground mb-1.5 px-1">{category.name}</h3>
                <div className="space-y-0.5">
                  {category.items.map(item => {
                    const key = `${category.name}:${item}`;
                    const checked = consolidatedChecked.has(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleConsolidatedItem(key)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-200 ${
                          checked ? 'bg-emerald-50/50' : 'hover:bg-surface'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          checked ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm transition-all ${
                          checked ? 'text-muted line-through' : 'text-foreground'
                        }`}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Raw ingredient list */
          <div className="space-y-1 max-h-[60vh] overflow-y-auto -mx-1 px-1">
            {items.map(item => {
              const checked = checkedItems.has(item.ingredient);
              return (
                <button
                  key={item.ingredient}
                  onClick={() => toggleItem(item.ingredient)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    checked
                      ? 'bg-emerald-50/50'
                      : 'hover:bg-surface'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  }`}>
                    {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-all ${
                      checked ? 'text-muted line-through' : 'text-foreground'
                    }`}>
                      {item.ingredient}
                    </p>
                    {item.recipes.length > 0 && (
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {item.recipes.join(', ')}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
