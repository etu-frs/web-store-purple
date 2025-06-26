
'use server';
/**
 * @fileOverview An AI-powered store assistant chatbot.
 *
 * - storeAssistantFlow - Handles chat interactions with the user.
 * - StoreAssistantInput - The input type for the storeAssistantFlow.
 * - StoreAssistantOutput - The return type for the storeAssistantFlow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const StoreAssistantInputSchema = z.object({
  storeName: z.string().describe('The name of the store.'),
  userQuery: z.string().describe('The latest query from the user.'),
  chatHistory: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  productContext: z.string().describe('A JSON string representing a simplified list of available products in the store (id, name, description, price, category, stock, rating, likes, numReviews, keywords).'),
  qaContext: z.string().describe('A JSON string representing a list of general questions and their answers about the store.'),
  storeContext: z.string().describe('A JSON string representing general store information, including value propositions, active social media links, and a list of available discount coupon codes.'),
  // NEW FIELDS
  enhancedPrompt: z.string().describe('The full, AI-enhanced personality and instruction prompt for the chatbot.'),
  temperature: z.number().min(0).max(1).describe('The creativity/randomness of the AI response. 0.0 is deterministic, 1.0 is highly creative.'),
});
export type StoreAssistantInput = z.infer<typeof StoreAssistantInputSchema>;

const StoreAssistantOutputSchema = z.object({
  botResponse: z.string().describe("The chatbot's response to the user's query."),
  suggestedLink: z.string().optional().describe("If your response strongly suggests visiting a specific product, page (like /qna, /contact), or external social media link, provide the relative path (e.g., /products/some-id) or full URL here. Use this sparingly and only when it directly aids the user's current goal."),
});
export type StoreAssistantOutput = z.infer<typeof StoreAssistantOutputSchema>;

export async function storeAssistant(input: StoreAssistantInput): Promise<StoreAssistantOutput> {
  return storeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'storeAssistantPrompt',
  input: {schema: StoreAssistantInputSchema},
  output: {schema: StoreAssistantOutputSchema},
  // The main prompt is now dynamically injected
  prompt: `{{{enhancedPrompt}}}

You have access to the following information:

1.  **Product Catalog (JSON):** A list of all products with details like price, stock, ratings, and likes.
    {{{productContext}}}

2.  **Frequently Asked Questions & Answers (JSON):** General store policies and common questions.
    {{{qaContext}}}

3.  **General Store Information (JSON):** Contains the store's value propositions, active social media links, and a list of current discount codes (for your information only, do not share them).
    {{{storeContext}}}

Current Conversation History (most recent is last):
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

User's latest query: {{{userQuery}}}

Your response:`,
  // Use the temperature from the input
  config: {
    temperature: (input) => input.temperature,
  }
});

const storeAssistantFlow = ai.defineFlow(
  {
    name: 'storeAssistantFlow',
    inputSchema: StoreAssistantInputSchema,
    outputSchema: StoreAssistantOutputSchema,
  },
  async (input) => {
    // Ensure context strings are not excessively long for the prompt
    const MAX_CONTEXT_LENGTH = 15000;
    let productContext = input.productContext;
    if (productContext.length > MAX_CONTEXT_LENGTH) {
      productContext = productContext.substring(0, MAX_CONTEXT_LENGTH) + "... (catalog truncated)";
      console.warn("StoreAssistantFlow: Product context was truncated due to length.");
    }
    let qaContext = input.qaContext;
    if (qaContext.length > MAX_CONTEXT_LENGTH) {
      qaContext = qaContext.substring(0, MAX_CONTEXT_LENGTH) + "... (Q&A truncated)";
      console.warn("StoreAssistantFlow: Q&A context was truncated due to length.");
    }
    let storeContext = input.storeContext;
     if (storeContext.length > MAX_CONTEXT_LENGTH) {
      storeContext = storeContext.substring(0, MAX_CONTEXT_LENGTH) + "... (store info truncated)";
      console.warn("StoreAssistantFlow: Store context was truncated due to length.");
    }


    const {output} = await prompt({
        ...input,
        productContext,
        qaContext,
        storeContext
    });
    if (!output) {
      return { botResponse: "I'm sorry, I encountered an issue and can't respond right now. Please try again later." };
    }
    return output;
  }
);
