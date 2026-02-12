import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { consolidatedShoppingListSchema } from '@/lib/ai';
import { z } from 'zod';
import {
  consumeRateLimit,
  parseJsonBody,
  rateLimitResponse,
} from '@/lib/ai-guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const requestSchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(500)).min(1).max(500),
  userId: z.string().max(128).optional(),
  anonymousId: z.string().max(128).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    if (body === null) {
      return Response.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const { ingredients, userId, anonymousId } = parsed.data;

    const rateLimit = consumeRateLimit({
      request: req,
      key: 'consolidate-shopping',
      limit: 10,
      windowMs: 10 * 60 * 1000,
      userId,
      anonymousId,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse('shopping list consolidation', rateLimit.retryAfterSeconds);
    }

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
      model: google('gemini-2.5-flash-lite'),
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
