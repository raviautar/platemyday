'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { PreferencesSection } from '@/components/settings/PreferencesSection';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { UnitSystem, WeekStartDay } from '@/types';

type Tab = 'general' | 'preferences' | 'prompts' | 'about';

const WEEK_DAYS: WeekStartDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CustomizePage() {
  const { settings, updateSettings, updateUnitSystem, resetSettings } = useSettings();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const handleUnitSystemChange = (unitSystem: UnitSystem) => {
    updateUnitSystem(unitSystem);
    showToast(`Unit system changed to ${unitSystem}`);
  };

  const handleWeekStartDayChange = (day: WeekStartDay) => {
    updateSettings({ weekStartDay: day });
    showToast(`Week start day changed to ${day}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Customize</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'preferences'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'prompts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          AI Prompts
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'about'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          About
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* General Tab */}
        {activeTab === 'general' && (
          <>
        <div className="bg-white rounded-xl border border-border p-4 space-y-4">
          <h2 className="font-semibold text-lg">Week Start Day</h2>
          <p className="text-sm text-muted">
            Choose which day your week starts on. This will affect how your meal plans are displayed.
          </p>

          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map(day => (
              <button
                key={day}
                onClick={() => handleWeekStartDayChange(day)}
                className={`px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium flex items-center justify-center ${
                  settings.weekStartDay === day
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-white text-muted hover:border-primary/50'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 space-y-4">
          <h2 className="font-semibold text-lg">Measurement Units</h2>
          <p className="text-sm text-muted">
            Choose your preferred unit system for recipes. This will automatically update AI-generated recipes.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => handleUnitSystemChange('metric')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                settings.unitSystem === 'metric'
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-border bg-white text-muted hover:border-primary/50'
              }`}
            >
              <div className="text-sm font-medium">Metric</div>
              <div className="text-xs mt-1">grams, liters, Celsius</div>
            </button>
            <button
              onClick={() => handleUnitSystemChange('imperial')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                settings.unitSystem === 'imperial'
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-border bg-white text-muted hover:border-primary/50'
              }`}
            >
              <div className="text-sm font-medium">Imperial</div>
              <div className="text-xs mt-1">cups, ounces, Fahrenheit</div>
            </button>
          </div>
        </div>

          </>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <PreferencesSection />
        )}

        {/* AI Prompts Tab */}
        {activeTab === 'prompts' && (
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
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
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
        )}
      </div>
    </div>
  );
}
