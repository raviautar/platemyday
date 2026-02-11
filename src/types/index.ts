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

export interface UserPreferences {
  dietaryType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'primal' | null;
  allergies: string[]; // ['nuts', 'dairy', 'gluten', 'soy', 'shellfish', 'eggs']
  servings: number; // Default: 2
  macroGoals: {
    protein?: 'low' | 'moderate' | 'high';
    carbs?: 'low' | 'moderate' | 'high';
    fiber?: 'low' | 'moderate' | 'high';
  };
  onboardingCompleted: boolean;
  onboardingDismissed: boolean;
}

export interface AppSettings {
  recipeSystemPrompt: string;
  mealPlanSystemPrompt: string;
  unitSystem: UnitSystem;
  weekStartDay: WeekStartDay;
  preferences: UserPreferences;
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
}
