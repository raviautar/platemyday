import { z } from 'zod';

export const nutritionSchema = z.object({
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

export const mealPlanWithDetailsSchema = z.object({
  days: z.array(z.object({
    dayOfWeek: z.string().describe('Day of the week'),
    meals: z.array(z.object({
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      recipeTitle: z.string().describe('Title of recipe'),
      recipeId: z.string().optional().describe('ID of existing recipe if using one from library'),
      estimatedNutrition: nutritionSchema.describe('Estimated nutrition per serving for this meal'),
    })),
  })).length(7).describe('7 consecutive days of meal plans starting from the specified week start day'),
  newRecipes: z.array(z.object({
    title: z.string().describe('Recipe title - must match recipeTitle in meals'),
    description: z.string().describe('Brief description of the dish'),
    ingredients: z.array(z.string()).describe('List of ingredients with measurements'),
    instructions: z.array(z.string()).describe('Step-by-step cooking instructions'),
    servings: z.number().describe('Number of servings'),
    prepTimeMinutes: z.number().describe('Preparation time in minutes'),
    cookTimeMinutes: z.number().describe('Cooking time in minutes'),
    tags: z.array(z.string()).describe('Tags like "vegetarian", "quick", "italian"'),
    estimatedNutrition: nutritionSchema.describe('Estimated nutrition per serving'),
  })).describe('Full details for any new recipes not in the user\'s library'),
});

export const consolidatedShoppingListSchema = z.object({
  categories: z.array(z.object({
    name: z.string().describe('Category name (e.g., Produce, Dairy & Eggs, Proteins, Grains & Bread, Spices & Seasonings, Oils & Condiments, Other)'),
    items: z.array(z.string()).describe('Consolidated ingredient items with practical buying quantities'),
  })).describe('Items to buy, organized by grocery store section. Do NOT include common pantry staples here.'),
  pantryItems: z.array(z.string()).describe('Common staples the cook likely already has at home (e.g. salt, pepper, olive oil, rice, flour, sugar, soy sauce, butter). List with approximate total quantities needed.'),
});

export type AIRecipeOutput = z.infer<typeof recipeSchema>;
export type AIMealPlanWithDetailsOutput = z.infer<typeof mealPlanWithDetailsSchema>;
export type AIConsolidatedShoppingList = z.infer<typeof consolidatedShoppingListSchema>;
