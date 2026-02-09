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
  suggestedRecipes?: Record<string, SuggestedRecipe>;
}

export type UnitSystem = 'metric' | 'imperial';

export type WeekStartDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface AppSettings {
  recipeSystemPrompt: string;
  mealPlanSystemPrompt: string;
  unitSystem: UnitSystem;
  weekStartDay: WeekStartDay;
}

export interface SuggestedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  tags: string[];
  mealTypes: MealType[];
  isLoading: boolean;
  loadedFields: Set<string>;
}
