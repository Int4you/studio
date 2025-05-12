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
Based on the following application idea, generate a detailed proposal including:
1.  An application name.
2.  A list of truly distinct core features with descriptions. Each feature's title and its core concept must be unique.
3.  A list of UI/UX guidelines, categorized by areas like color, typography, iconography, layout, and animation. For UI/UX guidelines:
    *   Each individual guideline text MUST be unique and offer a substantially different piece of advice.
    *   If multiple guidelines fall under the same category (e.g., multiple guidelines for "Color"), ensure each of those guideline texts is fundamentally different and addresses a distinct aspect of that category. For example, for "Color", you might provide one guideline for the primary palette, another for secondary/accent colors, and a third for ensuring accessibility contrast. These are distinct and valuable.
    *   Avoid rephrasing the same concept or providing trivially different guidelines. For instance, do not provide "Use a clean font" and "Employ legible typography" as separate guidelines if they convey the same essential advice. Each guideline must be meaningfully different from all others.
    *   The exact text of a guideline should not be repeated, neither within the same category nor across different categories.

Your response must ensure no semantic or textual duplication in features or guidelines. "Distinct" means that both the title/category and the descriptive text/guideline text must offer unique value and not just be rewordings of each other or previous items.

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

    // Deduplicate coreFeatures by feature title (case-insensitive, trimmed)
    const uniqueCoreFeatures = output.coreFeatures.reduce((acc, current) => {
      const currentFeatureTrimmedLower = current.feature.trim().toLowerCase();
      const x = acc.find(item => item.feature.trim().toLowerCase() === currentFeatureTrimmedLower);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as z.infer<typeof CoreFeatureSchema>[]);

    // Deduplicate uiUxGuidelines by guideline text (case-insensitive, trimmed)
    // as per prompt: "The exact text of a guideline should not be repeated, neither within the same category nor across different categories."
    const uniqueUiUxGuidelines = output.uiUxGuidelines.reduce((acc, current) => {
      const currentGuidelineTrimmedLower = current.guideline.trim().toLowerCase();
      const x = acc.find(item => 
        item.guideline.trim().toLowerCase() === currentGuidelineTrimmedLower
      );
      if (!x) {
        return acc.concat([current]);
      } else {
        // console.log(`Duplicate UI/UX guideline (by text only) removed: Guideline: ${current.guideline}`);
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

