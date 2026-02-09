'use client';

import { useState, useEffect, useRef } from 'react';
import { MealSlot, Recipe, SuggestedRecipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRecipes } from '@/contexts/RecipeContext';
import { Sparkles } from 'lucide-react';
import { StreamingRecipeDetail } from './StreamingRecipeDetail';

interface MealDetailProps {
  meal: MealSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToLibrary?: (meal: MealSlot) => void;
  suggestedRecipe?: SuggestedRecipe;
  onAddToLibraryNew?: (recipe: SuggestedRecipe) => void;
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

export function MealDetail({ meal, isOpen, onClose, onAddToLibrary, suggestedRecipe, onAddToLibraryNew }: MealDetailProps) {
  const { getRecipe } = useRecipes();
  const cachedRecipeRef = useRef<SuggestedRecipe | undefined>(undefined);
  const wasOpenRef = useRef(false);

  if (suggestedRecipe && isOpen) {
    cachedRecipeRef.current = suggestedRecipe;
  }

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      setTimeout(() => {
        if (!wasOpenRef.current) {
          cachedRecipeRef.current = undefined;
        }
      }, 300);
    }
  }, [isOpen]);

  if (!meal) return null;

  const activeSuggestedRecipe = suggestedRecipe || (isOpen ? cachedRecipeRef.current : undefined);

  if (activeSuggestedRecipe) {
    return (
      <StreamingRecipeDetail
        meal={meal}
        suggestedRecipe={activeSuggestedRecipe}
        isOpen={isOpen}
        onClose={onClose}
        onAddToLibrary={onAddToLibraryNew}
      />
    );
  }

  const recipe = meal.recipeId ? getRecipe(meal.recipeId) : undefined;
  const isUnmatched = meal.recipeTitleFallback !== undefined;
  const title = isUnmatched ? meal.recipeTitleFallback : (recipe?.title || 'Unknown Recipe');

  if (isUnmatched) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title || 'New Recipe'}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </span>
            <span className="text-xs bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full capitalize">
              {meal.mealType}
            </span>
          </div>

          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <p className="text-sm text-muted mb-3">
              This recipe was suggested by AI but doesn&apos;t exist in your library yet. Add it to your library to edit and fill in the details.
            </p>
            {onAddToLibrary && (
              <Button onClick={() => { onAddToLibrary(meal); onClose(); }} size="sm">
                Add to Recipe Library
              </Button>
            )}
          </div>

          <p className="text-muted text-sm">
            Once added, you can edit the recipe to include ingredients, instructions, prep time, and more.
          </p>
        </div>
      </Modal>
    );
  }

  if (!recipe) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Recipe Not Found">
        <div className="space-y-4">
          <p className="text-muted">This recipe could not be found in your library.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recipe.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {recipe.isAIGenerated && (
            <span className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent-dark px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </span>
          )}
          <span className="text-xs bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full capitalize">
            {meal.mealType}
          </span>
        </div>

        <p className="text-muted">{recipe.description}</p>

        <div className="flex gap-4 text-sm text-muted">
          {recipe.servings > 0 && <span>Servings: {recipe.servings}</span>}
          {recipe.prepTimeMinutes > 0 && <span>Prep: {recipe.prepTimeMinutes} min</span>}
          {recipe.cookTimeMinutes > 0 && <span>Cook: {recipe.cookTimeMinutes} min</span>}
        </div>

        {recipe.tags.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {recipe.tags.map(tag => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {recipe.ingredients.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Ingredients</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Instructions</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {recipe.ingredients.length === 0 && recipe.instructions.length === 0 && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <p className="text-sm text-muted">
              This recipe doesn&apos;t have ingredients or instructions yet. Edit it in your Recipe Library to add details.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
