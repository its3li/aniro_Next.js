'use server';
/**
 * @fileOverview A flow for generating Tafseer (exegesis) for a given Quranic verse.
 *
 * - generateTafseer - A function that generates Tafseer for a specific verse.
 * - TafseerInput - The input type for the generateTafseer function.
 * - TafseerOutput - The return type for the generateTafseer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TafseerInputSchema = z.object({
  surahName: z.string().describe('The name of the Surah.'),
  verseNumber: z.number().describe('The verse number within the Surah.'),
  verseText: z.string().describe('The Arabic text of the verse.'),
  verseTranslation: z.string().describe('The English translation of the verse.'),
});
export type TafseerInput = z.infer<typeof TafseerInputSchema>;

const TafseerOutputSchema = z.object({
  tafseer: z.string().describe('A concise explanation of the verse, suitable for a general audience, drawing from scholarly sources like Tafseer Ibn Kathir.'),
});
export type TafseerOutput = z.infer<typeof TafseerOutputSchema>;

export async function generateTafseer(input: TafseerInput): Promise<TafseerOutput> {
  return generateTafseerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tafseerPrompt',
  input: {schema: TafseerInputSchema},
  output: {schema: TafseerOutputSchema},
  prompt: `You are an Islamic scholar providing a brief Tafseer (exegesis) for a Quranic verse.

Your explanation should be clear, concise, and accessible to a general audience.
Base your explanation on established and respected sources, primarily Tafseer Ibn Kathir, but present it in your own words.
Do not just copy from the source. Provide a summary and the key message.

The user has requested Tafseer for:
Surah: {{{surahName}}}
Verse Number: {{{verseNumber}}}
Verse Text (Arabic): {{{verseText}}}
Verse Translation (English): "{{{verseTranslation}}}"

Provide a concise Tafseer for this verse.`,
});

const generateTafseerFlow = ai.defineFlow(
  {
    name: 'generateTafseerFlow',
    inputSchema: TafseerInputSchema,
    outputSchema: TafseerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
