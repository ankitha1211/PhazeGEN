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
  prompt: `You are a research assistant specializing in bacteriophage research, antimicrobial resistance analysis and synthetic biology. You will use research notes, ML summaries and chat history to answer the user's question. If you don't know the answer, or the question is outside the scope of genome and phage research, respond by stating that you are designed exclusively for genome and phage research within this platform.\n\nResearch Notes: {{{researchNotes}}}\n\nML Summaries: {{{mlSummaries}}}\n\nChat History: {{{chatHistory}}}\n\nQuestion: {{{question}}}\n\nAnswer: `,
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
