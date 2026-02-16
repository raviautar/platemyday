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
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { RecipeIngredientsAndInstructions } from '@/components/recipes/RecipeIngredientsAndInstructions';

interface AIRecipeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
}

const ingredientSuggestions = [
  '500g chicken breast',
  'pasta',
  '2 cups rice',
  'beef',
  'salmon',
  'tofu',
  'broccoli',
  'tomatoes',
  'garlic',
  'onions',
  'bell peppers',
  'mushrooms',
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
  
  const needsPreferences = !settings.preferences.onboardingCompleted && !settings.preferences.onboardingDismissed;

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
      <Modal isOpen={isOpen} onClose={onClose} title="Create Recipe">
        <div className="space-y-4">
          {showInputSection && (
            <>
              <Textarea
                label="Describe your recipe"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g., Lasagna with beef and ricotta cheese, or a quick vegetarian stir-fry with tofu and broccoli"
                rows={3}
              />

              <div>
                <p className="text-xs font-medium text-muted mb-2">Quick add ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {ingredientSuggestions.map((ingredient) => (
                    <button
                      key={ingredient}
                      onClick={() => handleAddIngredient(ingredient)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-surface hover:bg-surface-dark text-foreground rounded-full transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {ingredient}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {showInputSection && (
            <div className="flex gap-2">
              {needsPreferences && (
                <Button
                  variant="ghost"
                  onClick={() => setShowOnboarding(true)}
                  className="flex items-center gap-2 border border-primary/30 hover:bg-primary/10"
                >
                  <Sparkles className="w-4 h-4" />
                  Preferences
                </Button>
              )}
              <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
                {loading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Generating...</span></> : 'Generate Recipe'}
              </Button>
            </div>
          )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">Oops! </span>
              {error.includes('Failed to generate') 
                ? "We couldn't generate your recipe. Please make sure your description is food-related and try again!"
                : error}
            </p>
          </div>
        )}

          {preview && (
            <div className="bg-gradient-to-br from-white to-surface/50 rounded-xl border border-border/60 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-6 py-5 border-b border-border/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-foreground mb-2 leading-tight">{preview.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{preview.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleChangeRecipe}
                    className="flex items-center gap-1.5 shrink-0 hover:bg-surface"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Change
                  </Button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-5">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-lg border border-border/40 shadow-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted leading-none">Prep</span>
                      <span className="text-sm font-semibold text-foreground">{preview.prepTimeMinutes}m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-lg border border-border/40 shadow-sm">
                    <ChefHat className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted leading-none">Cook</span>
                      <span className="text-sm font-semibold text-foreground">{preview.cookTimeMinutes}m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-lg border border-border/40 shadow-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted leading-none">Serves</span>
                      <span className="text-sm font-semibold text-foreground">{preview.servings}</span>
                    </div>
                  </div>
                </div>

                {preview.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preview.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <RecipeIngredientsAndInstructions 
                  ingredients={preview.ingredients}
                  instructions={preview.instructions}
                />

                <div className="flex gap-3 pt-2 border-t border-border/40">
                  <Button onClick={handleSave} className="flex-1">Save Recipe</Button>
                  <Button variant="ghost" onClick={() => { track(EVENTS.AI_RECIPE_DISCARDED, { recipe_title: preview?.title }); setPreview(null); setPrompt(''); }}>Discard</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onCompleted={handleOnboardingComplete}
      />
    </>
  );
}
