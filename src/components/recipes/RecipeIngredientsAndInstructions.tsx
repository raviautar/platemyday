'use client';

interface RecipeIngredientsAndInstructionsProps {
  ingredients: string[];
  instructions: string[];
}

export function RecipeIngredientsAndInstructions({ ingredients, instructions }: RecipeIngredientsAndInstructionsProps) {
  const hasIngredients = ingredients.length > 0;
  const hasInstructions = instructions.length > 0;

  if (!hasIngredients && !hasInstructions) {
    return null;
  }

  return (
    <>
      {hasIngredients && (
        <div className="space-y-1">
          <h4 className="font-semibold text-base text-foreground flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            Ingredients
          </h4>
          <div className="bg-white/60 rounded-lg p-4 border border-border/40">
            <ul className="space-y-2">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <span className="text-primary text-xs font-semibold">{i + 1}</span>
                  </span>
                  <span className="flex-1 leading-relaxed">{ing}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {hasInstructions && (
        <div className="space-y-1">
          <h4 className="font-semibold text-base text-foreground flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            Instructions
          </h4>
          <div className="bg-white/60 rounded-lg p-4 border border-border/40">
            <ol className="space-y-3">
              {instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-xs mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
