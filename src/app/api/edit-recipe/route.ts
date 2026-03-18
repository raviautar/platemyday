import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';
import {
  editRecipeRequestSchema,
  validateAndRateLimit,
  getUserPreferencesPrompt,
} from '@/lib/ai-guardrails';
import { getAuthUser } from '@/lib/supabase/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const validation = await validateAndRateLimit(req, editRecipeRequestSchema, {
      key: 'edit-recipe',
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (validation instanceof Response) return validation;

    const { currentRecipe, editPrompt, systemPrompt, anonymousId: clientAnonymousId } = validation.data;

    // Server-side identity: trust session, not request body
    const { userId: authUserId } = await getAuthUser();
    const userId = authUserId;
    const anonymousId = userId ? '' : (clientAnonymousId ?? '');

    const prefsPrompt = await getUserPreferencesPrompt(userId ?? undefined, anonymousId || undefined);

    const prompt = `Here is an existing recipe:

Title: ${currentRecipe.title}
Description: ${currentRecipe.description}
Servings: ${currentRecipe.servings}
Prep Time: ${currentRecipe.prepTimeMinutes} minutes
Cook Time: ${currentRecipe.cookTimeMinutes} minutes
Tags: ${currentRecipe.tags.join(', ')}
${currentRecipe.estimatedNutrition ? `Current Nutrition (per serving): ${currentRecipe.estimatedNutrition.calories} cal, ${currentRecipe.estimatedNutrition.protein}g protein, ${currentRecipe.estimatedNutrition.carbs}g carbs, ${currentRecipe.estimatedNutrition.fat}g fat` : ''}

Ingredients:
${currentRecipe.ingredients.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Instructions:
${currentRecipe.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

The user wants to modify this recipe with the following instruction: "${editPrompt}"

Return the COMPLETE updated recipe with all fields. If the change fundamentally transforms the recipe (e.g., "completely new recipe"), feel free to change the title and all other fields. Always recalculate estimated nutrition based on the updated ingredients and servings.${prefsPrompt ? `\n\nUser preferences: ${prefsPrompt}` : ''}`;

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: recipeSchema }),
      system: systemPrompt,
      prompt,
    });

    if (!result.output || !result.output.title) {
      trackServerEvent(EVENTS.RECIPE_EDIT_FAILED, userId ?? null, anonymousId ?? '', {
        error_type: 'empty_output',
      });
      return Response.json(
        { error: "We couldn't update the recipe with that instruction. Please try a different description!" },
        { status: 400 }
      );
    }

    trackServerEvent(EVENTS.RECIPE_EDIT_COMPLETED, userId ?? null, anonymousId ?? '', {
      recipe_title: result.output.title,
      original_title: currentRecipe.title,
      edit_prompt_length: editPrompt.length,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error('Recipe edit error:', error);
    return Response.json(
      { error: 'Failed to update recipe. Please try again!' },
      { status: 500 }
    );
  }
}
