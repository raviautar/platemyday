'use client';

import { useState } from 'react';
import { Recipe, SuggestedRecipe, MealSlot, NutritionInfo } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NutritionGrid } from '@/components/ui/NutritionGrid';
import { useRecipes } from '@/contexts/RecipeContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useToast } from '@/components/ui/Toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { Sparkles, Heart, Trash2, Send, Loader2 } from 'lucide-react';
import { RecipeIngredientsAndInstructions } from '@/components/recipes/RecipeIngredientsAndInstructions';
import { getTagBadgeColor } from '@/lib/tag-colors';

interface RecipeDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  recipe?: Recipe | null;
  suggestedRecipe?: SuggestedRecipe | null;
  mealSlot?: MealSlot | null;
  onDelete?: (id: string) => void;
  onAddToLibrary?: (recipe: SuggestedRecipe) => void;
  onRecipeUpdated?: (recipeId: string, updates: Partial<Recipe> & { estimatedNutrition?: NutritionInfo }) => void;
}

export function RecipeDetailView({
  isOpen,
  onClose,
  recipe: propRecipe,
  suggestedRecipe,
  mealSlot,
  onDelete,
  onAddToLibrary,
  onRecipeUpdated,
}: RecipeDetailViewProps) {
  const { getRecipe } = useRecipes();
  const { userId, anonymousId } = useUserIdentity();
  const { showToast } = useToast();
  const { track } = useAnalytics();
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Resolve the recipe from context if we have a meal slot with a recipeId
  const recipe = propRecipe ?? (mealSlot?.recipeId ? getRecipe(mealSlot.recipeId) : undefined) ?? null;

  // Determine what we're showing
  const isSuggested = !!suggestedRecipe;
  const isUnmatched = !isSuggested && !recipe && !!mealSlot?.recipeTitleFallback;
  const isLibraryRecipe = !!recipe;

  // Resolve display data
  const title = isSuggested
    ? suggestedRecipe!.title
    : isUnmatched
      ? mealSlot!.recipeTitleFallback!
      : recipe?.title || 'Unknown Recipe';

  const description = isSuggested ? suggestedRecipe!.description : recipe?.description;
  const ingredients = isSuggested ? suggestedRecipe!.ingredients : recipe?.ingredients || [];
  const instructions = isSuggested ? suggestedRecipe!.instructions : recipe?.instructions || [];
  const tags = isSuggested ? suggestedRecipe!.tags : recipe?.tags || [];
  const prepTime = isSuggested ? suggestedRecipe!.prepTimeMinutes : recipe?.prepTimeMinutes;
  const cookTime = isSuggested ? suggestedRecipe!.cookTimeMinutes : recipe?.cookTimeMinutes;
  const servings = isSuggested ? suggestedRecipe!.servings : recipe?.servings;
  const nutrition = isSuggested
    ? suggestedRecipe!.estimatedNutrition
    : recipe?.estimatedNutrition || mealSlot?.estimatedNutrition;
  const isAIGenerated = isSuggested || recipe?.isAIGenerated;

  const handleEditSubmit = async () => {
    if (!editPrompt.trim() || !recipe || isEditing) return;

    setIsEditing(true);
    track(EVENTS.RECIPE_EDITED, {
      recipe_title: recipe.title,
      prompt_length: editPrompt.trim().length,
    });

    try {
      const response = await fetch('/api/edit-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRecipe: {
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            servings: recipe.servings,
            prepTimeMinutes: recipe.prepTimeMinutes,
            cookTimeMinutes: recipe.cookTimeMinutes,
            tags: recipe.tags,
            estimatedNutrition: recipe.estimatedNutrition,
          },
          editPrompt: editPrompt.trim(),
          userId: userId ?? undefined,
          anonymousId: anonymousId ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update recipe');
      }

      const updatedRecipe = await response.json();

      onRecipeUpdated?.(recipe.id, {
        title: updatedRecipe.title,
        description: updatedRecipe.description,
        ingredients: updatedRecipe.ingredients,
        instructions: updatedRecipe.instructions,
        servings: updatedRecipe.servings,
        prepTimeMinutes: updatedRecipe.prepTimeMinutes,
        cookTimeMinutes: updatedRecipe.cookTimeMinutes,
        tags: updatedRecipe.tags,
        estimatedNutrition: updatedRecipe.estimatedNutrition,
      });

      setEditPrompt('');
      showToast('Recipe updated!');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update recipe. Please try again!',
        'error'
      );
    } finally {
      setIsEditing(false);
    }
  };

  if (!mealSlot && !propRecipe && !suggestedRecipe) return null;

  // Unmatched meal (title fallback only, no full recipe data)
  if (isUnmatched) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title} fullscreen>
        <div className="bg-gradient-to-br from-white to-surface/50 md:rounded-xl md:border md:border-border/60 md:shadow-lg overflow-hidden">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3" />
                Generated
              </span>
              {mealSlot && (
                <span className="text-[10px] bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  {mealSlot.mealType}
                </span>
              )}
            </div>

            {mealSlot?.estimatedNutrition && (
              <NutritionGrid nutrition={mealSlot.estimatedNutrition} />
            )}

            <div className="bg-surface/50 border border-border/40 rounded-lg p-3">
              <p className="text-sm text-muted">
                Full recipe details will appear after your next plan generation.
                You can also regenerate this meal to see complete ingredients and instructions.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // Recipe not found
  if (!recipe && !suggestedRecipe) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Recipe Not Found">
        <div className="space-y-4">
          <p className="text-muted">This recipe could not be found in your library.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} fullscreen>
      <div className="bg-gradient-to-br from-white to-surface/50 md:rounded-xl md:border md:border-border/60 md:shadow-lg overflow-hidden flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-5 w-full">
            {/* Header with badges and actions */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent -mx-4 px-4 py-4 border-b border-border/40">
              <div className="flex items-center gap-2 mb-3">
                {isAIGenerated && (
                  <span className={`inline-flex items-center gap-1 text-[10px] ${isSuggested ? 'bg-secondary/20 text-secondary-dark' : 'bg-accent/20 text-accent-dark'} px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold`}>
                    <Sparkles className="w-3 h-3" />
                    Generated
                  </span>
                )}
                {mealSlot && (
                  <span className="text-[10px] bg-secondary/30 text-yellow-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                    {mealSlot.mealType}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-3">
                {isSuggested && onAddToLibrary && (
                  <Button onClick={() => { onAddToLibrary(suggestedRecipe!); onClose(); }} size="sm" className="flex-1 gap-2 text-sm py-1.5 h-auto">
                    <Heart className="w-4 h-4" />
                    Save to Library
                  </Button>
                )}
                {isLibraryRecipe && onDelete && (
                  <Button variant="danger" size="sm" onClick={() => { onDelete(recipe!.id); onClose(); }} className="gap-2 text-sm py-1.5 h-auto">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )}
              </div>

              {description && (
                <p className="text-sm text-muted leading-snug">{description}</p>
              )}
            </div>

            {/* Time & servings badges */}
            {(prepTime || cookTime || servings) && (
              <div className="flex flex-wrap gap-2">
                {!!prepTime && (
                  <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Prep</span>
                      <span className="text-xs font-semibold text-foreground">{prepTime}m</span>
                    </div>
                  </div>
                )}
                {!!cookTime && (
                  <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Cook</span>
                      <span className="text-xs font-semibold text-foreground">{cookTime}m</span>
                    </div>
                  </div>
                )}
                {!!servings && (
                  <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Serves</span>
                      <span className="text-xs font-semibold text-foreground">{servings}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nutrition grid */}
            {nutrition && <NutritionGrid nutrition={nutrition} />}

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full ${getTagBadgeColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients & Instructions */}
            {(ingredients.length > 0 || instructions.length > 0) && (
              <RecipeIngredientsAndInstructions
                ingredients={ingredients}
                instructions={instructions}
              />
            )}

            {/* Empty recipe warning */}
            {isLibraryRecipe && ingredients.length === 0 && instructions.length === 0 && (
              <div className="bg-secondary/10 border border-secondary rounded-lg p-3">
                <p className="text-sm text-muted">
                  This recipe doesn&apos;t have ingredients or instructions yet. Use the update field below to add details.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Prompt edit bar — only for library recipes */}
        {isLibraryRecipe && onRecipeUpdated && (
          <div className="sticky bottom-0 bg-white border-t border-border/60 px-4 py-3 safe-area-bottom">
            <div className="flex gap-2">
              <input
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                placeholder="e.g., Add more cheese, make it vegetarian..."
                disabled={isEditing}
                className="flex-1 text-sm px-3 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              />
              <Button
                size="sm"
                onClick={handleEditSubmit}
                disabled={!editPrompt.trim() || isEditing}
                className="gap-1.5 px-4"
              >
                {isEditing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Update
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
