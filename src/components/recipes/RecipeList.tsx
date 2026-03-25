'use client';

import { Recipe, RecipeFilters } from '@/types';
import { RecipeCard } from './RecipeCard';
import { Button } from '@/components/ui/Button';
import { Sparkles, Wand2 } from 'lucide-react';

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
    <div className="w-full rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Wand2 className="w-3 h-3 text-primary" />
          </div>
        </div>
        <span className="text-sm font-medium text-primary">Creating recipe...</span>
      </div>
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-primary/10 rounded-lg w-3/4"></div>
        <div className="h-3 bg-primary/5 rounded-lg w-full"></div>
        <div className="h-3 bg-primary/5 rounded-lg w-2/3"></div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="h-3 bg-primary/5 rounded-lg w-12"></div>
        <div className="h-3 bg-primary/5 rounded-lg w-16"></div>
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
        <div className="text-center py-12">
          <p className="text-muted text-sm">No recipes match your search.</p>
        </div>
      )}

      {recipes.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-1.5">No recipes yet</h2>
          <p className="text-sm text-muted text-center max-w-xs mb-6">
            Describe any dish or list some ingredients and get a complete recipe in seconds.
          </p>

          <Button variant="primary" size="lg" onClick={onCreateRecipe} className="rounded-xl px-6">
            <Wand2 className="w-5 h-5 mr-2" />
            Create your first recipe
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
