'use client';

import React, { useState, useEffect } from 'react';
import { Recipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, X } from 'lucide-react';

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  editingRecipe?: Recipe | null;
}

const emptyForm = {
  title: '',
  description: '',
  ingredients: [''],
  instructions: [''],
  servings: 4,
  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  tags: [] as string[],
  isAIGenerated: false,
};

export function RecipeForm({ isOpen, onClose, onSave, editingRecipe }: RecipeFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  useEffect(() => {
    if (editingRecipe) {
      setForm({
        title: editingRecipe.title,
        description: editingRecipe.description,
        ingredients: editingRecipe.ingredients.length > 0 ? editingRecipe.ingredients : [''],
        instructions: editingRecipe.instructions.length > 0 ? editingRecipe.instructions : [''],
        servings: editingRecipe.servings,
        prepTimeMinutes: editingRecipe.prepTimeMinutes,
        cookTimeMinutes: editingRecipe.cookTimeMinutes,
        tags: editingRecipe.tags,
        isAIGenerated: editingRecipe.isAIGenerated,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingRecipe, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      ingredients: form.ingredients.filter(i => i.trim()),
      instructions: form.instructions.filter(i => i.trim()),
      servings: form.servings,
      prepTimeMinutes: form.prepTimeMinutes,
      cookTimeMinutes: form.cookTimeMinutes,
      tags: form.tags.filter(t => t.trim()),
      isAIGenerated: form.isAIGenerated,
    });
    onClose();
  };

  const updateListItem = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const addListItem = (field: 'ingredients' | 'instructions') => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeListItem = (field: 'ingredients' | 'instructions', index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].length > 1 ? prev[field].filter((_, i) => i !== index) : prev[field],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingRecipe ? 'Edit Recipe' : 'New Recipe'} fullscreen>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Input
            label="Title"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Recipe title"
            className="text-sm py-1.5"
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description"
            rows={2}
            className="text-sm"
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Servings"
              type="number"
              min={1}
              value={form.servings}
              onChange={e => setForm(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
              className="text-sm py-1.5"
            />
            <Input
              label="Prep (min)"
              type="number"
              min={0}
              value={form.prepTimeMinutes}
              onChange={e => setForm(prev => ({ ...prev, prepTimeMinutes: parseInt(e.target.value) || 0 }))}
              className="text-sm py-1.5"
            />
            <Input
              label="Cook (min)"
              type="number"
              min={0}
              value={form.cookTimeMinutes}
              onChange={e => setForm(prev => ({ ...prev, cookTimeMinutes: parseInt(e.target.value) || 0 }))}
              className="text-sm py-1.5"
            />
          </div>
        </div>

        <div className="bg-surface/30 rounded-xl p-3 border border-border/40">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Ingredients
          </label>
          <div className="space-y-2">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-1.5">
                  <span className="text-primary text-[10px] font-semibold">{i + 1}</span>
                </span>
                <input
                  value={ing}
                  onChange={e => updateListItem('ingredients', i, e.target.value)}
                  placeholder={`Ingredient ${i + 1}`}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeListItem('ingredients', i)}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors mt-0.5"
                  aria-label="Remove ingredient"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('ingredients')}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium mt-1 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add ingredient
            </button>
          </div>
        </div>

        <div className="bg-surface/30 rounded-xl p-3 border border-border/40">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Instructions
          </label>
          <div className="space-y-3">
            {form.instructions.map((step, i) => (
              <div key={i} className="bg-white rounded-lg p-2.5 border border-border/60 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-[10px] mt-0.5">
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={e => updateListItem('instructions', i, e.target.value)}
                    placeholder={`Describe step ${i + 1}...`}
                    rows={2}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs resize-y min-h-[60px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('instructions', i)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors mt-0.5"
                    aria-label="Remove step"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('instructions')}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors border border-primary/20 hover:border-primary/40"
            >
              <Plus className="w-3.5 h-3.5" />
              Add step
            </button>
          </div>
        </div>

        <div className="bg-surface/30 rounded-xl p-3 border border-border/40">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Tags
          </label>
          <div className="space-y-2">
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="inline-flex items-center hover:opacity-70 rounded-full p-0.5 hover:bg-black/10"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1 text-xs px-2.5 py-1.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button type="button" size="sm" onClick={handleAddTag} className="px-2.5 py-1.5 h-auto text-xs">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/40">
          <Button type="submit" className="flex-1 py-2 text-sm h-auto">{editingRecipe ? 'Save Changes' : 'Create Recipe'}</Button>
          <Button type="button" variant="ghost" onClick={onClose} className="py-2 text-sm h-auto">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
