import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { mealPlanWithDetailsSchema } from '@/lib/ai';
import { getSettings } from '@/lib/supabase/db';
import { formatPreferencesPrompt } from '@/lib/constants';
import {
  consumeRateLimit,
  generateMealPlanRequestSchema,
  parseJsonBody,
  rateLimitResponse,
  validationErrorResponse,
} from '@/lib/ai-guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    if (body === null) {
      return Response.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const parsed = generateMealPlanRequestSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { recipes, systemPrompt, preferences, weekStartDay, userId, anonymousId } = parsed.data;

    const rateLimit = consumeRateLimit({
      request: req,
      key: 'generate-meal-plan',
      limit: 5,
      windowMs: 15 * 60 * 1000,
      userId,
      anonymousId,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse('meal plan generation', rateLimit.retryAfterSeconds);
    }

    // Fetch user settings to get structured preferences
    const settings = userId || anonymousId
      ? await getSettings(userId ?? null, anonymousId ?? '')
      : null;
    const prefsPrompt = settings ? formatPreferencesPrompt(settings.preferences) : preferences || '';

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

    const prompt = `Create a complete 7-day meal plan starting from ${weekStartDay} with full recipe details.

IMPORTANT: The days array MUST start with ${weekStartDay} and follow this exact order: ${orderedDays.join(', ')}

${hasRecipes ? `${recipes.length > recipesForPrompt.length ? `NOTE: Only the first ${recipesForPrompt.length} recipes are included to keep generation stable.\n` : ''}Available recipes in user's library:\n${recipeList}` : 'The user has no recipes in their library yet. Create ALL new recipes with complete details.'}

${prefsPrompt ? `User preferences: ${prefsPrompt}` : ''}
${preferences ? `Additional context for this week: ${preferences}` : ''}

IMPORTANT:
${hasRecipes ? '1. Use existing recipes from the library when appropriate (include their IDs)' : '1. Create all new recipes since the user has no library yet'}
2. For any NEW recipes not in the library, provide COMPLETE details including:
   - Full list of ingredients with measurements
   - Step-by-step cooking instructions
   - Servings, prep time, cook time
   - Relevant tags (e.g., "vegetarian", "quick", "italian")
   - Estimated nutrition per serving (calories, protein in grams, carbs in grams, fat in grams)
3. Each day should have breakfast, lunch, and dinner at minimum
4. Add snacks where appropriate for variety
5. Make sure recipe titles in meals exactly match titles in newRecipes array
6. Days must be in this exact order: ${orderedDays.join(', ')}
7. For EVERY meal, include estimatedNutrition with realistic calorie and macro estimates per serving`;

    const result = streamObject({
      model: google('gemini-3-flash-preview'),
      schema: mealPlanWithDetailsSchema,
      system: systemPrompt,
      prompt,
    });

    // Stream partial objects as NDJSON (one JSON object per line).
    // Each line is the full partial object so far. Throttled to ~500ms intervals.
    // Final line is prefixed with "DONE:" and contains the validated complete object.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let lastSendTime = 0;

        try {
          for await (const partial of result.partialObjectStream) {
            const now = Date.now();
            if (now - lastSendTime >= 500) {
              controller.enqueue(encoder.encode(JSON.stringify(partial) + '\n'));
              lastSendTime = now;
            }
          }

          const finalObject = await result.object;
          controller.enqueue(encoder.encode('DONE:' + JSON.stringify(finalObject) + '\n'));
          controller.close();
        } catch (error) {
          console.error('Meal plan streaming error:', error);
          controller.enqueue(encoder.encode('ERROR:' + JSON.stringify({
            error: 'Failed to generate meal plan. Please try again.',
          }) + '\n'));
          controller.close();
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
    console.error('Meal plan generation error:', error);
    return Response.json(
      { error: 'Failed to generate meal plan. Please check your API key and try again.' },
      { status: 500 },
    );
  }
}
