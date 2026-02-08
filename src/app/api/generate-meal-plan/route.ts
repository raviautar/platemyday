import { streamText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { mealPlanWithDetailsSchema } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { recipes, systemPrompt, preferences } = await req.json();

    const recipeList = recipes
      .map((r: { id: string; title: string; tags: string[] }) => 
        `- ${r.title} (ID: ${r.id}, Tags: ${r.tags.join(', ')})`)
      .join('\n');

    const prompt = `Create a complete 7-day meal plan (Monday through Sunday) with full recipe details.

Available recipes in user's library:
${recipeList}

${preferences ? `User preferences: ${preferences}` : ''}

IMPORTANT:
1. Use existing recipes from the library when appropriate (include their IDs)
2. For any NEW recipes not in the library, provide COMPLETE details including:
   - Full list of ingredients with measurements
   - Step-by-step cooking instructions
   - Servings, prep time, cook time
   - Relevant tags (e.g., "vegetarian", "quick", "italian")
3. Each day should have breakfast, lunch, and dinner at minimum
4. Add snacks where appropriate for variety
5. Make sure recipe titles in meals exactly match titles in newRecipes array`;

    const result = await streamText({
      model: google('gemini-3-flash-preview'),
      output: Output.object({ schema: mealPlanWithDetailsSchema }),
      system: systemPrompt,
      prompt,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const partialObject of result.partialOutputStream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'update', 
                  data: partialObject 
                })}\n\n`
              )
            );
          }
          
          const finalObject = await result.output;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'done', 
                data: finalObject 
              })}\n\n`
            )
          );
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'error', 
                error: 'Failed to generate meal plan' 
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return Response.json(
      { error: 'Failed to generate meal plan. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
