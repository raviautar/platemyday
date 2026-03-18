import { streamText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { mealPlanDaySchema } from '@/lib/ai';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';
import {
  generateMealPlanRequestSchema,
  validateAndRateLimit,
  getUserPreferencesPrompt,
  getUserPantryIngredients,
} from '@/lib/ai-guardrails';
import { checkCredits, consumeCredit } from '@/lib/supabase/billing';
import { getAuthUser } from '@/lib/supabase/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const validation = await validateAndRateLimit(req, generateMealPlanRequestSchema, {
      key: 'generate-meal-plan',
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (validation instanceof Response) return validation;

    const { recipes, systemPrompt, preferences, recipeMix, weekStartDay, anonymousId: clientAnonymousId } = validation.data;

    // Server-side identity: trust session, not request body
    const { userId: authUserId } = await getAuthUser();
    const userId = authUserId;
    const anonymousId = userId ? '' : (clientAnonymousId ?? '');

    if (!userId && !anonymousId) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Credit check — only meal plan generation costs credits
    const creditCheck = await checkCredits(userId ?? null, anonymousId ?? '');
    if (!creditCheck.allowed) {
      trackServerEvent(EVENTS.PAYWALL_HIT, userId ?? null, anonymousId ?? '', {
        credits_used: creditCheck.creditsUsed,
        credits_limit: creditCheck.creditsLimit,
      });
      return Response.json(
        {
          error: 'no_credits',
          message: 'You\'ve used all your free meal plan generations. Upgrade for unlimited access.',
          creditsUsed: creditCheck.creditsUsed,
          creditsLimit: creditCheck.creditsLimit,
        },
        { status: 402 },
      );
    }

    const [prefsPrompt, pantryIngredients] = await Promise.all([
      getUserPreferencesPrompt(userId ?? undefined, anonymousId || undefined),
      getUserPantryIngredients(userId ?? undefined, anonymousId || undefined),
    ]);
    const effectivePrefs = prefsPrompt || preferences || '';

    const recipesForPrompt = recipes.slice(0, 200);
    const hasRecipes = recipesForPrompt.length > 0;
    const recipeList = hasRecipes
      ? recipesForPrompt
          .map((r: { id: string; title: string; tags: string[] }) =>
            `- ${r.title} (ID: ${r.id}, Tags: ${r.tags.join(', ')})`)
          .join('\n')
      : '';

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startIndex = daysOrder.indexOf(weekStartDay);
    const orderedDays = [...daysOrder.slice(startIndex), ...daysOrder.slice(0, startIndex)];

    const hasPantry = pantryIngredients.length > 0;
    const pantrySection = hasPantry
      ? `\n## PANTRY INGREDIENTS (TOP PRIORITY)
The user has these ingredients on hand that MUST be used as much as possible: ${pantryIngredients.join(', ')}

This is the #1 priority: design meals around these ingredients to minimize food waste. Every ingredient listed should appear in at least one meal. Build recipes that creatively combine these pantry items. Only add additional grocery items when necessary to complete a recipe.`
      : '';

    const recipeMixInstructions: Record<string, string> = {
      all_new: 'Create ALL new recipes. Do not use any existing recipes from the library.',
      mostly_new: 'Strongly favor creating new recipes. Use at most 20-25% existing library recipes.',
      balanced: hasRecipes
        ? 'Use a balanced mix of existing library recipes and new recipes (roughly 50/50).'
        : 'Create all new recipes since the user has no library yet.',
      mostly_existing: 'Strongly favor existing library recipes. Create new recipes only when needed to fill gaps (at most 20-25% new).',
      all_existing: 'Use ONLY existing recipes from the library. Do not create any new recipes unless the library lacks enough variety for a full week.',
    };
    const mixInstruction = recipeMixInstructions[recipeMix] || recipeMixInstructions.balanced;

    const prompt = `Create a 7-day meal plan starting from ${weekStartDay}. Generate each day in order: ${orderedDays.join(', ')}.
${pantrySection}

${hasRecipes ? `${recipes.length > recipesForPrompt.length ? `NOTE: Only the first ${recipesForPrompt.length} recipes are included to keep generation stable.\n` : ''}Available recipes in user's library:\n${recipeList}` : 'The user has no recipes in their library yet. Create ALL new recipes with complete details.'}

${effectivePrefs ? `User preferences: ${effectivePrefs}` : ''}
${preferences ? `Additional context for this week: ${preferences}` : ''}

RECIPE MIX: ${mixInstruction}

IMPORTANT:
${hasRecipes ? `1. ${mixInstruction} When using existing recipes, include their IDs.` : '1. Create all new recipes since the user has no library yet.'}
2. For any NEW recipes not in the library, include COMPLETE details INLINE within the meal itself:
   - Full list of ingredients with measurements
   - Step-by-step cooking instructions
   - Servings, prep time, cook time
   - Relevant tags (e.g., "vegetarian", "quick", "italian")
   - Estimated nutrition per serving (calories, protein in grams, carbs in grams, fat in grams)
3. Each day MUST have breakfast, lunch, dinner, AND at least one snack — no exceptions
4. Snacks should be varied and nutritious (e.g., yogurt parfait, hummus with veggies, trail mix, fruit smoothie, etc.)
5. Days must be in this exact order: ${orderedDays.join(', ')}
6. For EVERY meal, include estimatedNutrition with realistic calorie and macro estimates per serving
${hasPantry ? `7. PANTRY PRIORITY: Recipes MUST incorporate the pantry ingredients (${pantryIngredients.join(', ')}). Spread them across the entire week. The shopping list should be minimal beyond these items.` : ''}`;

    const generationStart = Date.now();

    const result = streamText({
      model: google('gemini-2.5-flash'),
      output: Output.array({ element: mealPlanDaySchema }),
      system: systemPrompt,
      prompt,
    });

    // Stream each completed day as an NDJSON line.
    // Final line is prefixed with "DONE:" and contains the validated complete array.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const day of result.elementStream) {
            controller.enqueue(encoder.encode(JSON.stringify(day) + '\n'));
          }

          const finalDays = await result.output;

          if (!creditCheck.unlimited) {
            await consumeCredit(userId ?? null, anonymousId ?? '');
          }

          controller.enqueue(encoder.encode('DONE:' + JSON.stringify(finalDays) + '\n'));
          controller.close();

          const newRecipeCount = (finalDays || []).reduce((count: number, day) =>
            count + day.meals.filter((m) => !m.recipeId && (m.ingredients?.length ?? 0) > 0).length, 0);

          trackServerEvent(EVENTS.MEAL_PLAN_GENERATION_COMPLETED, userId ?? null, anonymousId ?? '', {
            generation_time_ms: Date.now() - generationStart,
            new_recipe_count: newRecipeCount,
          });
        } catch (error) {
          console.error('Meal plan streaming error:', error);
          controller.enqueue(encoder.encode('ERROR:' + JSON.stringify({
            error: 'Failed to generate meal plan. Please try again.',
          }) + '\n'));
          controller.close();

          trackServerEvent(EVENTS.MEAL_PLAN_GENERATION_FAILED, userId ?? null, anonymousId ?? '', {
            error_type: 'streaming_error',
          });
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return Response.json(
      { error: 'Failed to generate meal plan. Please check your API key and try again.' },
      { status: 500 },
    );
  }
}
