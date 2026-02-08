export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  tags: string[];
  createdAt: string;
  isAIGenerated: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealSlot {
  id: string;
  recipeId: string;
  mealType: MealType;
  recipeTitleFallback?: string;
}

export interface DayPlan {
  date: string;
  dayOfWeek: string;
  meals: MealSlot[];
}

export interface WeekPlan {
  id: string;
  weekStartDate: string;
  days: DayPlan[];
  createdAt: string;
}

export type UnitSystem = 'metric' | 'imperial';

export interface AppSettings {
  recipeSystemPrompt: string;
  mealPlanSystemPrompt: string;
  unitSystem: UnitSystem;
}
