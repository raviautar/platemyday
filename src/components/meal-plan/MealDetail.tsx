'use client';

import { MealSlot, SuggestedRecipe, NutritionInfo } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRecipes } from '@/contexts/RecipeContext';
import { Sparkles, Heart } from 'lucide-react';

interface MealDetailProps {
  meal: MealSlot | null;
  isOpen: boolean;
  onClose: () => void;
  suggestedRecipe?: SuggestedRecipe;
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

export function MealDetail({ meal, isOpen, onClose, suggestedRecipe, onAddToLibrary }: MealDetailProps) {
  const { getRecipe } = useRecipes();

  if (!meal) return null;

  // Show suggested recipe detail (AI-generated, not yet in library)
  if (suggestedRecipe) {
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
          </div>

          {suggestedRecipe.description && (
            <p className="text-muted">{suggestedRecipe.description}</p>
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

          {suggestedRecipe.estimatedNutrition && (
            <div className="bg-surface rounded-lg p-3">
              <h4 className="font-semibold text-sm mb-2">Estimated Nutrition (per serving)</h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{suggestedRecipe.estimatedNutrition.calories}</p>
                  <p className="text-[10px] text-muted">cal</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{suggestedRecipe.estimatedNutrition.protein}g</p>
                  <p className="text-[10px] text-muted">protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{suggestedRecipe.estimatedNutrition.carbs}g</p>
                  <p className="text-[10px] text-muted">carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-pink-600">{suggestedRecipe.estimatedNutrition.fat}g</p>
                  <p className="text-[10px] text-muted">fat</p>
                </div>
              </div>
            </div>
          )}

          {suggestedRecipe.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {suggestedRecipe.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suggestedRecipe.ingredients.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Ingredients</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {suggestedRecipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestedRecipe.instructions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {suggestedRecipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {onAddToLibrary && (
            <div className="bg-accent/5 border border-accent/30 rounded-lg p-4">
              <p className="text-sm text-muted mb-3">
                Save this recipe to your library to use it in future meal plans.
              </p>
              <Button onClick={() => { onAddToLibrary(suggestedRecipe); onClose(); }} size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                Save to Library
              </Button>
            </div>
          )}
        </div>
      </Modal>
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
            <p className="text-sm text-muted">
              This recipe was suggested by AI. Recipe details are not available.
            </p>
          </div>
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

        {meal.estimatedNutrition && (
          <div className="bg-surface rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Estimated Nutrition (per serving)</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{meal.estimatedNutrition.calories}</p>
                <p className="text-[10px] text-muted">cal</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{meal.estimatedNutrition.protein}g</p>
                <p className="text-[10px] text-muted">protein</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{meal.estimatedNutrition.carbs}g</p>
                <p className="text-[10px] text-muted">carbs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-pink-600">{meal.estimatedNutrition.fat}g</p>
                <p className="text-[10px] text-muted">fat</p>
              </div>
            </div>
          </div>
        )}

        {recipe.tags.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {recipe.tags.map(tag => (
                <span key={tag} className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)}`}>
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
