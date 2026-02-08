'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { RecipeCard } from './RecipeCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sparkles, ChefHat } from 'lucide-react';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onCreateRecipe: () => void;
}

export function RecipeList({ recipes, onSelectRecipe, onCreateRecipe }: RecipeListProps) {
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
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-6 rounded-full">
              <ChefHat className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">Your Recipe Collection Awaits</h2>
          <p className="text-muted text-center max-w-md mb-6">
            Describe any dish and get a complete recipe instantly.
          </p>
          
          <Button variant="primary" size="lg" onClick={onCreateRecipe}>
            <Sparkles className="w-5 h-5 mr-2" />
            Create Recipe
          </Button>
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
