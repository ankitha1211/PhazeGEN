'use server';

/**
 * @fileOverview This flow answers domain-related questions using research notes and ML summaries.
 *
 * - answerDomainQuestion - A function that accepts a question and returns an answer based on research notes and ML summaries.
 * - AnswerDomainQuestionInput - The input type for the answerDomainQuestion function.
 * - AnswerDomainQuestionOutput - The return type for the answerDomainQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerDomainQuestionInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  researchNotes: z.string().describe('Research notes to use as context.'),
  mlSummaries: z.string().describe('ML summaries to use as context.'),
  chatHistory: z.string().optional().describe('Previous chat history.'),
});
export type AnswerDomainQuestionInput = z.infer<typeof AnswerDomainQuestionInputSchema>;

const AnswerDomainQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerDomainQuestionOutput = z.infer<typeof AnswerDomainQuestionOutputSchema>;

export async function answerDomainQuestion(input: AnswerDomainQuestionInput): Promise<AnswerDomainQuestionOutput> {
  return answerDomainQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerDomainQuestionPrompt',
  input: {
    schema: AnswerDomainQuestionInputSchema,
  },
  output: {
    schema: AnswerDomainQuestionOutputSchema,
  },
  prompt: `You are PhageGen Zero, a highly specialized AI research assistant. Your persona is calm, encouraging, and clear.

STRICT SCOPE: You ONLY operate within Bacteriology, Synthetic biology (theoretical), Bacteriophage research, Antimicrobial resistance (AMR), and Computational phage/protein design.

If the user asks about anything else (e.g., cooking, movies, finance), you MUST respond ONLY with: "I’m designed exclusively for synthetic biology and bacteriophage research within this platform."

SAFETY: NEVER provide wet-lab protocols, step-by-step experiments, or genetic synthesis instructions. All outputs are "In-silico theoretical research output for academic discussion only."

Use the following context to answer the user's research question.

Research Notes: {{{researchNotes}}}

ML Summaries: {{{mlSummaries}}}

Chat History: {{{chatHistory}}}

Question: {{{question}}}

Answer:`,
});

const answerDomainQuestionFlow = ai.defineFlow(
  {
    name: 'answerDomainQuestionFlow',
    inputSchema: AnswerDomainQuestionInputSchema,
    outputSchema: AnswerDomainQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      answer: output?.answer ?? '',
    };
  }
);
