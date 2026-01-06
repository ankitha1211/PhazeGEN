'use server';

/**
 * @fileOverview Summarizes key findings from ML outputs, uploaded notes, and research context.
 *
 * - summarizeKeyFindings - A function that summarizes key findings.
 * - SummarizeKeyFindingsInput - The input type for the summarizeKeyFindings function.
 * - SummarizeKeyFindingsOutput - The return type for the summarizeKeyFindings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeKeyFindingsInputSchema = z.object({
  mlOutputs: z.string().describe('Structured ML outputs, including pathogenic risk score, CRISPR system presence, resistance genes, GC content, genome length, ORF count, and optional protein structure predictions.'),
  researchNotes: z.string().describe('Uploaded research notes in text format.'),
  researchContext: z.string().optional().describe('Existing research context.'),
});
export type SummarizeKeyFindingsInput = z.infer<typeof SummarizeKeyFindingsInputSchema>;

const SummarizeKeyFindingsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key findings, highlighting the most important aspects of the data.'),
});
export type SummarizeKeyFindingsOutput = z.infer<typeof SummarizeKeyFindingsOutputSchema>;

export async function summarizeKeyFindings(input: SummarizeKeyFindingsInput): Promise<SummarizeKeyFindingsOutput> {
  return summarizeKeyFindingsFlow(input);
}

const summarizeKeyFindingsPrompt = ai.definePrompt({
  name: 'summarizeKeyFindingsPrompt',
  input: {schema: SummarizeKeyFindingsInputSchema},
  output: {schema: SummarizeKeyFindingsOutputSchema},
  prompt: `You are an AI research assistant that specializes in summarizing genome research data.

  Your task is to analyze the provided ML outputs, research notes, and existing research context, and identify the most biologically important signals. Create a concise summary highlighting what matters and why.

  ML Outputs:
  {{mlOutputs}}

  Research Notes:
  {{researchNotes}}

  Research Context:
  {{researchContext}}

  Summary:`, // Removed Handlebars await since it's not allowed
});

const summarizeKeyFindingsFlow = ai.defineFlow(
  {
    name: 'summarizeKeyFindingsFlow',
    inputSchema: SummarizeKeyFindingsInputSchema,
    outputSchema: SummarizeKeyFindingsOutputSchema,
  },
  async input => {
    const {output} = await summarizeKeyFindingsPrompt(input);
    return output!;
  }
);
