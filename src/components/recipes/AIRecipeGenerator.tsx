'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AIRecipeOutput } from '@/lib/ai';
import { Plus, Sparkles, RotateCcw } from 'lucide-react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;
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
            <div className="bg-surface rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{preview.title}</h3>
                  <p className="text-sm text-muted">{preview.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleChangeRecipe}
                  className="flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Change
                </Button>
              </div>
              <div className="flex gap-3 text-xs text-muted">
                <span>Prep: {preview.prepTimeMinutes}m</span>
                <span>Cook: {preview.cookTimeMinutes}m</span>
                <span>{preview.servings} servings</span>
              </div>
              {preview.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {preview.tags.map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              <div>
                <h4 className="font-medium text-sm mb-1">Ingredients</h4>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {preview.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Instructions</h4>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  {preview.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave}>Save Recipe</Button>
                <Button variant="ghost" onClick={() => { setPreview(null); setPrompt(''); }}>Discard</Button>
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
