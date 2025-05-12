// This file is machine-generated - do not edit!

'use server';

/**
 * @fileOverview Generates application ideas based on a user prompt.
 *
 * - generateApplicationIdeas - A function that generates application ideas.
 * - GenerateApplicationIdeasInput - The input type for the generateApplicationIdeas function.
 * - GenerateApplicationIdeasOutput - The return type for the generateApplicationIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateApplicationIdeasInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the type of application to build.'),
});

export type GenerateApplicationIdeasInput = z.infer<
  typeof GenerateApplicationIdeasInputSchema
>;

const GenerateApplicationIdeasOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe('The title of the application idea.'),
        description: z.string().describe('A short description of the application idea.'),
      })
    )
    .describe('An array of application ideas.'),
});

export type GenerateApplicationIdeasOutput = z.infer<
  typeof GenerateApplicationIdeasOutputSchema
>;

export async function generateApplicationIdeas(
  input: GenerateApplicationIdeasInput
): Promise<GenerateApplicationIdeasOutput> {
  return generateApplicationIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApplicationIdeasPrompt',
  input: {schema: GenerateApplicationIdeasInputSchema},
  output: {schema: GenerateApplicationIdeasOutputSchema},
  prompt: `You are an application idea generator. Given a prompt, you will generate several application ideas.

  The application ideas should be creative and feasible.

  Here is the prompt: {{{prompt}}}

  Please return 3 distinct ideas.`,
});

const generateApplicationIdeasFlow = ai.defineFlow(
  {name: 'generateApplicationIdeasFlow', inputSchema: GenerateApplicationIdeasInputSchema, outputSchema: GenerateApplicationIdeasOutputSchema},
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

