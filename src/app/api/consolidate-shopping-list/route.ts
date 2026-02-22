import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { consolidatedShoppingListSchema } from '@/lib/ai';
import {
  consolidateShoppingListRequestSchema,
  validateAndRateLimit,
} from '@/lib/ai-guardrails';
import { getMealPlanById, getRecipes } from '@/lib/supabase/db';
import { createServiceClient } from '@/lib/supabase/server';
import { Recipe, WeekPlan } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function collectIngredients(
  weekPlan: WeekPlan,
  recipes: Recipe[],
): string[] {
  const recipesMap = new Map(recipes.map(r => [r.id, r.ingredients]));
  const allIngredients: string[] = [];

  for (const day of weekPlan.days) {
    for (const meal of day.meals) {
      if (meal.recipeId) {
        const ingredients = recipesMap.get(meal.recipeId);
        if (ingredients) allIngredients.push(...ingredients);
      } else if (meal.recipeTitleFallback) {
        const suggested = weekPlan.suggestedRecipes?.[meal.recipeTitleFallback];
        if (suggested) allIngredients.push(...suggested.ingredients);
      }
    }
  }

  return allIngredients.filter(i => i.trim());
}

export async function POST(req: Request) {
  try {
    const validation = await validateAndRateLimit(req, consolidateShoppingListRequestSchema, {
      key: 'consolidate-shopping',
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (validation instanceof Response) return validation;

    const { mealPlanId, userId, anonymousId } = validation.data;

    const supabase = createServiceClient();
    const [mealPlan, recipes] = await Promise.all([
      getMealPlanById(supabase, mealPlanId, userId ?? null, anonymousId ?? ''),
      getRecipes(supabase, userId ?? null, anonymousId ?? '')
    ]);

    if (!mealPlan) {
      return Response.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    const ingredients = collectIngredients(mealPlan, recipes);

    // If no ingredients, return empty immediately
    if (ingredients.length === 0) {
      return Response.json({ categories: [], pantryItems: [] });
    }

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

    const result = streamObject({
      model: google('gemini-2.5-flash'),
      schema: consolidatedShoppingListSchema,
      system: 'You are a practical kitchen assistant that creates grocery shopping lists optimized for a real store trip. Always express items as buyable quantities, never as recipe preparation terms.',
      prompt,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let lastSendTime = 0;
        try {
          for await (const partial of result.partialObjectStream) {
            if (req.signal.aborted) break;
            const now = Date.now();
            if (now - lastSendTime >= 500) {
              try {
                controller.enqueue(encoder.encode(JSON.stringify(partial) + '\n'));
                lastSendTime = now;
              } catch (e: any) {
                if (e?.code === 'ERR_INVALID_STATE' || e?.message?.includes('closed')) break;
                throw e;
              }
            }
          }

          if (!req.signal.aborted) {
            const finalObject = await result.object;
            try {
              controller.enqueue(encoder.encode('DONE:' + JSON.stringify(finalObject) + '\n'));
              controller.close();
            } catch (e) {
              // ignore
            }
          }
        } catch (error: any) {
          if (error?.name === 'AbortError' || req.signal.aborted) return;
          console.error('Shopping list streaming error:', error);
          try {
            controller.enqueue(encoder.encode('ERROR:' + JSON.stringify({
              error: 'Failed to consolidate shopping list.',
            }) + '\n'));
            controller.close();
          } catch (e) {
            // ignore
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Shopping list consolidation error:', error);
    return Response.json(
      { error: 'Failed to consolidate shopping list. Please try again.' },
      { status: 500 }
    );
  }
}
