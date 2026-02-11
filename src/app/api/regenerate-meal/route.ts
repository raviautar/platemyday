import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { mealType, dayOfWeek, currentMeals, preferences, systemPrompt } = await req.json();

    const currentMealsList = (currentMeals || [])
      .map((m: { title: string; mealType: string }) => `- ${m.mealType}: ${m.title}`)
      .join('\n');

    const prompt = `Suggest a single ${mealType} recipe for ${dayOfWeek}.

${currentMealsList ? `Current meals planned for this day:\n${currentMealsList}\n\nMake sure the suggestion is different from the above meals.` : ''}

${preferences ? `User preferences: ${preferences}` : ''}

Provide a complete recipe with ingredients, instructions, prep time, cook time, servings, and tags.`;

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
