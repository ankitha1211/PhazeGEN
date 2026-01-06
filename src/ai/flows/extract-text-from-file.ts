'use server';

/**
 * @fileOverview Extracts text from PDF and image files.
 *
 * - extractTextFromFile - A function that extracts text from a file data URI.
 * - ExtractTextFromFileInput - The input type for the extractTextFromFile function.
 * - ExtractTextFromFileOutput - The return type for the extractTextFromFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as pdfjs from 'pdf-parse';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file (PDF or image) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  text: z.string().describe('The extracted text from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return extractTextFromFileFlow(input);
}

const extractTextFromPdf = async (fileDataUri: string) => {
  const base64Data = fileDataUri.substring(fileDataUri.indexOf(',') + 1);
  const pdfBuffer = Buffer.from(base64Data, 'base64');
  const data = await pdfjs(pdfBuffer);
  return data.text;
};

const prompt = ai.definePrompt({
  name: 'extractTextFromFilePrompt',
  input: {schema: z.object({fileContent: z.string()})},
  output: {schema: ExtractTextFromFileOutputSchema},
  prompt: `You are an OCR and text extraction specialist.
    Analyze the following content from a file (which could be an image or a PDF).
    Extract only the biologically or research-relevant information.
    Ignore formatting, page numbers, headers, footers, and unrelated text.
    Present the extracted information as clean, readable text.

    File Content:
    {{{fileContent}}}
    `,
});

const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async ({fileDataUri}) => {
    const mimeType = fileDataUri.substring(fileDataUri.indexOf(':') + 1, fileDataUri.indexOf(';'));

    let fileContent = '';

    if (mimeType === 'application/pdf') {
      fileContent = await extractTextFromPdf(fileDataUri);
    } else if (mimeType.startsWith('image/')) {
      const {output} = await prompt({
        fileContent: `This is an image file. Extract relevant text. {{media url="${fileDataUri}"}}`,
      });
      return output!;
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    const {output} = await prompt({fileContent});
    return output!;
  }
);
