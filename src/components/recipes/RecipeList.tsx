'use client';

import { Recipe, RecipeFilters } from '@/types';
import { RecipeCard } from './RecipeCard';
import { Button } from '@/components/ui/Button';
import { Sparkles, ChefHat } from 'lucide-react';

interface RecipeListProps {
  recipes: Recipe[];
  searchQuery: string;
  filters: RecipeFilters;
  onSelectRecipe: (recipe: Recipe) => void;
  onCreateRecipe: () => void;
  isGenerating?: boolean;
  unseenRecipeIds?: Set<string>;
}

function GeneratingPlaceholderCard() {
  return (
    <div className="w-full bg-white rounded-xl border-2 border-dashed border-primary/40 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-1.5 rounded-full">
          <ChefHat className="w-4 h-4 text-primary animate-bounce" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium text-primary">Creating your recipe...</span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-surface rounded w-3/4"></div>
        <div className="h-3 bg-surface rounded w-full"></div>
        <div className="h-3 bg-surface rounded w-2/3"></div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="h-3 bg-surface rounded w-12"></div>
        <div className="h-3 bg-surface rounded w-16"></div>
      </div>
    </div>
  );
}

export function RecipeList({ recipes, searchQuery, filters, onSelectRecipe, onCreateRecipe, isGenerating, unseenRecipeIds }: RecipeListProps) {
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
      {filtered.length === 0 && recipes.length > 0 && !isGenerating && (
        <p className="text-center text-muted py-8">No recipes match your search.</p>
      )}

      {recipes.length === 0 && !isGenerating && (
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
        {isGenerating && <GeneratingPlaceholderCard />}
        {filtered.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => onSelectRecipe(recipe)}
            isNew={unseenRecipeIds?.has(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
}
