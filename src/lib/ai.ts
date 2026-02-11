import { z } from 'zod';

export const recipeSchema = z.object({
  title: z.string().describe('Recipe title'),
  description: z.string().describe('Brief description of the dish'),
  ingredients: z.array(z.string()).describe('List of ingredients with measurements'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions'),
  servings: z.number().describe('Number of servings'),
  prepTimeMinutes: z.number().describe('Preparation time in minutes'),
  cookTimeMinutes: z.number().describe('Cooking time in minutes'),
  tags: z.array(z.string()).describe('Tags like "vegetarian", "quick", "italian"'),
});

export const mealPlanWithDetailsSchema = z.object({
  days: z.array(z.object({
    dayOfWeek: z.string().describe('Day of the week'),
    meals: z.array(z.object({
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      recipeTitle: z.string().describe('Title of recipe'),
      recipeId: z.string().optional().describe('ID of existing recipe if using one from library'),
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
  })).describe('Full details for any new recipes not in the user\'s library'),
});

export type AIRecipeOutput = z.infer<typeof recipeSchema>;
export type AIMealPlanWithDetailsOutput = z.infer<typeof mealPlanWithDetailsSchema>;
