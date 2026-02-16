import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { consolidatedShoppingListSchema } from '@/lib/ai';
import {
  consolidateShoppingListRequestSchema,
  validateAndRateLimit,
} from '@/lib/ai-guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const validation = await validateAndRateLimit(req, consolidateShoppingListRequestSchema, {
      key: 'consolidate-shopping',
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (validation instanceof Response) return validation;

    const { ingredients } = validation.data;

    const ingredientList = ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n');

    const prompt = `Consolidate this shopping list by combining duplicate ingredients, normalizing quantities, and organizing by grocery store section.

Raw ingredient list:
${ingredientList}

Rules:
1. Combine duplicates (e.g., "2 cups flour" + "1 cup flour" = "3 cups flour")
2. Keep ingredient descriptions clear and concise
3. Organize into categories: Produce, Proteins, Dairy & Eggs, Pantry & Grains, Spices & Seasonings, Oils & Condiments, Other
4. Only include categories that have items
5. Sort items alphabetically within each category`;

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: consolidatedShoppingListSchema }),
      system: 'You are a helpful kitchen assistant that organizes shopping lists efficiently.',
      prompt,
    });

    if (!result.output) {
      return Response.json(
        { error: 'Failed to consolidate shopping list.' },
        { status: 500 }
      );
    }

    return Response.json(result.output);
  } catch (error) {
    console.error('Shopping list consolidation error:', error);
    return Response.json(
      { error: 'Failed to consolidate shopping list. Please try again.' },
      { status: 500 }
    );
  }
}
