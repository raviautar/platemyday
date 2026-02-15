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

export const DIET_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore', desc: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish' },
  { value: 'vegan', label: 'Vegan', desc: 'No animal products' },
  { value: 'pescatarian', label: 'Pescatarian', desc: 'Fish but no meat' },
  { value: 'keto', label: 'Keto', desc: 'Low-carb, high-fat' },
  { value: 'paleo', label: 'Paleo', desc: 'Whole foods, no grains' },
  { value: 'primal', label: 'Primal', desc: 'Like paleo, includes dairy' },
  { value: 'mediterranean', label: 'Mediterranean', desc: 'Olive oil, fish, vegetables' },
  { value: 'low-carb', label: 'Low-Carb', desc: 'Reduced carbohydrates' },
  { value: 'flexitarian', label: 'Flexitarian', desc: 'Mostly plant-based' },
  { value: 'whole30', label: 'Whole30', desc: '30-day reset program' },
  { value: 'gluten-free', label: 'Gluten-Free', desc: 'No gluten-containing foods' },
] as const;

export const ALLERGY_OPTIONS = [
  { value: 'nuts', label: 'Nuts', icon: '🥜' },
  { value: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'gluten', label: 'Gluten', icon: '🌾' },
  { value: 'soy', label: 'Soy', icon: '🫘' },
  { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { value: 'fish', label: 'Fish', icon: '🐟' },
  { value: 'eggs', label: 'Eggs', icon: '🥚' },
  { value: 'sesame', label: 'Sesame', icon: '🫘' },
  { value: 'corn', label: 'Corn', icon: '🌽' },
  { value: 'nightshades', label: 'Nightshades', icon: '🍅' },
  { value: 'red-meat', label: 'Red Meat', icon: '🥩' },
  { value: 'poultry', label: 'Poultry', icon: '🍗' },
  { value: 'alcohol', label: 'Alcohol', icon: '🍷' },
] as const;

export const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian',
  'American', 'Japanese', 'Thai', 'Middle Eastern', 'French',
] as const;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  dietaryType: null,
  allergies: [],
  cuisinePreferences: [],
  servings: 2,
  macroGoals: {},
  mealNotes: [],
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

  if (preferences.cuisinePreferences && preferences.cuisinePreferences.length > 0) {
    parts.push(
      `Preferred cuisines include ${preferences.cuisinePreferences.join(', ')}, but still include variety from other cuisines for a well-rounded meal plan`
    );
  }

  if (preferences.servings !== 2) {
    parts.push(`Servings: ${preferences.servings} people`);
  }

  const macros = preferences.macroGoals;
  if (macros.protein || macros.carbs || macros.fiber || macros.calories) {
    const macroDesc = [];
    if (macros.protein) {
      const proteinValue = typeof macros.protein === 'number' ? `${macros.protein}g` : macros.protein;
      macroDesc.push(`${proteinValue} protein`);
    }
    if (macros.carbs) {
      const carbsValue = typeof macros.carbs === 'number' ? `${macros.carbs}g` : macros.carbs;
      macroDesc.push(`${carbsValue} carbs`);
    }
    if (macros.fiber) {
      const fiberValue = typeof macros.fiber === 'number' ? `${macros.fiber}g` : macros.fiber;
      macroDesc.push(`${fiberValue} fiber`);
    }
    if (macros.calories) {
      macroDesc.push(`${macros.calories} calories per day`);
    }
    parts.push(`Macro goals: ${macroDesc.join(', ')}`);
  }

  if (preferences.mealNotes.length > 0) {
    parts.push(`Additional meal preferences: ${preferences.mealNotes.join('. ')}`);
  }

  return parts.length > 0 ? parts.join('. ') + '.' : '';
}
