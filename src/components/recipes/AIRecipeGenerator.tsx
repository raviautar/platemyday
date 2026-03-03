'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Sparkles, RefreshCw, Pencil, Heart, ChefHat } from 'lucide-react';
import { RecipeIngredientsAndInstructions } from './RecipeIngredientsAndInstructions';

interface AIRecipeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, strictIngredients?: boolean) => Promise<Recipe | null>;
  isGenerating?: boolean;
  lastGeneratedRecipe?: Recipe | null;
  onKeepRecipe?: () => void;
  onDiscardRecipe?: () => void;
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

const RECIPE_FORM_STATE_KEY = 'recipe-generator-form-state';

export function AIRecipeGenerator({ isOpen, onClose, onGenerate, isGenerating, lastGeneratedRecipe, onKeepRecipe, onDiscardRecipe }: AIRecipeGeneratorProps) {
  const { track } = useAnalytics();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [strictIngredients, setStrictIngredients] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedState = sessionStorage.getItem(RECIPE_FORM_STATE_KEY);
      if (savedState) {
        try {
          const { prompt, strictIngredients } = JSON.parse(savedState);
          setPrompt(prompt || '');
          setStrictIngredients(strictIngredients || false);
          sessionStorage.removeItem(RECIPE_FORM_STATE_KEY);
        } catch (e) {
        }
      }
    }
  }, [isOpen]);

  const handleAddIngredient = (ingredient: string) => {
    const currentText = prompt.trim();
    if (currentText) {
      setPrompt(`${currentText}, ${ingredient}`);
    } else {
      setPrompt(ingredient);
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    track(EVENTS.RECIPE_GENERATION_STARTED, { prompt_length: prompt.trim().length, strict_ingredients: strictIngredients });
    onGenerate(prompt.trim(), strictIngredients);
  };

  const handleRegenerate = () => {
    if (!prompt.trim()) return;
    track(EVENTS.RECIPE_GENERATION_STARTED, { prompt_length: prompt.trim().length, strict_ingredients: strictIngredients, is_regeneration: true });
    onDiscardRecipe?.();
    onGenerate(prompt.trim(), strictIngredients);
  };

  const handleEditPrompt = () => {
    onDiscardRecipe?.();
  };

  const handleKeep = () => {
    onKeepRecipe?.();
    setPrompt('');
    setStrictIngredients(false);
    onClose();
  };

  const handleClose = () => {
    if (lastGeneratedRecipe) {
      onDiscardRecipe?.();
    }
    setPrompt('');
    setStrictIngredients(false);
    onClose();
  };

  const handlePreferencesClick = () => {
    sessionStorage.setItem(RECIPE_FORM_STATE_KEY, JSON.stringify({ prompt, strictIngredients }));
    router.push('/customize');
  };

  const showResult = !isGenerating && lastGeneratedRecipe;
  const showInput = !isGenerating && !lastGeneratedRecipe;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Create Recipe" fullscreen>
        <div className="md:max-w-5xl md:mx-auto w-full space-y-6 md:space-y-8">
          {showInput && (
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

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setStrictIngredients(!strictIngredients)}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                    strictIngredients ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    strictIngredients ? 'translate-x-5' : ''
                  }`} />
                </button>
                <span className="text-sm text-foreground">Keep it simple — minimal extra ingredients</span>
              </label>

              <div>
                <p className="text-sm font-semibold text-foreground mb-4">Quick add ingredients</p>
                <div className="flex flex-wrap gap-2.5">
                  {ingredientSuggestions.map((ingredient) => (
                    <button
                      key={ingredient}
                      onClick={() => handleAddIngredient(ingredient)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-foreground rounded-full border border-border/40 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      {ingredient}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40">
                <Button
                  variant="ghost"
                  onClick={handlePreferencesClick}
                  className="flex items-center justify-center gap-2 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 px-6 py-3 text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  Preferences
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="flex-1 px-8 py-3 text-base font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Recipe
                </Button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-6 rounded-full">
                  <ChefHat className="w-16 h-16 text-primary animate-bounce" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Creating your recipe...</h3>
                <p className="text-sm text-muted">This usually takes a few seconds</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-pulse"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {showResult && lastGeneratedRecipe && (
            <div className="space-y-6">
              <div className="md:rounded-xl md:border md:border-border/60 md:shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-4 py-4 border-b border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                      <Sparkles className="w-3 h-3" />
                      Generated
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{lastGeneratedRecipe.title}</h3>
                  {lastGeneratedRecipe.description && (
                    <p className="text-sm text-muted mt-1 leading-snug">{lastGeneratedRecipe.description}</p>
                  )}
                </div>

                <div className="px-4 py-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {lastGeneratedRecipe.prepTimeMinutes > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Prep</span>
                          <span className="text-xs font-semibold text-foreground">{lastGeneratedRecipe.prepTimeMinutes}m</span>
                        </div>
                      </div>
                    )}
                    {lastGeneratedRecipe.cookTimeMinutes > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Cook</span>
                          <span className="text-xs font-semibold text-foreground">{lastGeneratedRecipe.cookTimeMinutes}m</span>
                        </div>
                      </div>
                    )}
                    {lastGeneratedRecipe.servings > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-lg border border-border/40 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted leading-none uppercase tracking-wider">Serves</span>
                          <span className="text-xs font-semibold text-foreground">{lastGeneratedRecipe.servings}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {(lastGeneratedRecipe.ingredients.length > 0 || lastGeneratedRecipe.instructions.length > 0) && (
                    <RecipeIngredientsAndInstructions
                      ingredients={lastGeneratedRecipe.ingredients}
                      instructions={lastGeneratedRecipe.instructions}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={handleKeep} className="flex-1 gap-2 py-3 text-base font-semibold">
                  <Heart className="w-5 h-5" />
                  Save to Library
                </Button>
                <Button variant="ghost" onClick={handleRegenerate} className="gap-2 border-2 border-border/40 hover:border-primary/30 py-3 text-base">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button variant="ghost" onClick={handleEditPrompt} className="gap-2 border-2 border-border/40 hover:border-primary/30 py-3 text-base">
                  <Pencil className="w-4 h-4" />
                  Edit Prompt
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
