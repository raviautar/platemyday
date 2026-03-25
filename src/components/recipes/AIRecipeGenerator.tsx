'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ImageIngredientScanner } from '@/components/ui/ImageIngredientScanner';
import { Plus, Sparkles, Wand2, Settings2, Package, Camera, ChevronDown, Calendar, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface AIRecipeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, strictIngredients?: boolean) => void;
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

export function AIRecipeGenerator({ isOpen, onClose, onGenerate }: AIRecipeGeneratorProps) {
  const { track } = useAnalytics();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [strictIngredients, setStrictIngredients] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

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
    setPrompt('');
    setStrictIngredients(false);
    onClose();
  };

  const handleClose = () => {
    if (prompt.trim()) {
      track(EVENTS.AI_RECIPE_DISCARDED, { prompt_length: prompt.trim().length, had_strict_ingredients: strictIngredients });
    }
    setPrompt('');
    setStrictIngredients(false);
    onClose();
  };

  const handlePreferencesClick = () => {
    sessionStorage.setItem(RECIPE_FORM_STATE_KEY, JSON.stringify({ prompt, strictIngredients }));
    router.push('/customize');
  };

  const handleScannedIngredients = (ingredients: string[]) => {
    const currentText = prompt.trim();
    const newText = ingredients.join(', ');
    setPrompt(currentText ? `${currentText}, ${newText}` : newText);
    track(EVENTS.INGREDIENT_SCAN_COMPLETED, { ingredient_count: ingredients.length, context: 'recipe' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center animate-fade-in">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full h-full md:h-auto md:max-h-[92vh] md:max-w-2xl md:mt-8 md:mb-8 md:rounded-2xl bg-white md:shadow-2xl md:border md:border-border/40 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">New Recipe</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreferencesClick}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-surface transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Preferences
            </button>
            <button
              onClick={handleClose}
              className="text-muted hover:text-foreground hover:bg-surface rounded-lg p-1.5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <div className="space-y-5 max-w-xl mx-auto">
            {/* Prompt */}
            <div>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe what you'd like to eat...&#10;&#10;e.g. A quick stir-fry with tofu, chicken pasta bake, something with salmon and rice"
                rows={4}
                className="text-base bg-surface/30 border-border/50 resize-none focus:ring-primary/40 focus:border-primary/40 rounded-xl transition-all placeholder:text-muted/60"
              />
              <div className="flex items-center justify-between mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Scan ingredients
                </button>
              </div>
            </div>

            {/* Quick add ingredients — collapsible */}
            <div className="rounded-xl border border-border/40 overflow-hidden bg-surface/20">
              <button
                type="button"
                onClick={() => setShowIngredients(!showIngredients)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Quick add ingredients</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${showIngredients ? 'rotate-180' : ''}`} />
              </button>

              {showIngredients && (
                <div className="px-4 pb-4 border-t border-border/30 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {ingredientSuggestions.map((ingredient) => (
                      <button
                        key={ingredient}
                        onClick={() => handleAddIngredient(ingredient)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white hover:bg-primary text-foreground hover:text-white rounded-lg border border-border/60 transition-all duration-150 font-medium group"
                      >
                        <Plus className="w-3 h-3 text-muted/60 group-hover:text-white transition-colors" />
                        {ingredient}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Strict Ingredients Toggle — always visible */}
            <button
              type="button"
              onClick={() => setStrictIngredients(!strictIngredients)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                strictIngredients
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border/40 bg-surface/20 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-200 ${strictIngredients ? 'bg-primary text-white' : 'bg-white text-muted border border-border/40 group-hover:text-primary group-hover:border-primary/30'}`}>
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors ${strictIngredients ? 'text-primary' : 'text-foreground'}`}>Use only what I have</p>
                  <p className="text-xs text-muted">No extra ingredients beyond my prompt</p>
                </div>
              </div>
              <div className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 ${strictIngredients ? 'bg-primary' : 'bg-border/50'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-200 ${strictIngredients ? 'translate-x-[18px]' : ''}`} />
              </div>
            </button>

            {/* Meal Plan cross-promotion */}
            <Link
              href="/meal-plan"
              onClick={handleClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-primary/25 bg-primary/[0.03] hover:bg-primary/[0.07] hover:border-primary/40 transition-all group"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Need a full week of meals?</p>
                <p className="text-xs text-muted">Generate a meal plan with shopping list</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary/60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Sticky footer with generate button */}
        <div className="shrink-0 border-t border-border/40 bg-white px-5 py-4 md:px-6">
          <div className="max-w-xl mx-auto">
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold h-auto shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 transition-all rounded-xl disabled:opacity-40 disabled:shadow-none"
            >
              <Wand2 className="w-5 h-5" />
              Generate Recipe
            </Button>
          </div>
        </div>
      </div>

      <ImageIngredientScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onIngredientsDetected={handleScannedIngredients}
      />
    </div>
  );
}
