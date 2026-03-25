'use client';

import { Recipe } from '@/types';
import { getTagBadgeColor } from '@/lib/tag-colors';
import { Clock, Flame, Sparkles, Users } from 'lucide-react';

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
      className={`w-full text-left group rounded-2xl border bg-white hover:bg-surface/30 transition-all duration-200 relative overflow-hidden ${
        isNew ? 'border-primary/30 shadow-sm shadow-primary/10' : 'border-border/50 hover:border-primary/20'
      }`}
    >
      <div className="p-4">
        {isNew && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md mb-2">
            <Sparkles className="w-2.5 h-2.5" />
            New
          </span>
        )}
        <h3 className="font-semibold text-foreground line-clamp-1 text-[15px] group-hover:text-primary transition-colors">{recipe.title}</h3>
        {recipe.description && (
          <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 mt-3">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Clock className="w-3 h-3" />
              {totalTime}m
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Users className="w-3 h-3" />
              {recipe.servings}
            </span>
          )}
          {recipe.estimatedNutrition?.calories && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Flame className="w-3 h-3" />
              {recipe.estimatedNutrition.calories}
            </span>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {recipe.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${getTagBadgeColor(tag)}`}
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface text-muted">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
