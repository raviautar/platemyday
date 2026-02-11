import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';
import { getSettings } from '@/lib/supabase/db';
import { formatPreferencesPrompt } from '@/lib/constants';
import {
  consumeRateLimit,
  parseJsonBody,
  rateLimitResponse,
  regenerateMealRequestSchema,
  validationErrorResponse,
} from '@/lib/ai-guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    if (body === null) {
      return Response.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const parsed = regenerateMealRequestSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { mealType, dayOfWeek, currentMeals, systemPrompt, userId, anonymousId } = parsed.data;

    const rateLimit = consumeRateLimit({
      request: req,
      key: 'regenerate-meal',
      limit: 25,
      windowMs: 10 * 60 * 1000,
      userId,
      anonymousId,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse('meal regeneration', rateLimit.retryAfterSeconds);
    }

    // Fetch user settings to get preferences
    const settings = userId || anonymousId
      ? await getSettings(userId ?? null, anonymousId ?? '')
      : null;
    const prefsPrompt = settings ? formatPreferencesPrompt(settings.preferences) : '';

    const currentMealsList = (currentMeals || [])
      .map((m: { title: string; mealType: string }) => `- ${m.mealType}: ${m.title}`)
      .join('\n');

    const prompt = `Suggest a single ${mealType} recipe for ${dayOfWeek}.

${currentMealsList ? `Current meals planned for this day:\n${currentMealsList}\n\nMake sure the suggestion is different from the above meals.` : ''}

${prefsPrompt ? `User preferences: ${prefsPrompt}` : ''}

CRITICAL: Provide a COMPLETE recipe with:
- Full list of ingredients with precise measurements
- Detailed step-by-step cooking instructions
- Servings, prep time, cook time
- Relevant tags`;

    const result = await generateText({
      model: google('gemini-2.5-flash-lite'),
      output: Output.object({ schema: recipeSchema }),
      system: systemPrompt || 'You are a creative chef assistant. Suggest a practical, delicious recipe.',
      prompt,
    });

    if (!result.output) {
      return Response.json(
        { error: 'Failed to generate a meal suggestion.' },
        { status: 500 }
      );
    }

    return Response.json(result.output);
  } catch (error) {
    console.error('Meal regeneration error:', error);
    return Response.json(
      { error: 'Failed to regenerate meal. Please try again.' },
      { status: 500 }
    );
  }
}
