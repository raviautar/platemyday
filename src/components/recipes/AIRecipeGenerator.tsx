'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Sparkles } from 'lucide-react';

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
    setPrompt('');
    setStrictIngredients(false);
    onClose();
  };

  const handlePreferencesClick = () => {
    sessionStorage.setItem(RECIPE_FORM_STATE_KEY, JSON.stringify({ prompt, strictIngredients }));
    router.push('/customize');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Recipe" fullscreen>
      <div className="md:max-w-5xl md:mx-auto w-full space-y-6 md:space-y-8">
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
      </div>
    </Modal>
  );
}
