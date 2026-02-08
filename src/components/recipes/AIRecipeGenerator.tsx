'use client';

import { useState } from 'react';
import { Recipe } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AIRecipeOutput } from '@/lib/ai';

interface AIRecipeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
}

export function AIRecipeGenerator({ isOpen, onClose, onSave }: AIRecipeGeneratorProps) {
  const { settings } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<AIRecipeOutput | null>(null);
  const [error, setError] = useState('');

  const effectiveSystemPrompt = systemPrompt || settings.recipeSystemPrompt;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), systemPrompt: effectiveSystemPrompt }),
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Recipe Generator">
      <div className="space-y-4">
        <Textarea
          label="What would you like to cook?"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g., A healthy pasta dish with vegetables that takes under 30 minutes"
          rows={3}
        />

        <button
          type="button"
          onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          className="text-sm text-muted hover:text-foreground"
        >
          {showSystemPrompt ? 'Hide' : 'Show'} system prompt
        </button>

        {showSystemPrompt && (
          <Textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder={settings.recipeSystemPrompt}
            rows={3}
          />
        )}

        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Generating...</span></> : 'Generate Recipe'}
          </Button>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        {preview && (
          <div className="bg-surface rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">{preview.title}</h3>
            <p className="text-sm text-muted">{preview.description}</p>
            <div className="flex gap-3 text-xs text-muted">
              <span>Prep: {preview.prepTimeMinutes}m</span>
              <span>Cook: {preview.cookTimeMinutes}m</span>
              <span>{preview.servings} servings</span>
            </div>
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
              <Button onClick={handleSave}>Save to Collection</Button>
              <Button variant="ghost" onClick={() => setPreview(null)}>Discard</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
