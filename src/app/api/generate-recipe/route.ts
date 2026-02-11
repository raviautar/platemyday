import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';
import { getSettings } from '@/lib/supabase/db';
import { formatPreferencesPrompt } from '@/lib/constants';
import {
  consumeRateLimit,
  generateRecipeRequestSchema,
  parseJsonBody,
  rateLimitResponse,
  validationErrorResponse,
} from '@/lib/ai-guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const foodKeywords = [
  'recipe', 'cook', 'bake', 'dish', 'meal', 'food', 'ingredient', 'cuisine',
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'soup',
  'salad', 'pasta', 'rice', 'chicken', 'beef', 'fish', 'vegetarian', 'vegan'
];

function isFoodRelated(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  return foodKeywords.some(keyword => lowerPrompt.includes(keyword)) || 
         lowerPrompt.length > 10;
}

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    if (body === null) {
      return Response.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const parsed = generateRecipeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { prompt, systemPrompt, userId, anonymousId } = parsed.data;

    const rateLimit = consumeRateLimit({
      request: req,
      key: 'generate-recipe',
      limit: 20,
      windowMs: 10 * 60 * 1000,
      userId,
      anonymousId,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse('recipe generation', rateLimit.retryAfterSeconds);
    }

    if (!isFoodRelated(prompt)) {
      return Response.json(
        { error: "Hmm, that doesn't look like a recipe request! Please describe a dish or meal you'd like to make." },
        { status: 400 }
      );
    }

    // Fetch user settings to get preferences
    const settings = userId || anonymousId
      ? await getSettings(userId ?? null, anonymousId ?? '')
      : null;
    const prefsPrompt = settings ? formatPreferencesPrompt(settings.preferences) : '';

    const enhancedPrompt = prefsPrompt
      ? `${prompt}\n\nUser preferences: ${prefsPrompt}`
      : prompt;

    const result = await generateText({
      model: google('gemini-3-flash-preview'),
      output: Output.object({ schema: recipeSchema }),
      system: systemPrompt,
      prompt: enhancedPrompt,
    });

    if (!result.output || !result.output.title) {
      return Response.json(
        { error: "We couldn't create a recipe from that description. Please try describing a specific dish or meal!" },
        { status: 400 }
      );
    }

    return Response.json(result.output);
  } catch (error) {
    console.error('Recipe generation error:', error);
    return Response.json(
      { error: 'Failed to generate recipe. Please try again with a different description!' },
      { status: 500 }
    );
  }
}
