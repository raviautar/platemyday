'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { X, Plus, Clock, ChefHat, Users } from 'lucide-react';
import { RecipeIngredientsAndInstructions } from '@/components/recipes/RecipeIngredientsAndInstructions';
import { getTagBadgeColor } from '@/lib/tag-colors';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
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
    <Modal isOpen={isOpen} onClose={onClose} title={recipe.title} fullscreen>
      <div className="bg-gradient-to-br from-white to-surface/50 rounded-xl border border-border/60 shadow-lg overflow-hidden flex flex-col max-h-full">
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-4 py-4 border-b border-border/40 shrink-0">
          <p className="text-sm text-muted leading-snug">{recipe.description}</p>
          <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
            <Button variant="ghost" size="sm" onClick={() => onEdit(recipe)} className="flex-1 text-sm py-1.5 h-auto">Edit Recipe</Button>
            <Button variant="danger" size="sm" onClick={() => { onDelete(recipe.id); onClose(); }} className="flex-1 text-sm py-1.5 h-auto">Delete</Button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-5 overflow-y-auto w-full">
          <div className="flex flex-wrap gap-2">
            {recipe.prepTimeMinutes > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Prep</span>
                  <span className="text-xs font-semibold text-foreground">{recipe.prepTimeMinutes}m</span>
                </div>
              </div>
            )}
            {recipe.cookTimeMinutes > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                <ChefHat className="w-3.5 h-3.5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Cook</span>
                  <span className="text-xs font-semibold text-foreground">{recipe.cookTimeMinutes}m</span>
                </div>
              </div>
            )}
            {recipe.servings > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                <Users className="w-3.5 h-3.5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Serves</span>
                  <span className="text-xs font-semibold text-foreground">{recipe.servings}</span>
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
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${getTagBadgeColor(tag)} ${isEditingTags ? 'pr-2' : ''
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
        </div>
      </div>
    </Modal>
  );
}
