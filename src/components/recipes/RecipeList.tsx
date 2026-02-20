'use client';

import { Recipe, RecipeFilters } from '@/types';
import { RecipeCard } from './RecipeCard';
import { Button } from '@/components/ui/Button';
import { Sparkles, ChefHat } from 'lucide-react';

interface RecipeListProps {
  recipes: Recipe[];
  searchQuery: string;
  filters: RecipeFilters;
  isGenerating?: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  onCreateRecipe: () => void;
}

export function RecipeList({ recipes, searchQuery, filters, isGenerating, onSelectRecipe, onCreateRecipe }: RecipeListProps) {
  const filtered = recipes.filter(r => {
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = filters.tags.length === 0 || filters.tags.some(tag => r.tags.includes(tag));
    const matchesPrepTime =
      filters.maxPrepTimeMinutes == null || r.prepTimeMinutes <= filters.maxPrepTimeMinutes;
    return matchesSearch && matchesTags && matchesPrepTime;
  });

  return (
    <div className="space-y-4">
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
        {isGenerating && (
          <div className="w-full bg-gradient-to-r from-surface to-white rounded-xl border border-primary/20 p-4 shadow-sm animate-pulse flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="w-4 h-4 text-primary animate-bounce flex-shrink-0" />
                <div className="h-5 bg-primary/20 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-surface-dark/40 rounded w-3/4 mt-2"></div>
              <div className="h-3 bg-surface-dark/40 rounded w-2/3 mt-1.5"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/30"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary/30"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary/30"></div>
            </div>
          </div>
        )}
        {filtered.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe)} />
        ))}
      </div>
    </div>
  );
}
