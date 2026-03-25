'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ImageIngredientScanner } from '@/components/ui/ImageIngredientScanner';
import { Plus, Sparkles, ChefHat, Wand2, Settings2, Package, Lightbulb, Camera, ChevronDown, Calendar, ArrowRight } from 'lucide-react';
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a New Recipe" fullscreen>
      <div className="md:max-w-3xl md:mx-auto w-full space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-6">
          
          {/* Prompt Input Section */}
          <div className="bg-surface/30 p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <ChefHat className="w-6 h-6" />
              <h3 className="font-semibold text-lg text-foreground">What sounds good?</h3>
            </div>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., A quick stir-fry with tofu, chicken pasta bake, something with salmon and rice..."
              rows={4}
              className="text-lg bg-white shadow-inner resize-none focus:ring-primary/50 transition-all"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-start gap-2 text-muted text-sm">
                <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                <p>Describe a craving, a dish name, or list ingredients you have.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="shrink-0 ml-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-semibold hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>

          {/* Generate Button — primary action, prominent */}
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold h-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Wand2 className="w-6 h-6" />
            Generate Recipe
          </Button>

          {/* Collapsible: Pantry Staples + Strict Ingredients */}
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowIngredients(!showIngredients)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
                <span className="font-medium text-sm text-foreground">Quick add ingredients</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${showIngredients ? 'rotate-180' : ''}`} />
            </button>

            {showIngredients && (
              <div className="px-5 pb-5 space-y-5 border-t border-border/30 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-wrap gap-2">
                  {ingredientSuggestions.map((ingredient) => (
                    <button
                      key={ingredient}
                      onClick={() => handleAddIngredient(ingredient)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white hover:bg-primary text-foreground hover:text-white rounded-full border border-border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md font-medium group"
                    >
                      <Plus className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" />
                      {ingredient}
                    </button>
                  ))}
                </div>

                {/* Strict Ingredients Toggle */}
                <button
                  type="button"
                  onClick={() => setStrictIngredients(!strictIngredients)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between group ${
                    strictIngredients 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                      : 'border-border bg-white hover:border-primary/40 hover:bg-surface/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${strictIngredients ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-surface-dark text-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm transition-colors duration-300 ${strictIngredients ? 'text-primary' : 'text-foreground'}`}>Use only what I have</h4>
                      <p className="text-xs text-muted mt-0.5">Stick strictly to the ingredients in my prompt</p>
                    </div>
                  </div>
                  <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 shadow-inner ${strictIngredients ? 'bg-primary' : 'bg-border/60'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${strictIngredients ? 'translate-x-6' : ''}`} />
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Secondary actions */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handlePreferencesClick}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              Preferences
            </button>
          </div>

          {/* Meal Plan cross-promotion */}
          <Link
            href="/meal-plan"
            onClick={handleClose}
            className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Need a full week of meals?</p>
              <p className="text-xs text-muted mt-0.5">Generate a complete meal plan with shopping list</p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          
        </div>
      </div>

      <ImageIngredientScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onIngredientsDetected={handleScannedIngredients}
      />
    </Modal>
  );
}
