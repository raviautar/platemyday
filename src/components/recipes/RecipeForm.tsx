'use client';

import React, { useState, useEffect } from 'react';
import { Recipe } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

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
  tags: '',
  isAIGenerated: false,
};

export function RecipeForm({ isOpen, onClose, onSave, editingRecipe }: RecipeFormProps) {
  const [form, setForm] = useState(emptyForm);

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
        tags: editingRecipe.tags.join(', '),
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
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
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
    <Modal isOpen={isOpen} onClose={onClose} title={editingRecipe ? 'Edit Recipe' : 'New Recipe'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          required
          placeholder="Recipe title"
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description"
          rows={2}
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Servings"
            type="number"
            min={1}
            value={form.servings}
            onChange={e => setForm(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
          />
          <Input
            label="Prep (min)"
            type="number"
            min={0}
            value={form.prepTimeMinutes}
            onChange={e => setForm(prev => ({ ...prev, prepTimeMinutes: parseInt(e.target.value) || 0 }))}
          />
          <Input
            label="Cook (min)"
            type="number"
            min={0}
            value={form.cookTimeMinutes}
            onChange={e => setForm(prev => ({ ...prev, cookTimeMinutes: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Ingredients</label>
          <div className="space-y-2 mt-1">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={ing}
                  onChange={e => updateListItem('ingredients', i, e.target.value)}
                  placeholder={`Ingredient ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button type="button" onClick={() => removeListItem('ingredients', i)} className="text-muted hover:text-danger px-2">
                  &times;
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('ingredients')} className="text-sm text-primary hover:text-primary-dark">
              + Add ingredient
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Instructions</label>
          <div className="space-y-2 mt-1">
            {form.instructions.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-sm text-muted mt-2 w-6">{i + 1}.</span>
                <textarea
                  value={step}
                  onChange={e => updateListItem('instructions', i, e.target.value)}
                  placeholder={`Step ${i + 1}`}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-y"
                />
                <button type="button" onClick={() => removeListItem('instructions', i)} className="text-muted hover:text-danger px-2">
                  &times;
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('instructions')} className="text-sm text-primary hover:text-primary-dark">
              + Add step
            </button>
          </div>
        </div>

        <Input
          label="Tags (comma-separated)"
          value={form.tags}
          onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g., quick, vegetarian, pasta"
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit">{editingRecipe ? 'Save Changes' : 'Create Recipe'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
