'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { RecipeCard } from './RecipeCard';
import { Input } from '@/components/ui/Input';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onSelectRecipe }: RecipeListProps) {
  const [search, setSearch] = useState('');

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {recipes.length > 0 && (
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {filtered.length === 0 && recipes.length > 0 && (
        <p className="text-center text-muted py-8">No recipes match your search.</p>
      )}

      {recipes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🍳</p>
          <p className="text-lg font-medium text-foreground">No recipes yet</p>
          <p className="text-muted mt-1">Create your first recipe or generate one with AI!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe)} />
        ))}
      </div>
    </div>
  );
}
