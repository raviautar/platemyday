'use client';

import Link from 'next/link';
import { useRecipes } from '@/contexts/RecipeContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { UnmatchedRecipe } from '@/app/meal-plan/page';

interface UnmatchedRecipesPromptProps {
  unmatchedRecipes: UnmatchedRecipe[];
  onRecipeAdded: (title: string, newRecipeId: string) => void;
}

export function UnmatchedRecipesPrompt({ unmatchedRecipes, onRecipeAdded }: UnmatchedRecipesPromptProps) {
  const { addRecipe } = useRecipes();
  const { showToast } = useToast();

  if (unmatchedRecipes.length === 0) return null;

  const handleAddSingle = (recipe: UnmatchedRecipe) => {
    const newRecipe = addRecipe({
      title: recipe.title,
      description: 'Auto-created from meal plan',
      ingredients: [],
      instructions: [],
      servings: 4,
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      tags: [recipe.mealType],
      isAIGenerated: true,
    });
    
    onRecipeAdded(recipe.title, newRecipe.id);
    showToast(`Added "${recipe.title}" to your recipes. Go to Recipes to edit details.`);
  };

  const handleAddAll = () => {
    unmatchedRecipes.forEach(recipe => {
      const newRecipe = addRecipe({
        title: recipe.title,
        description: 'Auto-created from meal plan',
        ingredients: [],
        instructions: [],
        servings: 4,
        prepTimeMinutes: 0,
        cookTimeMinutes: 0,
        tags: [recipe.mealType],
        isAIGenerated: true,
      });
      onRecipeAdded(recipe.title, newRecipe.id);
    });
    
    showToast(
      `Added ${unmatchedRecipes.length} recipe${unmatchedRecipes.length > 1 ? 's' : ''} to your library. Go to Recipes to edit details.`
    );
  };

  return (
    <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            {unmatchedRecipes.length} New Recipe{unmatchedRecipes.length > 1 ? 's' : ''} Suggested
          </h3>
          <p className="text-sm text-muted">
            These recipes were suggested by AI but don&apos;t exist in your library yet. Add them to edit and fill in details.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/recipes">
            <Button 
              variant="ghost"
              size="sm"
            >
              View Recipes
            </Button>
          </Link>
          <Button 
            onClick={handleAddAll}
            size="sm"
          >
            Add All
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {unmatchedRecipes.map((recipe, index) => (
          <div 
            key={index}
            className="flex items-center justify-between gap-2 bg-white rounded-md p-2 border border-border"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-dark capitalize shrink-0">
                {recipe.mealType}
              </span>
              <span className="text-sm font-medium truncate">{recipe.title}</span>
            </div>
            <Button
              onClick={() => handleAddSingle(recipe)}
              variant="ghost"
              size="sm"
            >
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
