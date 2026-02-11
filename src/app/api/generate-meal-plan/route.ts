import { generateText, Output } from 'ai';
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
    const recipeList = recipesForPrompt
      .map((r: { id: string; title: string; tags: string[] }) =>
        `- ${r.title} (ID: ${r.id}, Tags: ${r.tags.join(', ')})`)
      .join('\n');

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startIndex = daysOrder.indexOf(weekStartDay);
    const orderedDays = [...daysOrder.slice(startIndex), ...daysOrder.slice(0, startIndex)];

    const prompt = `Create a complete 7-day meal plan starting from ${weekStartDay} with full recipe details.

IMPORTANT: The days array MUST start with ${weekStartDay} and follow this exact order: ${orderedDays.join(', ')}

${recipes.length > recipesForPrompt.length ? `NOTE: Only the first ${recipesForPrompt.length} recipes are included to keep generation stable.\n` : ''}
Available recipes in user's library:
${recipeList}

${prefsPrompt ? `User preferences: ${prefsPrompt}` : ''}

IMPORTANT:
1. Use existing recipes from the library when appropriate (include their IDs)
2. For any NEW recipes not in the library, provide COMPLETE details including:
   - Full list of ingredients with measurements
   - Step-by-step cooking instructions
   - Servings, prep time, cook time
   - Relevant tags (e.g., "vegetarian", "quick", "italian")
3. Each day should have breakfast, lunch, and dinner at minimum
4. Add snacks where appropriate for variety
5. Make sure recipe titles in meals exactly match titles in newRecipes array
6. Days must be in this exact order: ${orderedDays.join(', ')}`;

    const result = await generateText({
      model: google('gemini-3-flash-preview'),
      output: Output.object({ schema: mealPlanWithDetailsSchema }),
      system: systemPrompt,
      prompt,
    });

    if (!result.output) {
      return Response.json(
        { error: 'Failed to generate meal plan. The AI returned an empty response.' },
        { status: 500 }
      );
    }

    return Response.json(result.output);
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return Response.json(
      { error: 'Failed to generate meal plan. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
