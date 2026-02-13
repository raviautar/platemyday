'use client';

import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const tagColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
];

function getTagColor(tag: string): string {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tagColors[hash % tagColors.length];
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <button
      onClick={onClick}
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
              className={`w-2 h-2 rounded-full ${getTagColor(tag)}`}
              title={tag}
              aria-label={tag}
            />
          ))}
        </div>
      )}
    </button>
  );
}
