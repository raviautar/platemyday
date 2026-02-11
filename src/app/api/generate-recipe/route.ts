import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';
import { getSettings } from '@/lib/supabase/db';
import { formatPreferencesPrompt } from '@/lib/constants';

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
    const { prompt, systemPrompt, userId, anonymousId } = await req.json();

    if (!isFoodRelated(prompt)) {
      return Response.json(
        { error: "Hmm, that doesn't look like a recipe request! Please describe a dish or meal you'd like to make." },
        { status: 400 }
      );
    }

    // Fetch user settings to get preferences
    const settings = await getSettings(userId, anonymousId);
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
