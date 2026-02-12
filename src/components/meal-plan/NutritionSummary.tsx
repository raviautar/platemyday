'use client';

import { useMemo, useState } from 'react';
import { WeekPlan, NutritionInfo } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NutritionSummaryProps {
  weekPlan: WeekPlan;
}

function PieChart({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;

  const proteinPct = (protein / total) * 100;
  const carbsPct = (carbs / total) * 100;

  return (
    <div
      className="w-16 h-16 rounded-full shrink-0"
      style={{
        background: `conic-gradient(
          #3B82F6 0% ${proteinPct}%,
          #F59E0B ${proteinPct}% ${proteinPct + carbsPct}%,
          #EC4899 ${proteinPct + carbsPct}% 100%
        )`,
      }}
    />
  );
}

export function NutritionSummary({ weekPlan }: NutritionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (weeklyTotals.mealsWithNutrition === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-border p-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {weeklyTotals.dailyAvg && (
            <PieChart
              protein={weeklyTotals.dailyAvg.protein}
              carbs={weeklyTotals.dailyAvg.carbs}
              fat={weeklyTotals.dailyAvg.fat}
            />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Weekly Nutrition</h3>
            <p className="text-sm text-muted">
              ~{weeklyTotals.dailyAvg?.calories} cal/day avg
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Daily Average */}
          {weeklyTotals.dailyAvg && (
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Daily Average</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-surface rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-foreground">{weeklyTotals.dailyAvg.calories}</p>
                  <p className="text-[10px] text-muted">calories</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-blue-600">{weeklyTotals.dailyAvg.protein}g</p>
                  <p className="text-[10px] text-muted">protein</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-amber-600">{weeklyTotals.dailyAvg.carbs}g</p>
                  <p className="text-[10px] text-muted">carbs</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-pink-600">{weeklyTotals.dailyAvg.fat}g</p>
                  <p className="text-[10px] text-muted">fat</p>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Total */}
          <div>
            <h4 className="text-sm font-medium text-muted mb-2">Weekly Total</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{weeklyTotals.calories.toLocaleString()}</p>
                <p className="text-[10px] text-muted">calories</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600">{weeklyTotals.protein}g</p>
                <p className="text-[10px] text-muted">protein</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-amber-600">{weeklyTotals.carbs}g</p>
                <p className="text-[10px] text-muted">carbs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-pink-600">{weeklyTotals.fat}g</p>
                <p className="text-[10px] text-muted">fat</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Protein
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Carbs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500" /> Fat
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
