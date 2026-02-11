import { AppSettings, UnitSystem, UserPreferences } from '@/types';

export const getRecipeSystemPrompt = (unitSystem: UnitSystem): string => {
  const unitGuidance = unitSystem === 'metric' 
    ? 'Use metric units (grams, kilograms, milliliters, liters, Celsius) for all measurements and temperatures.'
    : 'Use imperial units (cups, tablespoons, teaspoons, ounces, pounds, Fahrenheit) for all measurements and temperatures.';
  
  return `You are a creative chef assistant. Generate detailed, practical recipes based on the user's request. ${unitGuidance} Include precise measurements, clear instructions, and helpful tips. Keep recipes accessible for home cooks.`;
};

export const getMealPlanSystemPrompt = (unitSystem: UnitSystem): string => {
  const unitGuidance = unitSystem === 'metric'
    ? 'When suggesting recipes, use metric measurements.'
    : 'When suggesting recipes, use imperial measurements.';
  
  return `You are a meal planning assistant. Create balanced, varied weekly meal plans. ${unitGuidance} Consider nutrition, variety, and practical cooking schedules. Mix quick meals with more involved recipes throughout the week.`;
};

export const DEFAULT_RECIPE_SYSTEM_PROMPT = getRecipeSystemPrompt('metric');
export const DEFAULT_MEAL_PLAN_SYSTEM_PROMPT = getMealPlanSystemPrompt('metric');

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  dietaryType: null,
  allergies: [],
  servings: 2,
  macroGoals: {},
  onboardingCompleted: false,
  onboardingDismissed: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
  recipeSystemPrompt: DEFAULT_RECIPE_SYSTEM_PROMPT,
  mealPlanSystemPrompt: DEFAULT_MEAL_PLAN_SYSTEM_PROMPT,
  unitSystem: 'metric',
  weekStartDay: 'Monday',
  preferences: DEFAULT_USER_PREFERENCES,
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

/**
 * Formats user preferences into a string for AI prompts
 */
export function formatPreferencesPrompt(preferences: UserPreferences): string {
  const parts: string[] = [];

  if (preferences.dietaryType) {
    parts.push(`Dietary preference: ${preferences.dietaryType}`);
  }

  if (preferences.allergies.length > 0) {
    parts.push(`Allergies/Restrictions: Avoid ${preferences.allergies.join(', ')}`);
  }

  if (preferences.servings !== 2) {
    parts.push(`Servings: ${preferences.servings} people`);
  }

  const macros = preferences.macroGoals;
  if (macros.protein || macros.carbs || macros.fiber) {
    const macroDesc = [];
    if (macros.protein) macroDesc.push(`${macros.protein} protein`);
    if (macros.carbs) macroDesc.push(`${macros.carbs} carbs`);
    if (macros.fiber) macroDesc.push(`${macros.fiber} fiber`);
    parts.push(`Macro goals: ${macroDesc.join(', ')}`);
  }

  return parts.length > 0 ? parts.join('. ') + '.' : '';
}
