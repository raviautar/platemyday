'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { UserPreferences } from '@/types';
import { Button } from '@/components/ui/Button';
import { Sparkles, X } from 'lucide-react';
import { DietTypeStep } from './steps/DietTypeStep';
import { AllergiesStep } from './steps/AllergiesStep';

interface ProgressivePreferencesProps {
  onOpenFullWizard: () => void;
}

const QUESTIONS = [
  { id: 'diet', label: 'What\'s your dietary preference?' },
  { id: 'allergies', label: 'Any allergies or restrictions?' },
] as const;

type QuestionId = typeof QUESTIONS[number]['id'];

export function ProgressivePreferences({ onOpenFullWizard }: ProgressivePreferencesProps) {
  const { settings, updateSettings } = useSettings();
  const [currentQuestion, setCurrentQuestion] = useState<QuestionId | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(settings.preferences);

  useEffect(() => {
    setPreferences(settings.preferences);
  }, [settings.preferences]);

  useEffect(() => {
    if (settings.preferences.onboardingCompleted || settings.preferences.onboardingDismissed) {
      setCurrentQuestion(null);
      return;
    }

    if (!settings.preferences.dietaryType) {
      setCurrentQuestion('diet');
    } else if (settings.preferences.dietaryType && settings.preferences.allergies.length === 0) {
      setCurrentQuestion('allergies');
    } else {
      setCurrentQuestion(null);
    }
  }, [settings.preferences]);

  const handleDietChange = (value: UserPreferences['dietaryType']) => {
    const updated = { ...preferences, dietaryType: value };
    setPreferences(updated);
    updateSettings({ preferences: updated });
  };

  const handleAllergiesChange = (value: string[]) => {
    const updated = { ...preferences, allergies: value };
    setPreferences(updated);
    updateSettings({ preferences: updated });
  };

  const handleDismiss = () => {
    updateSettings({
      preferences: {
        ...preferences,
        onboardingDismissed: true,
      },
    });
    setCurrentQuestion(null);
  };

  const handleSkipQuestion = () => {
    if (currentQuestion === 'diet') {
      const updated = { ...preferences, dietaryType: 'omnivore' as const };
      setPreferences(updated);
      updateSettings({ preferences: updated });
    } else {
      setCurrentQuestion(null);
      updateSettings({
        preferences: {
          ...preferences,
          onboardingDismissed: true,
        },
      });
    }
  };

  if (settings.preferences.onboardingCompleted || settings.preferences.onboardingDismissed) {
    return null;
  }

  if (!currentQuestion) {
    return null;
  }

  const currentQuestionData = QUESTIONS.find(q => q.id === currentQuestion);
  if (!currentQuestionData) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-emerald-50 border border-primary/30 rounded-xl p-4 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{currentQuestionData.label}</h3>
            <div className="space-y-3">
              {currentQuestion === 'diet' && (
                <DietTypeStep
                  value={preferences.dietaryType}
                  onChange={handleDietChange}
                />
              )}
              {currentQuestion === 'allergies' && (
                <AllergiesStep
                  value={preferences.allergies}
                  onChange={handleAllergiesChange}
                />
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <button
                onClick={onOpenFullWizard}
                className="text-primary hover:text-primary-dark underline font-medium"
              >
                Start full onboarding
              </button>
              <span className="text-muted">or continue answering questions</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2 ml-2">
          {currentQuestion === 'allergies' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipQuestion}
              className="text-xs"
            >
              Skip
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="text-muted hover:text-foreground p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
