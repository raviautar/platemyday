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
import { getAuthUser } from '@/lib/supabase/auth';
import { checkCredits, consumeCredit } from '@/lib/supabase/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

    const { prompt, strictIngredients, systemPrompt, anonymousId: clientAnonymousId } = validation.data;

    // Server-side identity: trust session, not request body
    const { userId: authUserId } = await getAuthUser();
    const userId = authUserId;
    const anonymousId = userId ? '' : (clientAnonymousId ?? '');

    const creditCheck = await checkCredits(userId ?? null, anonymousId ?? '');
    if (!creditCheck.allowed) {
      trackServerEvent(EVENTS.PAYWALL_HIT, userId ?? null, anonymousId ?? '', {
        credits_used: creditCheck.creditsUsed,
        credits_limit: creditCheck.creditsLimit,
      });
      return Response.json(
        {
          error: 'no_credits',
          message: 'You\'ve used all your free recipe generations. Upgrade for unlimited access.',
          creditsUsed: creditCheck.creditsUsed,
          creditsLimit: creditCheck.creditsLimit,
        },
        { status: 402 },
      );
    }

    if (!isFoodRelated(prompt)) {
      return Response.json(
        { error: "Hmm, that doesn't look like a recipe request! Please describe a dish or meal you'd like to make." },
        { status: 400 }
      );
    }

    const prefsPrompt = await getUserPreferencesPrompt(userId ?? undefined, anonymousId || undefined);
    let enhancedPrompt = prompt;
    if (strictIngredients) {
      enhancedPrompt += '\n\nIMPORTANT: Use ONLY the ingredients mentioned above. Do not add extra ingredients beyond basic seasonings (salt, pepper, oil). Keep the recipe simple and focused on these ingredients.';
    }
    if (prefsPrompt) {
      enhancedPrompt += `\n\nUser preferences: ${prefsPrompt}`;
    }

    const result = await generateText({
      model: google('gemini-2.5-flash'),
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

    if (!creditCheck.unlimited) {
      await consumeCredit(userId ?? null, anonymousId ?? '');
    }

    trackServerEvent(EVENTS.RECIPE_GENERATION_COMPLETED, userId ?? null, anonymousId ?? '', {
      recipe_title: result.output.title,
      tags: result.output.tags,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error('Recipe generation error:', error);
    trackServerEvent(EVENTS.RECIPE_GENERATION_FAILED, null, '', {
      error_type: 'server_error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    return Response.json(
      { error: 'Failed to generate recipe. Please try again with a different description!' },
      { status: 500 }
    );
  }
}
