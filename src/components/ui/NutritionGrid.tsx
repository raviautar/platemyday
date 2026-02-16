import { NutritionInfo } from '@/types';

interface NutritionGridProps {
  nutrition: NutritionInfo;
  title?: string;
}

export function NutritionGrid({ nutrition, title = 'Estimated Nutrition (per serving)' }: NutritionGridProps) {
  return (
    <div className="bg-surface rounded-lg p-3">
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">{nutrition.calories}</p>
          <p className="text-[10px] text-muted">cal</p>
        </div>
        <div>
          <p className="text-lg font-bold text-blue-600">{nutrition.protein}g</p>
          <p className="text-[10px] text-muted">protein</p>
        </div>
        <div>
          <p className="text-lg font-bold text-amber-600">{nutrition.carbs}g</p>
          <p className="text-[10px] text-muted">carbs</p>
        </div>
        <div>
          <p className="text-lg font-bold text-pink-600">{nutrition.fat}g</p>
          <p className="text-[10px] text-muted">fat</p>
        </div>
      </div>
    </div>
  );
}
