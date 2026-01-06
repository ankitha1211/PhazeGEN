"use server";

import { answerDomainQuestion } from "@/ai/flows/answer-domain-questions";
import { summarizeKeyFindings } from "@/ai/flows/summarize-key-findings";
import { extractTextFromFile } from "@/ai/flows/extract-text-from-file";

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0) {
      console.log(`Retrying after ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      // Double the delay for the next retry (exponential backoff)
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function handleSummarize(mlOutputs: string, researchNotes: string) {
  try {
    const result = await withRetry(() => summarizeKeyFindings({ mlOutputs, researchNotes }));
    return { summary: result.summary };
  } catch (error) {
    console.error("Error in handleSummarize after multiple retries:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during summarization.";
    return { error: `The AI model is currently overloaded. Please try again later. (Details: ${errorMessage})` };
  }
}

export async function postToChat(question: string, researchNotes: string, mlSummaries: string, chatHistory: string) {
  try {
    const result = await withRetry(() => answerDomainQuestion({
      question,
      researchNotes,
      mlSummaries,
      chatHistory,
    }));
    return { answer: result.answer };
  } catch (error) {
    console.error("Error in postToChat after multiple retries:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while getting a chat response.";
    return { error: `The AI model is currently overloaded. Please try again later. (Details: ${errorMessage})` };
  }
}

export async function handleFileUpload(fileDataUri: string) {
    try {
        const result = await withRetry(() => extractTextFromFile({ fileDataUri }));
        return { text: result.text };
    } catch (error) {
        console.error("Error in handleFileUpload after multiple retries:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during file processing.";
        return { error: `The AI model failed to process the file. Please try again later. (Details: ${errorMessage})` };
    }
}
