import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { ingredientExtractionSchema } from '@/lib/ai';
import { trackServerEvent } from '@/lib/analytics/posthog-server';
import { EVENTS } from '@/lib/analytics/events';
import {
  extractIngredientsRequestSchema,
  validateAndRateLimit,
} from '@/lib/ai-guardrails';
import { getAuthUser } from '@/lib/supabase/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a food ingredient identification expert. Analyze the provided images and identify ALL visible food and cooking ingredients.

Rules:
- Return only ingredient names (e.g. "chicken breast", "tomatoes", "olive oil")
- Do NOT include quantities, measurements, or brands
- Use common grocery names (e.g. "bell pepper" not "capsicum")
- Deduplicate across all images — each ingredient should appear only once
- Include fresh produce, proteins, dairy, grains, canned goods, condiments, spices — anything edible
- Ignore non-food items (packaging, utensils, appliances)
- If an image is unclear or contains no food, skip it without error
- Return an empty list only if no food is visible in any image`;

async function callGeminiWithRetry(
  images: string[],
  maxRetries: number = 2,
): Promise<string[]> {
  const imageContents = images.map((img) => {
    const base64Data = img.includes(',') ? img.split(',')[1] : img;
    const mimeMatch = img.match(/^data:(image\/\w+);/);
    const mimeType = (mimeMatch?.[1] ?? 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp';

    return {
      type: 'image' as const,
      image: base64Data,
      mimeType,
    };
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateText({
        model: google('gemini-2.5-flash'),
        output: Output.object({ schema: ingredientExtractionSchema }),
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              {
                type: 'text',
                text: 'Identify all food ingredients visible in these images.',
              },
            ],
          },
        ],
      });

      return result.output?.ingredients ?? [];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('Ingredient extraction failed');
}

export async function POST(req: Request) {
  try {
    const validation = await validateAndRateLimit(
      req,
      extractIngredientsRequestSchema,
      {
        key: 'extract-ingredients',
        limit: 10,
        windowMs: 5 * 60 * 1000,
      },
    );
    if (validation instanceof Response) return validation;

    const { images, anonymousId: clientAnonymousId } = validation.data;

    const { userId: authUserId } = await getAuthUser();
    const userId = authUserId;
    const anonymousId = userId ? '' : (clientAnonymousId ?? '');

    const ingredients = await callGeminiWithRetry(images);

    trackServerEvent(
      EVENTS.INGREDIENT_SCAN_COMPLETED,
      userId ?? null,
      anonymousId ?? '',
      {
        image_count: images.length,
        ingredient_count: ingredients.length,
      },
    );

    return Response.json({ ingredients });
  } catch (error) {
    console.error('Ingredient extraction error:', error);
    trackServerEvent(EVENTS.INGREDIENT_SCAN_FAILED, null, '', {
      error_type: 'server_error',
      error_message:
        error instanceof Error ? error.message : 'Unknown error',
    });
    return Response.json(
      {
        error:
          'Failed to identify ingredients. Please try again with clearer photos.',
      },
      { status: 500 },
    );
  }
}
