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

    const prompt = `Consolidate this shopping list into a practical grocery run. Combine duplicate ingredients and convert to real-world buying quantities.

Raw ingredient list:
${ingredientList}

Rules:
1. Combine duplicates and sum quantities (e.g., "2 cups flour" + "1 cup flour" = "Flour: 375g")
2. Convert recipe-speak into practical buying quantities a shopper can act on:
   - BAD: "grated ginger", "minced garlic", "diced onion"
   - GOOD: "Ginger: ~50g (small piece)", "Garlic: 1 head", "Onions: 3 medium"
3. Use metric weights/volumes where practical. Round to sensible buying amounts.
4. Organize into store sections: Produce, Proteins, Dairy & Eggs, Grains & Bread, Spices & Seasonings, Oils & Condiments, Other
5. Only include categories that have items
6. Sort items alphabetically within each category
7. Separate common pantry staples the cook likely already has at home (salt, pepper, cooking oil, rice, flour, sugar, butter, soy sauce, vinegar, etc.) into the pantryItems list. Still include their approximate quantities needed.`;

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: consolidatedShoppingListSchema }),
      system: 'You are a practical kitchen assistant that creates grocery shopping lists optimized for a real store trip. Always express items as buyable quantities, never as recipe preparation terms.',
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
