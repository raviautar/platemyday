'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { showToast } = useToast();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-border p-4 space-y-4">
          <h2 className="font-semibold text-lg">AI System Prompts</h2>
          <p className="text-sm text-muted">
            Customize the system prompts used when generating recipes and meal plans with AI.
          </p>

          <Textarea
            label="Recipe Generation Prompt"
            value={settings.recipeSystemPrompt}
            onChange={e => updateSettings({ recipeSystemPrompt: e.target.value })}
            rows={4}
          />

          <Textarea
            label="Meal Plan Generation Prompt"
            value={settings.mealPlanSystemPrompt}
            onChange={e => updateSettings({ mealPlanSystemPrompt: e.target.value })}
            rows={4}
          />

          <div className="flex gap-2">
            <Button onClick={() => showToast('Settings saved automatically')}>
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                resetSettings();
                showToast('Settings reset to defaults');
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <h2 className="font-semibold text-lg">About</h2>
          <p className="text-sm text-muted">
            PlateMyDay is an AI-powered meal planning app. Create recipes manually or with AI,
            then generate weekly meal plans and rearrange them with drag-and-drop.
          </p>
          <div className="text-xs text-muted">
            <p>Default prompts for reference:</p>
            <pre className="mt-1 p-2 bg-surface rounded text-xs whitespace-pre-wrap">
              {DEFAULT_SETTINGS.recipeSystemPrompt}
            </pre>
            <pre className="mt-1 p-2 bg-surface rounded text-xs whitespace-pre-wrap">
              {DEFAULT_SETTINGS.mealPlanSystemPrompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
