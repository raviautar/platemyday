'use client';

import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground line-clamp-1">{recipe.title}</h3>
        {recipe.isAIGenerated && (
          <span className="shrink-0 text-xs bg-accent/20 text-accent-dark px-2 py-0.5 rounded-full">AI</span>
        )}
      </div>
      <p className="text-sm text-muted mt-1 line-clamp-2">{recipe.description}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted">
        {totalTime > 0 && <span>{totalTime} min</span>}
        {recipe.servings > 0 && <span>{recipe.servings} servings</span>}
      </div>
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {recipe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-surface px-2 py-0.5 rounded-full text-primary-dark">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
