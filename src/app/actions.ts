"use server";

import { answerDomainQuestion } from "@/ai/flows/answer-domain-questions";
import { summarizeKeyFindings } from "@/ai/flows/summarize-key-findings";

export async function handleSummarize(mlOutputs: string, researchNotes: string) {
  try {
    const result = await summarizeKeyFindings({ mlOutputs, researchNotes });
    return { summary: result.summary };
  } catch (error) {
    console.error("Error in handleSummarize:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during summarization.";
    return { error: errorMessage };
  }
}

export async function postToChat(question: string, researchNotes: string, mlSummaries: string, chatHistory: string) {
  try {
    const result = await answerDomainQuestion({
      question,
      researchNotes,
      mlSummaries,
      chatHistory,
    });
    return { answer: result.answer };
  } catch (error) {
    console.error("Error in postToChat:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while getting a chat response.";
    return { error: errorMessage };
  }
}
