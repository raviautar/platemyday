'use client';

import { SuggestedRecipe, MealSlot } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Sparkles } from 'lucide-react';

interface StreamingRecipeDetailProps {
  meal: MealSlot;
  suggestedRecipe: SuggestedRecipe;
  isOpen: boolean;
  onClose: () => void;
  onAddToLibrary?: (recipe: SuggestedRecipe) => void;
}

const tagColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-yellow-100 text-yellow-700',
  'bg-red-100 text-red-700',
  'bg-indigo-100 text-indigo-700',
];

function getTagColor(tag: string): string {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tagColors[hash % tagColors.length];
}

export function StreamingRecipeDetail({
  meal,
  suggestedRecipe,
  isOpen,
  onClose,
  onAddToLibrary,
}: StreamingRecipeDetailProps) {
  const isComplete = !suggestedRecipe.isLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={suggestedRecipe.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </span>
          <span className="text-xs bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full capitalize">
            {meal.mealType}
          </span>
          {suggestedRecipe.isLoading && (
            <span className="text-xs text-muted flex items-center gap-1">
              <LoadingSpinner size="sm" />
              Generating...
            </span>
          )}
        </div>

        {suggestedRecipe.description ? (
          <p className="text-muted">{suggestedRecipe.description}</p>
        ) : suggestedRecipe.isLoading ? (
          <div className="animate-pulse bg-surface h-12 rounded" />
        ) : (
          <p className="text-muted text-sm italic">No description available</p>
        )}

        {(suggestedRecipe.prepTimeMinutes !== undefined || 
          suggestedRecipe.cookTimeMinutes !== undefined || 
          suggestedRecipe.servings !== undefined) && (
          <div className="flex gap-4 text-sm text-muted">
            {suggestedRecipe.servings !== undefined && <span>Servings: {suggestedRecipe.servings}</span>}
            {suggestedRecipe.prepTimeMinutes !== undefined && <span>Prep: {suggestedRecipe.prepTimeMinutes} min</span>}
            {suggestedRecipe.cookTimeMinutes !== undefined && <span>Cook: {suggestedRecipe.cookTimeMinutes} min</span>}
          </div>
        )}

        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            Tags
            {suggestedRecipe.isLoading && <LoadingSpinner size="sm" />}
          </h4>
          {suggestedRecipe.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {suggestedRecipe.tags.map(tag => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : suggestedRecipe.isLoading ? (
            <div className="flex gap-1">
              <div className="animate-pulse bg-surface h-6 w-16 rounded-full" />
              <div className="animate-pulse bg-surface h-6 w-20 rounded-full" />
              <div className="animate-pulse bg-surface h-6 w-14 rounded-full" />
            </div>
          ) : (
            <p className="text-xs text-muted italic">No tags</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            Ingredients
            {suggestedRecipe.isLoading && <LoadingSpinner size="sm" />}
          </h4>
          {suggestedRecipe.ingredients.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {suggestedRecipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          ) : suggestedRecipe.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse bg-surface h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted italic">No ingredients available</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            Instructions
            {suggestedRecipe.isLoading && <LoadingSpinner size="sm" />}
          </h4>
          {suggestedRecipe.instructions.length > 0 ? (
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {suggestedRecipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : suggestedRecipe.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-surface h-5 rounded" style={{ width: `${70 + Math.random() * 25}%` }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted italic">No instructions available</p>
          )}
        </div>

        {onAddToLibrary && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <p className="text-sm text-muted mb-3">
              {isComplete 
                ? "This recipe has been fully generated. Add it to your library to save and use it in future meal plans."
                : "Recipe details are still being generated. You can add it to your library once it's complete."}
            </p>
            <Button
              onClick={() => onAddToLibrary(suggestedRecipe)}
              disabled={!isComplete}
              size="sm"
            >
              {isComplete ? 'Add to Recipe Library' : 'Generating...'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
