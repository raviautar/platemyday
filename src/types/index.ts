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
  estimatedNutrition?: NutritionInfo;
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
  dietaryType: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'primal' | 'mediterranean' | 'low-carb' | 'flexitarian' | 'whole30' | 'gluten-free' | null;
  allergies: string[]; // Common: 'nuts', 'peanuts', 'dairy', 'gluten', 'soy', 'shellfish', 'fish', 'eggs', 'sesame', 'corn', 'nightshades', 'red-meat', 'poultry', 'alcohol'
  servings: number; // Default: 2
  macroGoals: {
    protein?: 'low' | 'moderate' | 'high' | number;
    carbs?: 'low' | 'moderate' | 'high' | number;
    fiber?: 'low' | 'moderate' | 'high' | number;
    calories?: number;
  };
  mealNotes: string[]; // Additional preferences like "No cilantro", "Mondays no heavy cream", etc.
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

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  estimatedNutrition?: NutritionInfo;
}
