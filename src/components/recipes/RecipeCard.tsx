'use client';

import { memo } from 'react';
import { Recipe } from '@/types';
import { getTagDotColor } from '@/lib/tag-colors';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

const RecipeCardComponent = ({ recipe, onSelect }: RecipeCardProps) => {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <button
      onClick={() => onSelect(recipe)}
      className="w-full text-left bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <h3 className="font-semibold text-foreground line-clamp-1">{recipe.title}</h3>
      <p className="text-sm text-muted mt-1 line-clamp-2">{recipe.description}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted">
        {totalTime > 0 && <span>{totalTime} min</span>}
        {recipe.servings > 0 && <span>{recipe.servings} servings</span>}
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
};

export const RecipeCard = memo(RecipeCardComponent);
