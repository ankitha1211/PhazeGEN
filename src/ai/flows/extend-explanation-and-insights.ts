'use server';

/**
 * @fileOverview Extends explanations and insights on existing ML analysis, building on prior summaries without reprocessing raw data.
 *
 * - extendExplanationAndInsights - A function that extends explanations and insights based on existing ML analysis.
 * - ExtendExplanationAndInsightsInput - The input type for the extendExplanationAndInsights function.
 * - ExtendExplanationAndInsightsOutput - The return type for the extendExplanationAndInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtendExplanationAndInsightsInputSchema = z.object({
  priorSummary: z.string().describe('A summary of previous ML analysis.'),
  additionalNotes: z.string().optional().describe('Optional additional research notes to consider.'),
  userQuestion: z.string().describe('The user question to answer with extended insights.'),
});
export type ExtendExplanationAndInsightsInput = z.infer<typeof ExtendExplanationAndInsightsInputSchema>;

const ExtendExplanationAndInsightsOutputSchema = z.object({
  extendedInsights: z.string().describe('Extended explanations and insights based on the prior summary and user question.'),
});
export type ExtendExplanationAndInsightsOutput = z.infer<typeof ExtendExplanationAndInsightsOutputSchema>;

export async function extendExplanationAndInsights(input: ExtendExplanationAndInsightsInput): Promise<ExtendExplanationAndInsightsOutput> {
  return extendExplanationAndInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extendExplanationAndInsightsPrompt',
  input: {schema: ExtendExplanationAndInsightsInputSchema},
  output: {schema: ExtendExplanationAndInsightsOutputSchema},
  prompt: `You are an AI research assistant that extends explanations and insights on existing ML analysis.

  Prior Summary: {{{priorSummary}}}

  {{#if additionalNotes}}
  Additional Notes: {{{additionalNotes}}}
  {{/if}}

  User Question: {{{userQuestion}}}

  Based on the prior summary, and any additional notes, provide extended explanations and insights to answer the user's question.
  Ensure the response is clear, concise, and suitable for academic discussion.
  All outputs must be treated as in-silico theoretical research for academic discussion only. Do not provide wet-lab protocols, experimental steps, or clinical advice.
  Avoid asterisks, hash symbols, and decorative markdown. Use clean paragraphs or numbered points.
  Follow a natural ChatGPT or Gemini-like response style.
  `,
});

const extendExplanationAndInsightsFlow = ai.defineFlow(
  {
    name: 'extendExplanationAndInsightsFlow',
    inputSchema: ExtendExplanationAndInsightsInputSchema,
    outputSchema: ExtendExplanationAndInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
