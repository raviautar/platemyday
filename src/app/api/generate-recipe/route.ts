import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { recipeSchema } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { prompt, systemPrompt } = await req.json();

    const result = await generateText({
      model: google('gemini-3-flash-preview'),
      output: Output.object({ schema: recipeSchema }),
      system: systemPrompt,
      prompt: prompt,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error('Recipe generation error:', error);
    return Response.json(
      { error: 'Failed to generate recipe. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
