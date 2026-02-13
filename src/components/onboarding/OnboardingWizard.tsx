'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/contexts/SettingsContext';
import { UserPreferences } from '@/types';
import { MdClose, MdArrowForward, MdArrowBack } from 'react-icons/md';
import Image from 'next/image';

import { DietTypeStep } from './steps/DietTypeStep';
import { AllergiesStep } from './steps/AllergiesStep';
import { ServingsStep } from './steps/ServingsStep';
import { MacroGoalsStep } from './steps/MacroGoalsStep';
import { MealNotesStep } from './steps/MealNotesStep';
import { CompletionStep } from './steps/CompletionStep';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

const STEPS = [
  { id: 'diet', title: 'Dietary Preference' },
  { id: 'allergies', title: 'Allergies & Restrictions' },
  { id: 'servings', title: 'Servings' },
  { id: 'macros', title: 'Macro Goals' },
  { id: 'mealNotes', title: 'Additional Preferences' },
  { id: 'complete', title: 'Complete' },
];

export function OnboardingWizard({ isOpen, onClose, onCompleted }: OnboardingWizardProps) {
  const { settings, updateSettings } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>(settings.preferences);

  // Auto-save on each step completion
  useEffect(() => {
    if (currentStep > 0 && currentStep < STEPS.length - 1) {
      updateSettings({ preferences });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    // Save partial progress and mark as dismissed
    updateSettings({
      preferences: {
        ...preferences,
        onboardingDismissed: true,
      },
    });
    onClose();
  };

  const handleComplete = () => {
    updateSettings({
      preferences: {
        ...preferences,
        onboardingCompleted: true,
      },
    });
    if (onCompleted) {
      onCompleted();
    } else {
      onClose();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DietTypeStep
            value={preferences.dietaryType}
            onChange={(v) => setPreferences(p => ({ ...p, dietaryType: v }))}
          />
        );
      case 1:
        return (
          <AllergiesStep
            value={preferences.allergies}
            onChange={(v) => setPreferences(p => ({ ...p, allergies: v }))}
          />
        );
      case 2:
        return (
          <ServingsStep
            value={preferences.servings}
            onChange={(v) => setPreferences(p => ({ ...p, servings: v }))}
          />
        );
      case 3:
        return (
          <MacroGoalsStep
            value={preferences.macroGoals}
            onChange={(v) => setPreferences(p => ({ ...p, macroGoals: v }))}
          />
        );
      case 4:
        return (
          <MealNotesStep
            value={preferences.mealNotes}
            onChange={(v) => setPreferences(p => ({ ...p, mealNotes: v }))}
          />
        );
      case 5:
        return <CompletionStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo.png" alt="PlateMyDay" width={40} height={40} />
            <h2 className="text-2xl font-bold text-primary">Let's Get Cookin'</h2>
          </div>
          <button onClick={handleSkip} className="text-muted hover:text-foreground transition-colors">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Dots */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex justify-center gap-2">
            {STEPS.slice(0, -1).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-primary w-8'
                    : idx < currentStep
                      ? 'bg-primary/50 w-2'
                      : 'bg-border w-2'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step Title */}
        {currentStep < STEPS.length - 1 && (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground">{STEPS[currentStep].title}</h3>
            <p className="text-sm text-muted mt-1">Step {currentStep + 1} of {STEPS.length - 1}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={currentStep === 0 ? handleSkip : handleBack}
            >
              {currentStep === 0 ? (
                <>Skip Onboarding</>
              ) : (
                <><MdArrowBack className="w-5 h-5 mr-2" /> Back</>
              )}
            </Button>
            <Button onClick={handleNext}>
              {currentStep === STEPS.length - 2 ? 'Finish' : 'Next'}
              <MdArrowForward className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
