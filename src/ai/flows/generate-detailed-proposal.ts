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

const CoreFeatureSchema = z.object({
  feature: z.string().describe('The core feature.'),
  description: z.string().describe('The description of the core feature.'),
});

const UiUxGuidelineSchema = z.object({
  category: z.string().describe('The category of the UI/UX guideline (e.g., color, typography).'),
  guideline: z.string().describe('The UI/UX guideline.'),
});

const GenerateDetailedProposalOutputSchema = z.object({
  appName: z.string().describe('The generated application name.'),
  coreFeatures: z.array(CoreFeatureSchema).describe('The list of core features with descriptions.'),
  uiUxGuidelines: z.array(UiUxGuidelineSchema).describe('The UI/UX guidelines categorized.'),
});
export type GenerateDetailedProposalOutput = z.infer<typeof GenerateDetailedProposalOutputSchema>;

export async function generateDetailedProposal(input: GenerateDetailedProposalInput): Promise<GenerateDetailedProposalOutput> {
  return generateDetailedProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedProposalPrompt',
  input: {schema: GenerateDetailedProposalInputSchema},
  output: {schema: GenerateDetailedProposalOutputSchema},
  prompt: `You are an expert in generating detailed application proposals based on a selected idea.
  Based on the following application idea, generate a detailed proposal including an application name, a list of distinct core features with descriptions, and distinct UI/UX guidelines categorized by color, typography, iconography, layout and animation. Ensure there are no duplicate features or guidelines.

  Application Idea: {{{idea}}}`,
});

const generateDetailedProposalFlow = ai.defineFlow(
  {
    name: 'generateDetailedProposalFlow',
    inputSchema: GenerateDetailedProposalInputSchema,
    outputSchema: GenerateDetailedProposalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate detailed proposal. The AI returned no output.");
    }

    // Deduplicate coreFeatures
    const uniqueCoreFeatures = output.coreFeatures.reduce((acc, current) => {
      const x = acc.find(item => item.feature.toLowerCase() === current.feature.toLowerCase());
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as z.infer<typeof CoreFeatureSchema>[]);

    // Deduplicate uiUxGuidelines
    const uniqueUiUxGuidelines = output.uiUxGuidelines.reduce((acc, current) => {
      const x = acc.find(item => 
        item.category.toLowerCase() === current.category.toLowerCase() && 
        item.guideline.toLowerCase() === current.guideline.toLowerCase()
      );
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as z.infer<typeof UiUxGuidelineSchema>[]);

    return {
      ...output,
      coreFeatures: uniqueCoreFeatures,
      uiUxGuidelines: uniqueUiUxGuidelines,
    };
  }
);

