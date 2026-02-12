'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { WeekPlan, Recipe, SuggestedRecipe } from '@/types';
import { Check, ShoppingCart } from 'lucide-react';

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

export function ShoppingList({ isOpen, onClose, weekPlan, recipes, suggestedRecipes }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

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

  const checkedCount = checkedItems.size;
  const totalCount = items.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Shopping List</h2>
              <p className="text-sm text-muted">
                {checkedCount} of {totalCount} items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl leading-none p-1"
          >
            &times;
          </button>
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

        {/* Item list */}
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No ingredients found in your meal plan.</p>
          </div>
        ) : (
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
