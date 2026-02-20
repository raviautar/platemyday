'use client';

import { MealSlot, SuggestedRecipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NutritionGrid } from '@/components/ui/NutritionGrid';
import { useRecipes } from '@/contexts/RecipeContext';
import { Sparkles, Heart, Pencil } from 'lucide-react';
import { RecipeIngredientsAndInstructions } from '@/components/recipes/RecipeIngredientsAndInstructions';
import { getTagBadgeColor } from '@/lib/tag-colors';

interface MealDetailProps {
  meal: MealSlot | null;
  isOpen: boolean;
  onClose: () => void;
  suggestedRecipe?: SuggestedRecipe;
  onAddToLibrary?: (recipe: SuggestedRecipe) => void;
  onEdit?: () => void;
}

export function MealDetail({ meal, isOpen, onClose, suggestedRecipe, onAddToLibrary, onEdit }: MealDetailProps) {
  const { getRecipe } = useRecipes();

  if (!meal) return null;

  // Show suggested recipe detail (generated, not yet in library)
  if (suggestedRecipe) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={suggestedRecipe.title} fullscreen>
        <div className="bg-gradient-to-br from-white to-surface/50 rounded-xl border border-border/60 shadow-lg overflow-hidden flex flex-col max-h-full">
          <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-4 py-4 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3" />
                Generated
              </span>
              <span className="text-[10px] bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                {meal.mealType}
              </span>
            </div>

            {onAddToLibrary && (
              <Button onClick={() => { onAddToLibrary(suggestedRecipe); onClose(); }} size="sm" className="w-full gap-2 text-sm py-1.5 h-auto mb-3">
                <Heart className="w-4 h-4" />
                Save to Library
              </Button>
            )}

            {suggestedRecipe.description && (
              <p className="text-sm text-muted leading-snug">{suggestedRecipe.description}</p>
            )}
          </div>

          <div className="px-4 py-4 space-y-5 overflow-y-auto w-full">
            {(suggestedRecipe.prepTimeMinutes !== undefined ||
              suggestedRecipe.cookTimeMinutes !== undefined ||
              suggestedRecipe.servings !== undefined) && (
                <div className="flex flex-wrap gap-2">
                  {suggestedRecipe.prepTimeMinutes !== undefined && (
                    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Prep</span>
                        <span className="text-xs font-semibold text-foreground">{suggestedRecipe.prepTimeMinutes}m</span>
                      </div>
                    </div>
                  )}
                  {suggestedRecipe.cookTimeMinutes !== undefined && (
                    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Cook</span>
                        <span className="text-xs font-semibold text-foreground">{suggestedRecipe.cookTimeMinutes}m</span>
                      </div>
                    </div>
                  )}
                  {suggestedRecipe.servings !== undefined && (
                    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Serves</span>
                        <span className="text-xs font-semibold text-foreground">{suggestedRecipe.servings}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {suggestedRecipe.estimatedNutrition && (
              <NutritionGrid nutrition={suggestedRecipe.estimatedNutrition} />
            )}

            {suggestedRecipe.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedRecipe.tags.map(tag => (
                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full ${getTagBadgeColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(suggestedRecipe.ingredients.length > 0 || suggestedRecipe.instructions.length > 0) && (
              <RecipeIngredientsAndInstructions
                ingredients={suggestedRecipe.ingredients}
                instructions={suggestedRecipe.instructions}
              />
            )}

          </div>
        </div>
      </Modal>
    );
  }

  const recipe = meal.recipeId ? getRecipe(meal.recipeId) : undefined;
  const isUnmatched = meal.recipeTitleFallback !== undefined;
  const title = isUnmatched ? meal.recipeTitleFallback : (recipe?.title || 'Unknown Recipe');

  if (isUnmatched) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title || 'New Recipe'} fullscreen>
        <div className="bg-gradient-to-br from-white to-surface/50 rounded-xl border border-border/60 shadow-lg overflow-hidden flex flex-col max-h-full">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3" />
                Generated
              </span>
              <span className="text-[10px] bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                {meal.mealType}
              </span>
            </div>

            <div className="bg-secondary/10 border border-secondary rounded-lg p-3">
              <p className="text-sm text-muted">
                This is a suggested recipe. Recipe details are not available.
              </p>
            </div>
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
    <Modal isOpen={isOpen} onClose={onClose} title={recipe.title} fullscreen>
      <div className="bg-gradient-to-br from-white to-surface/50 rounded-xl border border-border/60 shadow-lg overflow-hidden flex flex-col max-h-full">
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-4 py-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            {recipe.isAIGenerated && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-accent/20 text-accent-dark px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3" />
                Generated
              </span>
            )}
            <span className="text-[10px] bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              {meal.mealType}
            </span>
          </div>

          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => { onEdit(); onClose(); }} className="w-full gap-2 text-sm py-1.5 h-auto mb-3">
              <Pencil className="w-4 h-4" />
              Edit Recipe
            </Button>
          )}

          <p className="text-sm text-muted leading-snug">{recipe.description}</p>
        </div>

        <div className="px-4 py-4 space-y-5 overflow-y-auto w-full">
          <div className="flex flex-wrap gap-2">
            {recipe.prepTimeMinutes > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Prep</span>
                  <span className="text-xs font-semibold text-foreground">{recipe.prepTimeMinutes}m</span>
                </div>
              </div>
            )}
            {recipe.cookTimeMinutes > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Cook</span>
                  <span className="text-xs font-semibold text-foreground">{recipe.cookTimeMinutes}m</span>
                </div>
              </div>
            )}
            {recipe.servings > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Serves</span>
                  <span className="text-xs font-semibold text-foreground">{recipe.servings}</span>
                </div>
              </div>
            )}
          </div>

          {meal.estimatedNutrition && (
            <NutritionGrid nutrition={meal.estimatedNutrition} />
          )}

          {recipe.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2.5 py-1 rounded-full ${getTagBadgeColor(tag)}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(recipe.ingredients.length > 0 || recipe.instructions.length > 0) && (
            <RecipeIngredientsAndInstructions
              ingredients={recipe.ingredients}
              instructions={recipe.instructions}
            />
          )}

          {recipe.ingredients.length === 0 && recipe.instructions.length === 0 && (
            <div className="bg-secondary/10 border border-secondary rounded-lg p-3">
              <p className="text-sm text-muted">
                This recipe doesn&apos;t have ingredients or instructions yet. Edit it in your Recipe Library to add details.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
