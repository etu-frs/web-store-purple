// src/ai/flows/search-recent-events.ts
'use server';

/**
 * @fileOverview AI-powered search for recent events and news related to the store or products.
 *
 * - searchRecentEvents - A function that searches for recent events and news.
 * - SearchRecentEventsInput - The input type for the searchRecentEvents function.
 * - SearchRecentEventsOutput - The return type for the searchRecentEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchRecentEventsInputSchema = z.object({
  query: z.string().describe('The search query for recent events and news.'),
});
export type SearchRecentEventsInput = z.infer<typeof SearchRecentEventsInputSchema>;

const SearchRecentEventsOutputSchema = z.object({
  results: z.array(
    z.object({
      summary: z.string().describe('A summary of the event or news item.'),
      sources: z.array(z.string()).describe('A list of URLs for the sources of the information.'),
    })
  ).describe('A list of search results.'),
});
export type SearchRecentEventsOutput = z.infer<typeof SearchRecentEventsOutputSchema>;

const searchRecentEventsPrompt = ai.definePrompt({
  name: 'searchRecentEventsPrompt',
  input: {schema: SearchRecentEventsInputSchema},
  output: {schema: SearchRecentEventsOutputSchema},
  prompt: `You are an AI assistant helping a store administrator stay informed about recent events and news related to their store or products.

  Based on the user's query, search for relevant information and provide a summary of each event or news item, along with the source URLs.

  Query: {{{query}}}

  Format your output as a JSON object with a "results" array. Each item in the array should have a "summary" and a "sources" field.
`,
});

const searchRecentEventsFlow = ai.defineFlow(
  {
    name: 'searchRecentEventsFlow',
    inputSchema: SearchRecentEventsInputSchema,
    outputSchema: SearchRecentEventsOutputSchema,
  },
  async input => {
    const {output} = await searchRecentEventsPrompt(input);
     if (!output) {
      throw new Error("AI prompt did not return a valid output for news search.");
    }
    return output;
  }
);

export async function searchRecentEvents(input: SearchRecentEventsInput): Promise<SearchRecentEventsOutput> {
  try {
    const result = await searchRecentEventsFlow(input);
    return result;
  } catch (error: any) {
    console.warn(`Error in searchRecentEventsFlow: ${error.message}. API key might be missing or service is unavailable.`);
    const isApiKeyMissing = !process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY;
    const userMessage = isApiKeyMissing
      ? "News search failed. Please ensure your Gemini API key is configured (e.g., in an .env file)."
      : "News search failed. The AI service might be temporarily unavailable.";
    
    // Return the error message within the defined schema structure
    return { results: [{ summary: userMessage, sources: [] }] };
  }
}
