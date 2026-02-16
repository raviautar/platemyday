'use client';

import { useMemo, useEffect } from 'react';
import { WeekPlan } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';

interface NutritionSummaryProps {
  weekPlan: WeekPlan;
  isOpen: boolean;
  onClose: () => void;
}

function PieChart({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;

  const proteinPct = (protein / total) * 100;
  const carbsPct = (carbs / total) * 100;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(
            #3B82F6 0% ${proteinPct}%,
            #F59E0B ${proteinPct}% ${proteinPct + carbsPct}%,
            #EC4899 ${proteinPct + carbsPct}% 100%
          )`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-white rounded-full" />
      </div>
    </div>
  );
}

function StatCard({ 
  value, 
  label, 
  color = 'foreground',
  bgColor = 'surface'
}: { 
  value: string | number; 
  label: string; 
  color?: string;
  bgColor?: string;
}) {
  const colorClasses: Record<string, string> = {
    foreground: 'text-foreground',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    pink: 'text-pink-600',
  };

  const bgClasses: Record<string, string> = {
    surface: 'bg-surface',
    blue: 'bg-blue-50/60',
    amber: 'bg-amber-50/60',
    pink: 'bg-pink-50/60',
  };

  return (
    <div className={`${bgClasses[bgColor]} rounded-xl p-3 text-center border border-border/40 shadow-sm hover:shadow-md transition-shadow min-w-0 overflow-hidden h-[86px] flex flex-col justify-center`}>
      <p className={`text-lg font-bold ${colorClasses[color]} mb-1 whitespace-nowrap truncate`}>{value}</p>
      <p className="text-[10px] font-medium text-muted uppercase tracking-wide whitespace-nowrap truncate">{label}</p>
    </div>
  );
}

export function NutritionSummary({ weekPlan, isOpen, onClose }: NutritionSummaryProps) {
  const { track } = useAnalytics();

  const weeklyTotals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    let mealsWithNutrition = 0;

    for (const day of weekPlan.days) {
      for (const meal of day.meals) {
        if (meal.estimatedNutrition) {
          calories += meal.estimatedNutrition.calories;
          protein += meal.estimatedNutrition.protein;
          carbs += meal.estimatedNutrition.carbs;
          fat += meal.estimatedNutrition.fat;
          mealsWithNutrition++;
        }
      }
    }

    const daysWithMeals = weekPlan.days.filter(d => d.meals.some(m => m.estimatedNutrition)).length;
    const dailyAvg = daysWithMeals > 0 ? {
      calories: Math.round(calories / daysWithMeals),
      protein: Math.round(protein / daysWithMeals),
      carbs: Math.round(carbs / daysWithMeals),
      fat: Math.round(fat / daysWithMeals),
    } : null;

    return { calories, protein, carbs, fat, mealsWithNutrition, dailyAvg };
  }, [weekPlan]);

  useEffect(() => {
    if (isOpen && weeklyTotals.dailyAvg) {
      track(EVENTS.NUTRITION_SUMMARY_VIEWED, {
        daily_avg_calories: weeklyTotals.dailyAvg.calories,
        meals_with_nutrition: weeklyTotals.mealsWithNutrition,
      });
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (weeklyTotals.mealsWithNutrition === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Weekly Nutrition">
      <div className="space-y-6">
        {weeklyTotals.dailyAvg && (
          <div className="flex items-center gap-4 pb-6 border-b border-border/40">
            <PieChart
              protein={weeklyTotals.dailyAvg.protein}
              carbs={weeklyTotals.dailyAvg.carbs}
              fat={weeklyTotals.dailyAvg.fat}
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Daily Average</p>
              <p className="text-2xl font-bold text-foreground">
                {weeklyTotals.dailyAvg.calories.toLocaleString()}
                <span className="text-base font-normal text-muted ml-1">cal</span>
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {weeklyTotals.dailyAvg && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Daily Average</h3>
              <div className="grid grid-cols-4 gap-2.5">
                <StatCard 
                  value={weeklyTotals.dailyAvg.calories.toLocaleString()} 
                  label="Calories"
                  color="foreground"
                  bgColor="surface"
                />
                <StatCard 
                  value={`${weeklyTotals.dailyAvg.protein}g`} 
                  label="Protein"
                  color="blue"
                  bgColor="blue"
                />
                <StatCard 
                  value={`${weeklyTotals.dailyAvg.carbs}g`} 
                  label="Carbs"
                  color="amber"
                  bgColor="amber"
                />
                <StatCard 
                  value={`${weeklyTotals.dailyAvg.fat}g`} 
                  label="Fat"
                  color="pink"
                  bgColor="pink"
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Weekly Total</h3>
            <div className="grid grid-cols-4 gap-2.5">
              <StatCard 
                value={weeklyTotals.calories.toLocaleString()} 
                label="Calories"
                color="foreground"
                bgColor="surface"
              />
              <StatCard 
                value={`${weeklyTotals.protein}g`} 
                label="Protein"
                color="blue"
                bgColor="blue"
              />
              <StatCard 
                value={`${weeklyTotals.carbs}g`} 
                label="Carbs"
                color="amber"
                bgColor="amber"
              />
              <StatCard 
                value={`${weeklyTotals.fat}g`} 
                label="Fat"
                color="pink"
                bgColor="pink"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-xs font-medium text-muted">Protein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-xs font-medium text-muted">Carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500 shadow-sm" />
              <span className="text-xs font-medium text-muted">Fat</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
