import { generateText, Output, type LanguageModel } from 'ai';
import { google } from '@ai-sdk/google';
import { mealPlanSchema } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { recipes, systemPrompt, preferences } = await req.json();

    const recipeList = recipes
      .map((r: { id: string; title: string; tags: string[] }) => `- ${r.title} (ID: ${r.id}, Tags: ${r.tags.join(', ')})`)
      .join('\n');

    const prompt = `Create a 7-day meal plan (Monday through Sunday) using these available recipes:

${recipeList}

${preferences ? `User preferences: ${preferences}` : ''}

You can use recipes from the list above (include their IDs) or suggest new recipes. Each day should have breakfast, lunch, and dinner at minimum. Add snacks where appropriate for variety.`;

    const result = await generateText({
      model: google('gemini-2.0-flash-exp') as LanguageModel,
      output: Output.object({ schema: mealPlanSchema }),
      system: systemPrompt,
      prompt,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return Response.json(
      { error: 'Failed to generate meal plan. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
