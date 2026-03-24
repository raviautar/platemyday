import { z } from 'zod';

const nutritionSchema = z.object({
  calories: z.number().describe('Estimated calories per serving'),
  protein: z.number().describe('Estimated protein in grams per serving'),
  carbs: z.number().describe('Estimated carbohydrates in grams per serving'),
  fat: z.number().describe('Estimated fat in grams per serving'),
});

export const recipeSchema = z.object({
  title: z.string().describe('Recipe title'),
  description: z.string().describe('Brief description of the dish'),
  ingredients: z.array(z.string()).describe('List of ingredients with measurements'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions'),
  servings: z.number().describe('Number of servings'),
  prepTimeMinutes: z.number().describe('Preparation time in minutes'),
  cookTimeMinutes: z.number().describe('Cooking time in minutes'),
  tags: z.array(z.string()).describe('Tags like "vegetarian", "quick", "italian"'),
  estimatedNutrition: nutritionSchema.optional().describe('Estimated nutrition per serving'),
});

export const mealPlanDaySchema = z.object({
  dayOfWeek: z.string().describe('Day of the week'),
  meals: z.array(z.object({
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    recipeTitle: z.string().describe('Title of recipe'),
    recipeId: z.string().optional().describe('ID of existing recipe if using one from library'),
    estimatedNutrition: nutritionSchema.describe('Estimated nutrition per serving for this meal'),
    description: z.string().optional().describe('Brief description — new recipes only'),
    ingredients: z.array(z.string()).optional().describe('Ingredients with measurements — new recipes only'),
    instructions: z.array(z.string()).optional().describe('Step-by-step instructions — new recipes only'),
    servings: z.number().optional().describe('Number of servings — new recipes only'),
    prepTimeMinutes: z.number().optional().describe('Prep time in minutes — new recipes only'),
    cookTimeMinutes: z.number().optional().describe('Cook time in minutes — new recipes only'),
    tags: z.array(z.string()).optional().describe('Tags like "vegetarian", "quick", "italian" — new recipes only'),
  })),
});

export const consolidatedShoppingListSchema = z.object({
  categories: z.array(z.object({
    name: z.string().describe('Category name (e.g., Produce, Dairy & Eggs, Proteins, Grains & Bread, Spices & Seasonings, Oils & Condiments, Other)'),
    items: z.array(z.string()).describe('Consolidated ingredient items with practical buying quantities'),
  })).describe('Items to buy, organized by grocery store section. Do NOT include common pantry staples here.'),
  pantryItems: z.array(z.string()).describe('Common staples the cook likely already has at home (e.g. salt, pepper, olive oil, rice, flour, sugar, soy sauce, butter). List with approximate total quantities needed.'),
});

export const ingredientExtractionSchema = z.object({
  ingredients: z.array(z.string()).describe('List of food ingredient names detected in the images'),
});

export type AIRecipeOutput = z.infer<typeof recipeSchema>;
export type AIMealPlanDayOutput = z.infer<typeof mealPlanDaySchema>;
export type AIConsolidatedShoppingList = z.infer<typeof consolidatedShoppingListSchema>;
