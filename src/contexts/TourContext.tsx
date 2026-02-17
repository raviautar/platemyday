'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TOUR_STEPS, type TourStep } from '@/lib/tour-steps';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';

const STORAGE_KEY = 'platemyday_tour';

interface TourState {
  active: boolean;
  currentStepIndex: number;
}

interface TourContextValue {
  isActive: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextValue>({
  isActive: false,
  currentStep: null,
  currentStepIndex: 0,
  totalSteps: TOUR_STEPS.length,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
});

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { track } = useAnalytics();
  const [state, setState] = useState<TourState>({ active: false, currentStepIndex: 0 });
  const hasHydrated = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TourState;
        if (parsed.active) {
          setState(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    if (!hasHydrated.current) return;
    try {
      if (state.active) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch { /* ignore */ }
  }, [state]);

  const currentStep = state.active ? TOUR_STEPS[state.currentStepIndex] ?? null : null;

  // Navigate to the correct page when step's page doesn't match
  useEffect(() => {
    if (!state.active || !currentStep) return;
    if (currentStep.page !== pathname) {
      router.push(currentStep.page);
    }
  }, [state.active, state.currentStepIndex, currentStep, pathname, router]);

  const startTour = useCallback(() => {
    setState({ active: true, currentStepIndex: 0 });
    track(EVENTS.TOUR_STARTED);
  }, [track]);

  const nextStep = useCallback(() => {
    setState(prev => {
      const next = prev.currentStepIndex + 1;
      if (next >= TOUR_STEPS.length) {
        track(EVENTS.TOUR_COMPLETED, { steps_viewed: TOUR_STEPS.length });
        return { active: false, currentStepIndex: 0 };
      }
      track(EVENTS.TOUR_STEP_VIEWED, {
        step_id: TOUR_STEPS[next].id,
        step_index: next,
      });
      return { ...prev, currentStepIndex: next };
    });
  }, [track]);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const skipTour = useCallback(() => {
    track(EVENTS.TOUR_SKIPPED, {
      skipped_at_step: state.currentStepIndex,
      step_id: currentStep?.id,
    });
    setState({ active: false, currentStepIndex: 0 });
  }, [track, state.currentStepIndex, currentStep?.id]);

  return (
    <TourContext.Provider value={{
      isActive: state.active,
      currentStep,
      currentStepIndex: state.currentStepIndex,
      totalSteps: TOUR_STEPS.length,
      startTour,
      nextStep,
      prevStep,
      skipTour,
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
