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
  pantryIngredients: [],
  mealTypes: [],
  onboardingCompleted: false,
  onboardingDismissed: false,
};

export const MEAL_TYPE_LABELS = [
  'Quick & Easy',
  'Comfort Food',
  'Light & Healthy',
  'One-Pot Meals',
  'Meal Prep Friendly',
] as const;

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

export const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: 'bg-secondary/30 text-yellow-800',
  lunch: 'bg-primary/20 text-primary-dark',
  dinner: 'bg-accent/20 text-accent-dark',
  snack: 'bg-surface-dark text-muted',
};

export type MacroPresetKey = 'low' | 'moderate' | 'high';

export const MACRO_PRESET_GRAMS: Record<'protein' | 'carbs' | 'fiber', Record<MacroPresetKey, number>> = {
  protein: { low: 50, moderate: 100, high: 150 },
  carbs: { low: 100, moderate: 200, high: 300 },
  fiber: { low: 15, moderate: 25, high: 35 },
};

export function getMacroGramValue(
  macro: 'protein' | 'carbs' | 'fiber',
  value: 'low' | 'moderate' | 'high' | number | undefined
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return MACRO_PRESET_GRAMS[macro][value];
}

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
    const proteinG = getMacroGramValue('protein', macros.protein);
    if (proteinG !== undefined) macroDesc.push(`${proteinG}g protein`);
    const carbsG = getMacroGramValue('carbs', macros.carbs);
    if (carbsG !== undefined) macroDesc.push(`${carbsG}g carbs`);
    const fiberG = getMacroGramValue('fiber', macros.fiber);
    if (fiberG !== undefined) macroDesc.push(`${fiberG}g fiber`);
    if (macros.calories) {
      macroDesc.push(`${macros.calories} calories per day`);
    }
    if (macroDesc.length > 0) {
      parts.push(`Macro goals: ${macroDesc.join(', ')}`);
    }
  }

  if (preferences.mealNotes.length > 0) {
    parts.push(`Additional meal preferences: ${preferences.mealNotes.join('. ')}`);
  }

  if (preferences.pantryIngredients && preferences.pantryIngredients.length > 0) {
    parts.push(`I have these ingredients available that I'd like to use: ${preferences.pantryIngredients.join(', ')}`);
  }

  if (preferences.mealTypes && preferences.mealTypes.length > 0) {
    parts.push(`I'd like these types of meals: ${preferences.mealTypes.join(', ')}`);
  }

  return parts.length > 0 ? parts.join('. ') + '.' : '';
}
