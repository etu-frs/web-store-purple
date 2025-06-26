// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent for generating engaging product descriptions.
 *
 * - generateProductDescription - A function that generates a product description based on the product name and keywords.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  keywords: z.string().describe('Comma-separated keywords related to the product.'),
});

export type GenerateProductDescriptionInput = z.infer<
  typeof GenerateProductDescriptionInputSchema
>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});

export type GenerateProductDescriptionOutput = z.infer<
  typeof GenerateProductDescriptionOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in creating engaging product descriptions. Generate a compelling and informative product description based on the following information:\n\nProduct Name: {{{productName}}}\nKeywords: {{{keywords}}}\n\nDescription:`, // Handlebars here
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI prompt did not return a valid output according to the schema.");
    }
    return output;
  }
);

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  try {
    const result = await generateProductDescriptionFlow(input);
    return result;
  } catch (error: any) {
    console.warn(`Error in generateProductDescriptionFlow: ${error.message}. API key might be missing or service is unavailable.`);
    const isApiKeyMissing = !process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY;
    const userMessage = isApiKeyMissing
      ? "Product description generation failed. Please ensure your Gemini API key is configured (e.g., in an .env file)."
      : "Product description generation failed. The AI service might be temporarily unavailable.";
    return { description: userMessage };
  }
}
