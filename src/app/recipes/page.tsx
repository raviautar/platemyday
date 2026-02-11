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
import { Plus, Sparkles } from 'lucide-react';
import { MdClose } from 'react-icons/md';

export default function RecipesPage() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setShowHint(
      !settings.preferences.onboardingCompleted &&
      !settings.preferences.onboardingDismissed
    );
  }, [settings.preferences]);

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

  const handleDismissHint = () => {
    updateSettings({
      preferences: {
        ...settings.preferences,
        onboardingDismissed: true,
      },
    });
    setShowHint(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
      </div>

      {showHint && (
        <div className="bg-gradient-to-r from-primary/10 to-emerald-50 border border-primary/30 rounded-xl p-4 mb-6 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Get Personalized Recipes</h3>
              <p className="text-sm text-muted mb-3">
                Tell us your dietary preferences and we'll tailor recipe suggestions just for you.
              </p>
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-sm font-medium text-primary hover:text-primary-dark underline"
              >
                Set up preferences (2 min)
              </button>
            </div>
          </div>
          <button onClick={handleDismissHint} className="text-muted hover:text-foreground ml-2">
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      )}

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
