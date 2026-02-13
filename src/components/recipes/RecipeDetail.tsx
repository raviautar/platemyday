'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { X, Plus, Clock, ChefHat, Users } from 'lucide-react';
import { RecipeIngredientsAndInstructions } from '@/components/recipes/RecipeIngredientsAndInstructions';

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
      <div className="bg-gradient-to-br from-white to-surface/50 rounded-xl border border-border/60 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-6 py-5 border-b border-border/40">
          <p className="text-sm text-muted leading-relaxed">{recipe.description}</p>
        </div>

        <div className="px-6 py-4 space-y-5">
          <div className="flex flex-wrap gap-3">
            {recipe.prepTimeMinutes > 0 && (
              <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-lg border border-border/40 shadow-sm">
                <Clock className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted leading-none">Prep</span>
                  <span className="text-sm font-semibold text-foreground">{recipe.prepTimeMinutes}m</span>
                </div>
              </div>
            )}
            {recipe.cookTimeMinutes > 0 && (
              <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-lg border border-border/40 shadow-sm">
                <ChefHat className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted leading-none">Cook</span>
                  <span className="text-sm font-semibold text-foreground">{recipe.cookTimeMinutes}m</span>
                </div>
              </div>
            )}
            {recipe.servings > 0 && (
              <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-lg border border-border/40 shadow-sm">
                <Users className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted leading-none">Serves</span>
                  <span className="text-sm font-semibold text-foreground">{recipe.servings}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                Tags
              </h4>
              {!isEditingTags && (
                <Button variant="ghost" size="sm" onClick={handleStartEditingTags} className="hover:bg-surface">
                  Edit Tags
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {currentTags.map(tag => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${getTagColor(tag)} ${
                    isEditingTags ? 'pr-2' : ''
                  }`}
                >
                  {tag}
                  {isEditingTags && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="inline-flex items-center hover:opacity-70 rounded-full p-0.5 hover:bg-black/10"
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
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag..."
                    className="flex-1 text-sm px-3 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

          <RecipeIngredientsAndInstructions 
            ingredients={recipe.ingredients}
            instructions={recipe.instructions}
          />

          <div className="flex gap-3 pt-2 border-t border-border/40">
            <Button variant="ghost" onClick={() => onEdit(recipe)} className="flex-1">Edit</Button>
            <Button variant="danger" onClick={() => { onDelete(recipe.id); onClose(); }} className="flex-1">Delete</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
