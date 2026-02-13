'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/types';
import { useRecipes } from '@/contexts/RecipeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { RecipeList } from '@/components/recipes/RecipeList';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { RecipeDetail } from '@/components/recipes/RecipeDetail';
import { AIRecipeGenerator } from '@/components/recipes/AIRecipeGenerator';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Plus } from 'lucide-react';

export default function RecipesPage() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      </div>

      <RecipeList recipes={recipes} onSelectRecipe={setSelectedRecipe} onCreateRecipe={() => setShowAI(true)} />

      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 z-40 flex items-center justify-center"
        aria-label="Create Recipe"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </button>

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
          showToast('Recipe saved!');
          setShowAI(false);
        }}
      />

      <OnboardingWizard isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
