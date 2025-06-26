'use server';

/**
 * @fileOverview An AI agent for analyzing chatbot conversations.
 *
 * - analyzeConversations - A function that analyzes chat transcripts to provide business insights.
 * - AnalyzeConversationsInput - The input type for the analyzeConversations function.
 * - AnalyzeConversationsOutput - The return type for the analyzeConversations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ChatMessage } from '@/lib/types';


const AnalyzeConversationsInputSchema = z.object({
  conversations: z.array(z.array(z.object({
      id: z.string(),
      role: z.enum(['user', 'model', 'system']),
      content: z.string(),
      suggestedLink: z.string().optional(),
  }))).describe('A JSON array of chat conversations. Each conversation is an array of messages.'),
});
export type AnalyzeConversationsInput = z.infer<typeof AnalyzeConversationsInputSchema>;


const AnalyzeConversationsOutputSchema = z.object({
    overallSatisfaction: z.enum(['High', 'Medium', 'Low']).describe("The overall satisfaction level of users based on their interactions."),
    satisfactionReasoning: z.string().describe("A brief explanation for the determined satisfaction level, citing examples."),
    commonTopics: z.array(z.string()).describe("A list of the most common topics or general themes discussed in the conversations (e.g., 'shipping info', 'product recommendations', 'discounts')."),
    productInterests: z.array(z.string()).describe("A list of specific products or product categories that users frequently ask about or show interest in."),
    userPainPoints: z.array(z.string()).describe("A list of specific problems, complaints, or points of confusion users expressed (e.g., 'could not find search bar', 'unclear return policy')."),
    unansweredQuestions: z.array(z.string()).describe("A list of important questions users asked that the bot could not answer effectively or that indicate a gap in the store's available information."),
    salesOpportunities: z.array(z.string()).describe("A list of potential sales opportunities identified, such as requests for out-of-stock items, suggestions for new products, or strong buying signals that could be capitalized on."),
});
export type AnalyzeConversationsOutput = z.infer<typeof AnalyzeConversationsOutputSchema>;


export async function analyzeConversations(input: AnalyzeConversationsInput): Promise<AnalyzeConversationsOutput> {
  return analyzeConversationsFlow(input);
}

// Define a schema specifically for the prompt's input, which will be stringified JSON.
const PromptInputSchema = z.object({
    conversationsAsJson: z.string(),
});

const prompt = ai.definePrompt({
  name: 'analyzeConversationsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzeConversationsOutputSchema},
  prompt: `You are a highly skilled business intelligence analyst for an e-commerce store. Your task is to review the provided JSON data containing transcripts of conversations between customers and an AI sales assistant. Your goal is to extract concise, actionable business insights.

Analyze the conversations to identify key trends, issues, and opportunities. Your report must be structured according to the JSON output schema.

**Analysis Guidelines:**
1.  **Overall Satisfaction:** Gauge the general mood of the customers. Are they generally happy, frustrated, or neutral? Provide justification.
2.  **Common Topics:** What are the recurring subjects of discussion?
3.  **Product Interests:** Which products or types of products are users most interested in? Mention specific names if possible.
4.  **User Pain Points:** What are the common struggles or complaints? Be specific. This is crucial for improving the user experience.
5.  **Unanswered Questions:** Identify questions the bot failed to answer or that reveal gaps in your store's information. What do customers want to know that they can't find?
6.  **Sales Opportunities:** Did any user suggest a new product? Did they ask for a restock notification? Did the bot miss a clear chance to close a sale?

**Input Data:**

Chat Conversation Transcripts (JSON):
\`\`\`json
{{{conversationsAsJson}}}
\`\`\`

Now, generate the analysis based on the provided data and structure your response strictly as the JSON output schema requires.`,
});

const analyzeConversationsFlow = ai.defineFlow(
  {
    name: 'analyzeConversationsFlow',
    inputSchema: AnalyzeConversationsInputSchema,
    outputSchema: AnalyzeConversationsOutputSchema,
  },
  async (input) => {
    // Convert the array of conversations to a JSON string before passing to the prompt.
    const promptInput = {
        conversationsAsJson: JSON.stringify(input.conversations, null, 2),
    };
    
    const {output} = await prompt(promptInput);
     if (!output) {
      throw new Error("AI prompt did not return a valid analysis output.");
    }
    return output;
  }
);
