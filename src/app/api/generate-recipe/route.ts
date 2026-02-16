import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';
import {
  generateRecipeRequestSchema,
  validateAndRateLimit,
  getUserPreferencesPrompt,
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
    const validation = await validateAndRateLimit(req, generateRecipeRequestSchema, {
      key: 'generate-recipe',
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (validation instanceof Response) return validation;

    const { prompt, systemPrompt, userId, anonymousId } = validation.data;

    if (!isFoodRelated(prompt)) {
      return Response.json(
        { error: "Hmm, that doesn't look like a recipe request! Please describe a dish or meal you'd like to make." },
        { status: 400 }
      );
    }

    const prefsPrompt = await getUserPreferencesPrompt(userId, anonymousId);
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
      trackServerEvent(EVENTS.RECIPE_GENERATION_FAILED, userId ?? null, anonymousId ?? '', {
        error_type: 'empty_output',
      });
      return Response.json(
        { error: "We couldn't create a recipe from that description. Please try describing a specific dish or meal!" },
        { status: 400 }
      );
    }

    trackServerEvent(EVENTS.RECIPE_GENERATION_COMPLETED, userId ?? null, anonymousId ?? '', {
      recipe_title: result.output.title,
      tags: result.output.tags,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error('Recipe generation error:', error);
    return Response.json(
      { error: 'Failed to generate recipe. Please try again with a different description!' },
      { status: 500 }
    );
  }
}
