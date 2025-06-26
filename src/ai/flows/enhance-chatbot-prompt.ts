'use server';

/**
 * @fileOverview An AI agent for enhancing chatbot prompts.
 *
 * - enhanceChatbotPrompt - A function that takes a user's base prompt and makes it more detailed and effective.
 * - EnhanceChatbotPromptInput - The input type for the enhanceChatbotPrompt function.
 * - EnhanceChatbotPromptOutput - The return type for the enhanceChatbotPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceChatbotPromptInputSchema = z.object({
  userPrompt: z.string().describe('The base prompt provided by the store owner.'),
  storeName: z.string().describe('The name of the store, to be included in the prompt.')
});
export type EnhanceChatbotPromptInput = z.infer<typeof EnhanceChatbotPromptInputSchema>;


const EnhanceChatbotPromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The AI-enhanced, detailed prompt for the chatbot.'),
});
export type EnhanceChatbotPromptOutput = z.infer<typeof EnhanceChatbotPromptOutputSchema>;


export async function enhanceChatbotPrompt(input: EnhanceChatbotPromptInput): Promise<EnhanceChatbotPromptOutput> {
  return enhanceChatbotPromptFlow(input);
}


const prompt = ai.definePrompt({
  name: 'enhanceChatbotPrompt',
  input: {schema: EnhanceChatbotPromptInputSchema},
  output: {schema: EnhanceChatbotPromptOutputSchema},
  prompt: `You are an expert AI prompt engineer specializing in creating highly effective prompts for e-commerce sales assistant chatbots. Your task is to take a simple, user-provided base prompt and expand it into a detailed, structured, and robust prompt that will guide an AI assistant to be persuasive, helpful, and brand-aligned.

The chatbot's name is "Dukaan Assistant" and the store is named "{{storeName}}".

**User's Base Prompt:**
\`\`\`
{{{userPrompt}}}
\`\`\`

**Your Task:**
Rewrite and expand the base prompt. The final prompt you generate should be a complete set of instructions for the AI assistant. It MUST include the following sections, using the user's base prompt as the core personality guide:

1.  **Core Identity & Goal:** Start by defining the assistant's name ("Dukaan Assistant") and its primary goal (e.g., guide users to purchase, be helpful, etc.). Incorporate the personality from the user's prompt.
2.  **Capabilities & Limitations:** Clearly define what the AI can and cannot do.
    -   **Can do:** Access and discuss products, general Q&A, and store information (all provided as context). Guide users to pages. Suggest a specific product link when it's a perfect match.
    -   **Cannot do:** Access user accounts, order history, or sensitive admin data. It must politely decline out-of-scope questions.
3.  **Sales & Persuasion Tactics:** Provide specific instructions on how to be a good salesperson.
    -   **Proactive Help:** Connect answers back to products or store value.
    -   **Social Proof:** Mention ratings, reviews, and likes to build confidence.
    -   **Coupon Strategy:** Instruct the bot to NEVER reveal discount codes directly. Instead, it should create excitement by mentioning that codes are available on the store's social media channels, encouraging users to follow.
4.  **Special Instructions:** Include a specific instruction: If asked about its creator, it should say it was made by 'frs7bk' and suggest a link to their Instagram: \`https://www.instagram.com/frs7bk/\`. This should be the ONLY time it suggests an external link without being asked.
5.  **Link Suggestion Rules:** Clearly define the strict rules for using the 'suggestedLink' output field. It should only be used if the user explicitly asks for a link, is clearly lost, or the AI is recommending a single, perfectly matched product. Emphasize that it should NOT be used in every message.

Your final output must be a single block of text representing the complete, enhanced prompt. Do not include any other text, greetings, or explanations in your response. Just the prompt.
`,
});

const enhanceChatbotPromptFlow = ai.defineFlow(
  {
    name: 'enhanceChatbotPromptFlow',
    inputSchema: EnhanceChatbotPromptInputSchema,
    outputSchema: EnhanceChatbotPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
     if (!output) {
      throw new Error("AI prompt did not return a valid enhanced prompt.");
    }
    return output;
  }
);
