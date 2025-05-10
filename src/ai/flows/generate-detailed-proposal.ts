'use server';

/**
 * @fileOverview Generates a detailed application proposal including name, core features, and UI/UX guidelines.
 *
 * - generateDetailedProposal - A function that generates the detailed proposal.
 * - GenerateDetailedProposalInput - The input type for the generateDetailedProposal function.
 * - GenerateDetailedProposalOutput - The return type for the generateDetailedProposal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDetailedProposalInputSchema = z.object({
  idea: z.string().describe('The selected application idea.'),
});
export type GenerateDetailedProposalInput = z.infer<typeof GenerateDetailedProposalInputSchema>;

const GenerateDetailedProposalOutputSchema = z.object({
  appName: z.string().describe('The generated application name.'),
  coreFeatures: z.array(
    z.object({
      feature: z.string().describe('The core feature.'),
      description: z.string().describe('The description of the core feature.'),
    })
  ).describe('The list of core features with descriptions.'),
  uiUxGuidelines: z.array(
    z.object({
      category: z.string().describe('The category of the UI/UX guideline (e.g., color, typography).'),
      guideline: z.string().describe('The UI/UX guideline.'),
    })
  ).describe('The UI/UX guidelines categorized.'),
});
export type GenerateDetailedProposalOutput = z.infer<typeof GenerateDetailedProposalOutputSchema>;

export async function generateDetailedProposal(input: GenerateDetailedProposalInput): Promise<GenerateDetailedProposalOutput> {
  return generateDetailedProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedProposalPrompt',
  input: {schema: GenerateDetailedProposalInputSchema},
  output: {schema: GenerateDetailedProposalOutputSchema},
  prompt: `You are an expert in generating detailed application proposals based on a selected idea.\n\n  Based on the following application idea, generate a detailed proposal including an application name, a list of core features with descriptions, and UI/UX guidelines categorized by color, typography, iconography, layout and animation.\n\n  Application Idea: {{{idea}}}`,
});

const generateDetailedProposalFlow = ai.defineFlow(
  {
    name: 'generateDetailedProposalFlow',
    inputSchema: GenerateDetailedProposalInputSchema,
    outputSchema: GenerateDetailedProposalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
