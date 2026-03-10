'use client';

import { Recipe } from '@/types';
import { getTagDotColor } from '@/lib/tag-colors';
import { Flame, Sparkles } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  isNew?: boolean;
}

export function RecipeCard({ recipe, onClick, isNew }: RecipeCardProps) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-md hover:border-primary/30 transition-all relative ${
        isNew ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border'
      }`}
    >
      {isNew && (
        <span className="absolute -top-2 -right-2 inline-flex items-center gap-0.5 text-[10px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full shadow-sm">
          <Sparkles className="w-2.5 h-2.5" />
          New
        </span>
      )}
      <h3 className="font-semibold text-foreground line-clamp-1">{recipe.title}</h3>
      <p className="text-sm text-muted mt-1 line-clamp-2">{recipe.description}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted">
        {totalTime > 0 && <span>{totalTime} min</span>}
        {recipe.servings > 0 && <span>{recipe.servings} servings</span>}
        {recipe.estimatedNutrition?.calories && (
          <span className="flex items-center gap-0.5">
            <Flame className="w-3 h-3" />
            {recipe.estimatedNutrition.calories} cal
          </span>
        )}
      </div>
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {recipe.tags.map(tag => (
            <span
              key={tag}
              className={`w-2 h-2 rounded-full ${getTagDotColor(tag)}`}
              title={tag}
              aria-label={tag}
            />
          ))}
        </div>
      )}
    </button>
  );
}
