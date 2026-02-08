'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { X, Plus } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

const tagColors = [
  'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'bg-green-100 text-green-700 hover:bg-green-200',
  'bg-purple-100 text-purple-700 hover:bg-purple-200',
  'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  'bg-red-100 text-red-700 hover:bg-red-200',
  'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
];

function getTagColor(tag: string): string {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tagColors[hash % tagColors.length];
}

export function RecipeDetail({ recipe, isOpen, onClose, onEdit, onDelete }: RecipeDetailProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isEditingTags, setIsEditingTags] = useState(false);

  if (!recipe) return null;

  const currentTags = isEditingTags ? tags : recipe.tags;

  const handleStartEditingTags = () => {
    setTags([...recipe.tags]);
    setIsEditingTags(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveTags = () => {
    onEdit({ ...recipe, tags });
    setIsEditingTags(false);
  };

  const handleCancelEditingTags = () => {
    setIsEditingTags(false);
    setTags([]);
    setNewTag('');
  };

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
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Tags</h4>
            {!isEditingTags && (
              <Button variant="ghost" size="sm" onClick={handleStartEditingTags}>
                Edit Tags
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {currentTags.map(tag => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${getTagColor(tag)} ${
                  isEditingTags ? 'pr-1' : ''
                }`}
              >
                {tag}
                {isEditingTags && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 inline-flex items-center hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {currentTags.length === 0 && !isEditingTags && (
              <span className="text-xs text-muted">No tags</span>
            )}
          </div>

          {isEditingTags && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add a tag..."
                  className="flex-1 text-sm px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveTags}>
                  Save Tags
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEditingTags}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

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
