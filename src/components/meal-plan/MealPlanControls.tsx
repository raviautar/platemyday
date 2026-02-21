'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { PreferencesEditor } from '@/components/settings/PreferencesEditor';
import { Settings2, Sparkles, X } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { useSettings } from '@/contexts/SettingsContext';
import { DEFAULT_USER_PREFERENCES } from '@/lib/constants';

interface MealPlanControlsProps {
  onGenerate: () => Promise<void>;
  hasExistingPlan: boolean;
  loading: boolean;
}

export function MealPlanControls({ onGenerate, hasExistingPlan, loading }: MealPlanControlsProps) {
  const { unlimited, creditsRemaining, loading: billingLoading } = useBilling();
  const { settings } = useSettings();
  const [showPreferences, setShowPreferences] = useState(false);

  const prefs = { ...DEFAULT_USER_PREFERENCES, ...settings.preferences };
  const hasCustomizations =
    (prefs.pantryIngredients?.length ?? 0) > 0 ||
    (prefs.mealTypes?.length ?? 0) > 0 ||
    (prefs.mealNotes?.length ?? 0) > 0;

  return (
    <>
      <div className="bg-white rounded-xl border border-border p-3 sm:p-4">
        <div className="flex gap-1.5 sm:gap-2 md:gap-3">
          <button
            onClick={() => setShowPreferences(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted hover:text-primary transition-all duration-200 relative"
            aria-label="Meal plan preferences"
          >
            <Settings2 className="w-5 h-5 shrink-0" />
            <span className="font-medium hidden sm:inline">Preferences</span>
            {hasCustomizations && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          <Button
            onClick={() => onGenerate()}
            disabled={loading}
            size="lg"
            className="flex-1 gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base min-w-0"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="shrink-0" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="whitespace-nowrap">{hasExistingPlan ? 'Regenerate' : 'Generate'}</span>
              </>
            )}
          </Button>
        </div>

        {!billingLoading && !unlimited && (
          <p className={`text-xs mt-2 text-center ${(creditsRemaining ?? 0) <= 2 ? 'text-accent font-medium' : 'text-muted'
            }`}>
            {(creditsRemaining ?? 0) === 0
              ? 'No free generations remaining'
              : `${creditsRemaining} free generation${creditsRemaining === 1 ? '' : 's'} remaining`}
          </p>
        )}

      </div>

      {/* Preferences Modal */}
      <Modal isOpen={showPreferences} onClose={() => setShowPreferences(false)}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 pb-2 border-b border-border/40">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
              <p className="text-xs text-muted mt-0.5">Customize your meal plan preferences</p>
            </div>
            <button onClick={() => setShowPreferences(false)} className="text-muted hover:text-foreground p-1.5 hover:bg-surface/50 rounded-lg transition-colors -mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <PreferencesEditor defaultExpanded={['pantry', 'notes']} compact />

          <div className="pt-2 border-t border-border/40">
            <Button
              className="w-full text-sm"
              onClick={() => setShowPreferences(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
