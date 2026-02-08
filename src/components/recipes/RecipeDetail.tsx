'use client';

import { Recipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeDetail({ recipe, isOpen, onClose, onEdit, onDelete }: RecipeDetailProps) {
  if (!recipe) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recipe.title}>
      <div className="space-y-4">
        {recipe.isAIGenerated && (
          <span className="inline-block text-xs bg-accent/20 text-accent-dark px-2 py-0.5 rounded-full">
            AI Generated
          </span>
        )}

        <p className="text-muted">{recipe.description}</p>

        <div className="flex gap-4 text-sm text-muted">
          {recipe.prepTimeMinutes > 0 && <span>Prep: {recipe.prepTimeMinutes} min</span>}
          {recipe.cookTimeMinutes > 0 && <span>Cook: {recipe.cookTimeMinutes} min</span>}
          {recipe.servings > 0 && <span>Servings: {recipe.servings}</span>}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map(tag => (
              <span key={tag} className="text-xs bg-surface px-2 py-0.5 rounded-full text-primary-dark">{tag}</span>
            ))}
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Ingredients</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Instructions</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {recipe.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="ghost" onClick={() => onEdit(recipe)}>Edit</Button>
          <Button variant="danger" onClick={() => { onDelete(recipe.id); onClose(); }}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}
