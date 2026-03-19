'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Sparkles, ChefHat, Wand2, Settings2, Package, Lightbulb } from 'lucide-react';

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a New Recipe" fullscreen>
      <div className="md:max-w-3xl md:mx-auto w-full space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-8">
          
          {/* Prompt Input Section */}
          <div className="bg-surface/30 p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <ChefHat className="w-6 h-6" />
              <h3 className="font-semibold text-lg text-foreground">What sounds good?</h3>
            </div>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., A quick vegetarian stir-fry with tofu and broccoli, or a hearty beef lasagna..."
              rows={5}
              className="text-lg bg-white shadow-inner resize-none focus:ring-primary/50 transition-all"
            />
            <div className="flex items-start gap-2 mt-4 text-muted text-sm">
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <p>Describe a craving, a cultural dish, or simply list the ingredients you want to use up.</p>
            </div>
          </div>

          {/* Pantry Staples Section */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="font-semibold text-foreground text-lg">Quick add pantry staples</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {ingredientSuggestions.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => handleAddIngredient(ingredient)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm bg-white hover:bg-primary text-foreground hover:text-white rounded-full border border-border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md font-medium group"
                >
                  <Plus className="w-4 h-4 text-muted group-hover:text-white text-opacity-80 transition-colors" />
                  {ingredient}
                </button>
              ))}
            </div>
          </div>

          {/* Strict Ingredients Toggle Tile */}
          <button
            type="button"
            onClick={() => setStrictIngredients(!strictIngredients)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${
              strictIngredients 
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                : 'border-border bg-white hover:border-primary/40 hover:bg-surface/50 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-xl transition-all duration-300 ${strictIngredients ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-surface-dark text-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-semibold text-lg transition-colors duration-300 ${strictIngredients ? 'text-primary' : 'text-foreground'}`}>Use only what I have</h4>
                <p className="text-sm text-muted mt-1 font-medium">Don't add extra shopping items, stick strictly to my prompt</p>
              </div>
            </div>
            <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 shrink-0 shadow-inner ${strictIngredients ? 'bg-primary' : 'bg-border/60'}`}>
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${strictIngredients ? 'translate-x-7' : ''}`} />
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 mt-6 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={handlePreferencesClick}
              className="flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold h-auto sm:w-auto w-full group border-2 hover:bg-surface/50 transition-all rounded-xl"
            >
              <Settings2 className="w-5 h-5 text-muted group-hover:text-foreground transition-colors" />
              Preferences
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold h-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <Wand2 className="w-6 h-6" />
              Generate Recipe
            </Button>
          </div>
          
        </div>
      </div>
    </Modal>
  );
}
