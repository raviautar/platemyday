'use client';

import { useEffect } from 'react';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar, RotateCcw, Trash2 } from 'lucide-react';

interface MealPlanHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MealPlanHistory({ isOpen, onClose }: MealPlanHistoryProps) {
  const { mealPlanHistory, loadHistory, restoreMealPlan, deleteMealPlan, historyLoading, weekPlan } = useMealPlan();
  const { track } = useAnalytics();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      track(EVENTS.MEAL_PLAN_HISTORY_VIEWED);
    }
  }, [isOpen, loadHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRestore = async (planId: string) => {
    await restoreMealPlan(planId);
    track(EVENTS.MEAL_PLAN_RESTORED, { plan_id: planId });
    showToast('Meal plan restored!');
    onClose();
  };

  const handleDelete = async (planId: string) => {
    await deleteMealPlan(planId);
    showToast('Meal plan deleted');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMealCount = (plan: typeof mealPlanHistory[0]) => {
    return plan.days.reduce((sum, day) => sum + day.meals.length, 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meal Plan History">
      <div className="space-y-3">
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : mealPlanHistory.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">No meal plan history yet.</p>
            <p className="text-muted text-xs mt-1">Generate your first meal plan to get started!</p>
          </div>
        ) : (
          mealPlanHistory.map((plan) => {
            const isActive = plan.id === weekPlan?.id;
            return (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">
                        Week of {formatDate(plan.weekStartDate)}
                      </p>
                      {isActive && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-dark">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {getMealCount(plan)} meals · Created {formatDate(plan.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRestore(plan.id)}
                        title="Restore this meal plan"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Restore
                      </Button>
                    )}
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 text-muted hover:text-danger rounded transition-colors"
                      title="Delete this meal plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
