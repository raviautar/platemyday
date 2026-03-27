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
import { RECIPE_EDIT_SYSTEM_RULES } from '@/lib/recipeEditConstraints';
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

    const ingCount = currentRecipe.ingredients.length;
    const stepCount = currentRecipe.instructions.length;

    const prompt = `Here is an existing recipe (do not discard its structure unless the instruction explicitly requires add/remove of ingredients or steps):

Title: ${currentRecipe.title}
Description: ${currentRecipe.description}
Servings: ${currentRecipe.servings}
Prep Time: ${currentRecipe.prepTimeMinutes} minutes
Cook Time: ${currentRecipe.cookTimeMinutes} minutes
Tags: ${currentRecipe.tags.join(', ')}
${currentRecipe.estimatedNutrition ? `Current Nutrition (per serving): ${currentRecipe.estimatedNutrition.calories} cal, ${currentRecipe.estimatedNutrition.protein}g protein, ${currentRecipe.estimatedNutrition.carbs}g carbs, ${currentRecipe.estimatedNutrition.fat}g fat` : ''}

Ingredients (${ingCount} lines — keep this count unless the instruction clearly asks to add or remove an ingredient):
${currentRecipe.ingredients.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Instructions (${stepCount} steps — keep this count unless the instruction clearly asks to add or remove a step):
${currentRecipe.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

User instruction (apply minimally; reuse unchanged text verbatim where possible): "${editPrompt}"

Return the full updated recipe object. Recalculate estimated nutrition when ingredients or servings change.${prefsPrompt ? `\n\nUser preferences: ${prefsPrompt}` : ''}`;

    const combinedSystem = [RECIPE_EDIT_SYSTEM_RULES, systemPrompt].filter(Boolean).join('\n\n---\n\n');

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: recipeSchema }),
      system: combinedSystem,
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
