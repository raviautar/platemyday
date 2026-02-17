'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useTour } from '@/contexts/TourContext';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

const PADDING = 8;
const TOOLTIP_GAP = 12;
const POLL_INTERVAL = 50;
const MAX_POLL_ATTEMPTS = 40; // 2 seconds

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const { isActive, currentStep, currentStepIndex, totalSteps, nextStep, prevStep, skipTour } = useTour();
  const pathname = usePathname();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Portal mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find and track target element
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      setReady(false);
      return;
    }

    // If centered (no target), mark ready immediately
    if (!currentStep.targetSelector) {
      setTargetRect(null);
      setReady(true);
      return;
    }

    // Only poll when we're on the correct page
    if (currentStep.page !== pathname) {
      setReady(false);
      return;
    }

    let attempts = 0;
    let rafId: number;

    const poll = () => {
      const el = document.querySelector(currentStep.targetSelector!);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        setReady(true);
        return;
      }
      attempts++;
      if (attempts < MAX_POLL_ATTEMPTS) {
        rafId = window.setTimeout(poll, POLL_INTERVAL) as unknown as number;
      } else {
        // Fallback: show centered if element not found
        setTargetRect(null);
        setReady(true);
      }
    };

    poll();

    return () => {
      if (rafId) clearTimeout(rafId);
    };
  }, [isActive, currentStep, pathname]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isActive || !currentStep?.targetSelector || !ready) return;

    const update = () => {
      const el = document.querySelector(currentStep.targetSelector!);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isActive, currentStep, ready]);

  // Position tooltip relative to target
  const positionTooltip = useCallback(() => {
    if (!tooltipRef.current || !currentStep) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!targetRect || currentStep.placement === 'center') {
      // Center on screen
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      return;
    }

    let top = 0;
    let left = 0;
    const placement = currentStep.placement;

    if (placement === 'bottom') {
      top = targetRect.top + targetRect.height + PADDING + TOOLTIP_GAP;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    } else if (placement === 'top') {
      top = targetRect.top - PADDING - TOOLTIP_GAP - tooltipRect.height;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    } else if (placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left + targetRect.width + PADDING + TOOLTIP_GAP;
    } else if (placement === 'left') {
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - PADDING - TOOLTIP_GAP - tooltipRect.width;
    }

    // Clamp to viewport
    top = Math.max(8, Math.min(top, vh - tooltipRect.height - 8));
    left = Math.max(8, Math.min(left, vw - tooltipRect.width - 8));

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
    });
  }, [targetRect, currentStep]);

  useEffect(() => {
    if (ready) {
      // Small delay to let tooltip render before positioning
      requestAnimationFrame(positionTooltip);
    }
  }, [ready, positionTooltip, currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!mounted || !isActive || !currentStep || !ready) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;
  const isCentered = !targetRect || currentStep.placement === 'center';

  const overlay = (
    <div className="fixed inset-0 z-[9000]" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={skipTour}
      />

      {/* Spotlight cutout */}
      {targetRect && !isCentered && (
        <div
          className="absolute rounded-xl transition-all duration-300 ease-out"
          style={{
            top: targetRect.top - PADDING,
            left: targetRect.left - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            backgroundColor: 'transparent',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="animate-fade-in"
        style={{
          ...tooltipStyle,
          zIndex: 9001,
          maxWidth: 'min(340px, calc(100vw - 32px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-border/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted">
                {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>
            <button
              onClick={skipTour}
              className="p-1 rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pt-2 pb-4">
            <h3 className="text-base font-semibold text-foreground mb-1.5 font-[family-name:var(--font-outfit)]">
              {currentStep.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-3">
            <div className="h-1 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-5 pb-4">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground disabled:opacity-0 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-br from-primary to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
