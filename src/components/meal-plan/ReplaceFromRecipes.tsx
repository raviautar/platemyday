'use client';

import { useState } from 'react';
import { useRecipes } from '@/contexts/RecipeContext';
import { Modal } from '@/components/ui/Modal';
import { MealType } from '@/types';
import { Search } from 'lucide-react';

interface ReplaceFromRecipesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipeId: string, recipeTitle: string) => void;
  mealType: MealType;
}

export function ReplaceFromRecipes({ isOpen, onClose, onSelectRecipe, mealType }: ReplaceFromRecipesProps) {
  const { recipes } = useRecipes();
  const [search, setSearch] = useState('');

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (recipeId: string, title: string) => {
    onSelectRecipe(recipeId, title);
    onClose();
    setSearch('');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setSearch(''); }} title={`Replace ${mealType}`}>
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">No recipes found</p>
          ) : (
            filtered.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => handleSelect(recipe.id, recipe.title)}
                className="w-full text-left p-3 rounded-lg hover:bg-surface transition-colors border border-transparent hover:border-border"
              >
                <p className="text-sm font-medium text-foreground">{recipe.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {recipe.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-dark text-muted">
                      {tag}
                    </span>
                  ))}
                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes > 0 && (
                    <span className="text-[10px] text-muted">
                      {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
