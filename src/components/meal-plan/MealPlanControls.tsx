'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MealPlanControlsProps {
  onGenerate: (preferences: string, systemPrompt?: string) => Promise<void>;
  onClear: () => void;
  hasExistingPlan: boolean;
  loading: boolean;
  defaultSystemPrompt: string;
}

export function MealPlanControls({ onGenerate, onClear, hasExistingPlan, loading, defaultSystemPrompt }: MealPlanControlsProps) {
  const [preferences, setPreferences] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleGenerate = () => {
    onGenerate(preferences, systemPrompt || undefined);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-3">
      <Textarea
        label="Preferences (optional)"
        value={preferences}
        onChange={e => setPreferences(e.target.value)}
        placeholder="e.g., No red meat this week, extra protein, kid-friendly meals..."
        rows={2}
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
          placeholder={defaultSystemPrompt}
          rows={3}
        />
      )}

      <div className="flex gap-2">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <><LoadingSpinner size="sm" /> <span className="ml-2">Generating...</span></>
          ) : hasExistingPlan ? 'Regenerate Plan' : 'Generate Meal Plan'}
        </Button>
        {hasExistingPlan && (
          <Button variant="ghost" onClick={onClear}>Clear Plan</Button>
        )}
      </div>
    </div>
  );
}
