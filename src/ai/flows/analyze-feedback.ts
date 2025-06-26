'use server';

/**
 * @fileOverview An AI agent for analyzing customer feedback.
 *
 * - analyzeFeedback - A function that analyzes reviews and questions to provide business insights.
 * - AnalyzeFeedbackInput - The input type for the analyzeFeedback function.
 * - AnalyzeFeedbackOutput - The return type for the analyzeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFeedbackInputSchema = z.object({
  reviews: z.array(z.any()).describe('A JSON array of customer reviews, each with properties like `rating`, `comment`, `userName`, and `productId`.'),
  questions: z.array(z.any()).describe('A JSON array of customer questions, each with properties like `questionText`, `answerText`, `userName`, and `productId`.'),
});
export type AnalyzeFeedbackInput = z.infer<typeof AnalyzeFeedbackInputSchema>;


const AnalyzeFeedbackOutputSchema = z.object({
    overallSentiment: z.enum(['Positive', 'Negative', 'Neutral', 'Mixed']).describe("The overall sentiment derived from all feedback."),
    sentimentReasoning: z.string().describe("A brief explanation for the determined overall sentiment, citing specific examples if possible."),
    keyThemes: z.array(z.string()).describe("A list of the most common topics or themes mentioned across all feedback (e.g., 'shipping times', 'product quality', 'customer service')."),
    praisePoints: z.array(z.string()).describe("A list of specific positive points or features that customers frequently praise."),
    painPoints: z.array(z.string()).describe("A list of specific problems, complaints, or areas for improvement identified from the feedback."),
    topUnansweredQuestionTopics: z.array(z.string()).describe("A list of topics from questions that do not have an answer yet. Summarize the theme of the question."),
});
export type AnalyzeFeedbackOutput = z.infer<typeof AnalyzeFeedbackOutputSchema>;


export async function analyzeFeedback(input: AnalyzeFeedbackInput): Promise<AnalyzeFeedbackOutput> {
  return analyzeFeedbackFlow(input);
}

// Define a schema specifically for the prompt's input, which will be stringified JSON.
const PromptInputSchema = z.object({
    reviewsAsJson: z.string(),
    questionsAsJson: z.string(),
});

const prompt = ai.definePrompt({
  name: 'analyzeFeedbackPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzeFeedbackOutputSchema},
  prompt: `You are a highly skilled business analyst specializing in customer feedback analysis. Your task is to review the provided JSON data containing customer reviews and questions for an e-commerce store and generate a concise, actionable business intelligence report.

Analyze the provided data to identify key insights. Your report must be structured according to the JSON output schema.

**Analysis Guidelines:**
1.  **Overall Sentiment:** Determine the general feeling of the customers. Is it overwhelmingly positive, negative, or a mix? Provide a brief justification for your choice in 'sentimentReasoning'.
2.  **Key Themes:** Identify recurring topics. Do customers talk a lot about pricing, product quality, or delivery?
3.  **Praise Points:** What do customers love? Extract specific compliments about products or services.
4.  **Pain Points:** What are the common complaints or problems? Be specific. This is crucial for business improvement.
5.  **Unanswered Questions:** Look at the questions where 'answerText' is null or empty. Group these questions by topic and list the most common themes. This highlights areas where the store needs to provide more information.

**Input Data:**

Customer Reviews (JSON):
\`\`\`json
{{{reviewsAsJson}}}
\`\`\`

Customer Questions (JSON):
\`\`\`json
{{{questionsAsJson}}}
\`\`\`

Now, generate the analysis based on the provided data and structure your response strictly as the JSON output schema requires.`,
});

const analyzeFeedbackFlow = ai.defineFlow(
  {
    name: 'analyzeFeedbackFlow',
    inputSchema: AnalyzeFeedbackInputSchema,
    outputSchema: AnalyzeFeedbackOutputSchema,
  },
  async (input) => {
    // Convert the arrays to JSON strings before passing to the prompt.
    const promptInput = {
        reviewsAsJson: JSON.stringify(input.reviews, null, 2),
        questionsAsJson: JSON.stringify(input.questions, null, 2)
    };
    
    const {output} = await prompt(promptInput);
     if (!output) {
      throw new Error("AI prompt did not return a valid analysis output.");
    }
    return output;
  }
);
