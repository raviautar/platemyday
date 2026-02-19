'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AIRecipeOutput } from '@/lib/ai';
import { Plus, Sparkles, RotateCcw, Clock, Users, ChefHat } from 'lucide-react';
import { RecipePreferencesModal } from './RecipePreferencesModal';
import { RecipeIngredientsAndInstructions } from '@/components/recipes/RecipeIngredientsAndInstructions';

interface AIRecipeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
}

const ingredientSuggestions = [
  'chicken breast',
  'ground beef',
  'salmon',
  'shrimp',
  'tofu',
  'eggs',
  'pasta',
  'rice',
  'quinoa',
  'potatoes',
  'tomatoes',
  'onions',
  'garlic',
  'bell peppers',
  'broccoli',
  'spinach',
  'mushrooms',
  'cheese',
  'butter',
  'olive oil',
  'lemon',
  'ginger',
  'basil',
  'cilantro',
];

export function AIRecipeGenerator({ isOpen, onClose, onSave }: AIRecipeGeneratorProps) {
  const { settings } = useSettings();
  const { userId, anonymousId } = useUserIdentity();
  const { track } = useAnalytics();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<AIRecipeOutput | null>(null);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  

  const handleAddIngredient = (ingredient: string) => {
    const currentText = prompt.trim();
    if (currentText) {
      setPrompt(`${currentText}, ${ingredient}`);
    } else {
      setPrompt(ingredient);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setPreview(null);

    const startTime = Date.now();
    track(EVENTS.RECIPE_GENERATION_STARTED, { prompt_length: prompt.trim().length });

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          systemPrompt: settings.recipeSystemPrompt,
          userId,
          anonymousId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate recipe');
      }

      const recipe = await res.json();
      setPreview(recipe);
      track(EVENTS.RECIPE_GENERATION_COMPLETED, {
        recipe_title: recipe.title,
        generation_time_ms: Date.now() - startTime,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      track(EVENTS.RECIPE_GENERATION_FAILED, { error_message: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;
    track(EVENTS.AI_RECIPE_SAVED, { recipe_title: preview.title });
    onSave({ ...preview, isAIGenerated: true });
    setPreview(null);
    setPrompt('');
  };

  const handleChangeRecipe = () => {
    setPreview(null);
    setError('');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const showInputSection = !preview;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create Recipe" fullscreen>
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {showInputSection && (
            <>
              <div className="space-y-6">
                <div>
                  <Textarea
                    label="Describe your recipe"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g., Lasagna with beef and ricotta cheese, or a quick vegetarian stir-fry with tofu and broccoli"
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted mt-2">Include ingredients, style, or any preferences.</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-4">Quick add ingredients</p>
                  <div className="flex flex-wrap gap-2.5">
                    {ingredientSuggestions.map((ingredient) => (
                      <button
                        key={ingredient}
                        onClick={() => handleAddIngredient(ingredient)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-surface hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-foreground rounded-full border border-border/40 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {ingredient}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40">
                <Button
                  variant="ghost"
                  onClick={() => setShowOnboarding(true)}
                  className="flex items-center justify-center gap-2 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 px-6 py-3 text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  Preferences
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={loading || !prompt.trim()}
                  className="flex-1 px-8 py-3 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" /> 
                      <span className="ml-2">Generating Recipe...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Recipe
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {error && (
            <div className="max-w-5xl mx-auto w-full">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 md:p-5">
                <p className="text-sm md:text-base text-red-800">
                  <span className="font-semibold">Oops! </span>
                  {error.includes('Failed to generate') 
                    ? "We couldn't generate your recipe. Please make sure your description is food-related and try again!"
                    : error}
                </p>
              </div>
            </div>
          )}

          {preview && (
            <div className="max-w-5xl mx-auto w-full">
              <div className="bg-gradient-to-br from-white to-surface/50 rounded-2xl border-2 border-border/60 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 md:px-8 py-6 border-b border-border/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-2xl md:text-3xl text-foreground mb-3 leading-tight">{preview.title}</h3>
                      <p className="text-base text-muted leading-relaxed">{preview.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleChangeRecipe}
                      className="flex items-center gap-2 shrink-0 hover:bg-surface px-4 py-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="hidden sm:inline">Change</span>
                    </Button>
                  </div>
                </div>

                <div className="px-6 md:px-8 py-6 space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-white/90 px-4 py-3 rounded-xl border border-border/40 shadow-sm">
                      <Clock className="w-5 h-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted leading-none">Prep</span>
                        <span className="text-base font-semibold text-foreground">{preview.prepTimeMinutes}m</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/90 px-4 py-3 rounded-xl border border-border/40 shadow-sm">
                      <ChefHat className="w-5 h-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted leading-none">Cook</span>
                        <span className="text-base font-semibold text-foreground">{preview.cookTimeMinutes}m</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/90 px-4 py-3 rounded-xl border border-border/40 shadow-sm">
                      <Users className="w-5 h-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted leading-none">Serves</span>
                        <span className="text-base font-semibold text-foreground">{preview.servings}</span>
                      </div>
                    </div>
                  </div>

                  {preview.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2.5">
                      {preview.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <RecipeIngredientsAndInstructions 
                    ingredients={preview.ingredients}
                    instructions={preview.instructions}
                  />

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                    <Button onClick={handleSave} className="flex-1 px-6 py-3 text-base font-semibold">Save Recipe</Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => { track(EVENTS.AI_RECIPE_DISCARDED, { recipe_title: preview?.title }); setPreview(null); setPrompt(''); }}
                      className="px-6 py-3 text-base"
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      
      <RecipePreferencesModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSave={handleOnboardingComplete}
      />
    </>
  );
}
