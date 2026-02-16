import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';
import {
  regenerateMealRequestSchema,
  validateAndRateLimit,
  getUserPreferencesPrompt,
} from '@/lib/ai-guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const validation = await validateAndRateLimit(req, regenerateMealRequestSchema, {
      key: 'regenerate-meal',
      limit: 25,
      windowMs: 10 * 60 * 1000,
    });
    if (validation instanceof Response) return validation;

    const { mealType, dayOfWeek, currentMeals, systemPrompt, userId, anonymousId } = validation.data;

    const prefsPrompt = await getUserPreferencesPrompt(userId, anonymousId);

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
- Relevant tags
- Estimated nutrition per serving (calories, protein in grams, carbs in grams, fat in grams)`;

    const result = await generateText({
      model: google('gemini-2.5-flash-lite'),
      output: Output.object({ schema: recipeSchema }),
      system: systemPrompt || 'You are a creative chef assistant. Suggest a practical, delicious recipe.',
      prompt,
    });

    if (!result.output) {
      trackServerEvent(EVENTS.MEAL_PLAN_GENERATION_FAILED, userId ?? null, anonymousId ?? '', {
        error_type: 'empty_output',
        meal_type: mealType,
      });
      return Response.json(
        { error: 'Failed to generate a meal suggestion.' },
        { status: 500 }
      );
    }

    trackServerEvent(EVENTS.MEAL_REGENERATION_COMPLETED, userId ?? null, anonymousId ?? '', {
      meal_type: mealType,
      day_of_week: dayOfWeek,
      recipe_title: result.output.title,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error('Meal regeneration error:', error);
    return Response.json(
      { error: 'Failed to regenerate meal. Please try again.' },
      { status: 500 }
    );
  }
}
