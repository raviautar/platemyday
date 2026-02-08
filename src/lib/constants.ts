import { AppSettings } from '@/types';

export const DEFAULT_RECIPE_SYSTEM_PROMPT = `You are a creative chef assistant. Generate detailed, practical recipes based on the user's request. Include precise measurements, clear instructions, and helpful tips. Keep recipes accessible for home cooks.`;

export const DEFAULT_MEAL_PLAN_SYSTEM_PROMPT = `You are a meal planning assistant. Create balanced, varied weekly meal plans. Consider nutrition, variety, and practical cooking schedules. Mix quick meals with more involved recipes throughout the week.`;

export const DEFAULT_SETTINGS: AppSettings = {
  recipeSystemPrompt: DEFAULT_RECIPE_SYSTEM_PROMPT,
  mealPlanSystemPrompt: DEFAULT_MEAL_PLAN_SYSTEM_PROMPT,
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export const STORAGE_KEYS = {
  RECIPES: 'platemyday-recipes',
  WEEK_PLAN: 'platemyday-week-plan',
  SETTINGS: 'platemyday-settings',
} as const;
