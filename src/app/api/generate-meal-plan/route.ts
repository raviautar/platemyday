import { streamText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { mealPlanWithDetailsSchema } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { recipes, systemPrompt, preferences, weekStartDay = 'Monday' } = await req.json();

    const recipeList = recipes
      .map((r: { id: string; title: string; tags: string[] }) => 
        `- ${r.title} (ID: ${r.id}, Tags: ${r.tags.join(', ')})`)
      .join('\n');

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startIndex = daysOrder.indexOf(weekStartDay);
    const orderedDays = [...daysOrder.slice(startIndex), ...daysOrder.slice(0, startIndex)];

    const prompt = `Create a complete 7-day meal plan starting from ${weekStartDay} with full recipe details.

IMPORTANT: The days array MUST start with ${weekStartDay} and follow this exact order: ${orderedDays.join(', ')}

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
5. Make sure recipe titles in meals exactly match titles in newRecipes array
6. Days must be in this exact order: ${orderedDays.join(', ')}`;

    const result = await streamText({
      model: google('gemini-3-flash-preview'),
      output: Output.object({ schema: mealPlanWithDetailsSchema }),
      system: systemPrompt,
      prompt,
    });

    const encoder = new TextEncoder();
    
    async function* generateStream() {
      let chunkCount = 0;
      
      yield encoder.encode(`: heartbeat\n\n`);
      
      yield encoder.encode(`data: ${JSON.stringify({ 
        type: 'start', 
        timestamp: Date.now() 
      })}\n\n`);
      
      try {
        for await (const partialObject of result.partialOutputStream) {
          const message = `data: ${JSON.stringify({ 
            type: 'update', 
            data: partialObject 
          })}\n\n`;
          yield encoder.encode(message);
          chunkCount++;
        }
        
        const finalObject = await result.output;
        const finalMessage = `data: ${JSON.stringify({ 
          type: 'done', 
          data: finalObject 
        })}\n\n`;
        yield encoder.encode(finalMessage);
        
        console.log(`Stream completed successfully. Sent ${chunkCount} updates.`);
      } catch (error) {
        console.error('Streaming error:', error);
        const errorMessage = `data: ${JSON.stringify({ 
          type: 'error', 
          error: error instanceof Error ? error.message : 'Failed to generate meal plan'
        })}\n\n`;
        yield encoder.encode(errorMessage);
      }
    }
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateStream()) {
            controller.enqueue(chunk);
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Transfer-Encoding': 'chunked',
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
