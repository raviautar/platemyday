'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { useToast } from '@/components/ui/Toast';
import { RecipeList } from '@/components/recipes/RecipeList';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { RecipeDetail } from '@/components/recipes/RecipeDetail';
import { AIRecipeGenerator } from '@/components/recipes/AIRecipeGenerator';
import { Button } from '@/components/ui/Button';

export default function RecipesPage() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleSave = (data: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (editingRecipe) {
      updateRecipe(editingRecipe.id, data);
      showToast('Recipe updated!');
    } else {
      addRecipe(data);
      showToast('Recipe created!');
    }
    setEditingRecipe(null);
  };

  const handleEdit = (recipe: Recipe) => {
    setSelectedRecipe(null);
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteRecipe(id);
    showToast('Recipe deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
        <div className="flex gap-2">
          <Button variant="accent" onClick={() => setShowAI(true)}>AI Generate</Button>
          <Button onClick={() => { setEditingRecipe(null); setShowForm(true); }}>+ New</Button>
        </div>
      </div>

      <RecipeList recipes={recipes} onSelectRecipe={setSelectedRecipe} />

      <RecipeForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingRecipe(null); }}
        onSave={handleSave}
        editingRecipe={editingRecipe}
      />

      <RecipeDetail
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AIRecipeGenerator
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        onSave={(recipe) => {
          addRecipe(recipe);
          showToast('AI recipe saved!');
          setShowAI(false);
        }}
      />
    </div>
  );
}
