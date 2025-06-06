
'use server';
/**
 * @fileOverview Generates a detailed application proposal from an idea.
 *
 * - generateDetailedProposal - A function that generates the proposal.
 * - GenerateDetailedProposalInput - The input type for the function.
 * - GenerateDetailedProposalOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoreFeatureSchema = z.object({
  feature: z.string().describe('The title of the core feature.'),
  description: z.string().describe('A short description of the core feature.'),
});
export type CoreFeature = z.infer<typeof CoreFeatureSchema>;

const UiUxGuidelineSchema = z.object({
  category: z.string().describe('The category of the UI/UX guideline (e.g., Color Palette, Typography, Layout, Navigation, Tone & Voice).'),
  guideline: z.string().describe('The specific guideline for this category.'),
});
export type UiUxGuideline = z.infer<typeof UiUxGuidelineSchema>;


const GenerateDetailedProposalInputSchema = z.object({
  idea: z.string().describe('The application idea to develop a proposal for. This should be a concise description of the app concept.'),
});
export type GenerateDetailedProposalInput = z.infer<typeof GenerateDetailedProposalInputSchema>;

const GenerateDetailedProposalOutputSchema = z.object({
  appName: z.string().describe('A catchy and relevant name for the application.'),
  coreFeatures: z.array(CoreFeatureSchema).describe('A list of 3-5 primary core features essential for the application.'),
  uiUxGuidelines: z.array(UiUxGuidelineSchema).describe('A list of UI/UX guidelines, covering key aspects like Color Palette, Typography, Layout, Navigation, and Tone & Voice. Provide 3-5 distinct guidelines.'),
});
export type GenerateDetailedProposalOutput = z.infer<typeof GenerateDetailedProposalOutputSchema>;

export async function generateDetailedProposal(input: GenerateDetailedProposalInput): Promise<GenerateDetailedProposalOutput> {
  return generateDetailedProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedProposalPrompt',
  input: {schema: GenerateDetailedProposalInputSchema},
  output: {schema: GenerateDetailedProposalOutputSchema},
  prompt: `You are an expert application designer and product strategist.
Based on the following application idea, generate a detailed proposal.

Application Idea: {{{idea}}}

Please provide the following:
1.  **App Name:** A catchy and relevant name for the application.
2.  **Core Features:** A list of 3-5 primary core features. For each feature, provide:
    *   Feature: The title of the feature.
    *   Description: A short, clear description of what the feature does.
3.  **UI/UX Guidelines:** A list of 3-5 distinct UI/UX guidelines. For each guideline, provide:
    *   Category: The area of UI/UX it addresses (e.g., Color Palette, Typography, Layout, Navigation, Tone & Voice, Accessibility, User Feedback).
    *   Guideline: The specific recommendation or principle for that category.
    Ensure the guidelines are diverse and cover different aspects of UI/UX design. Do not repeat categories unless the guidelines within them are truly distinct and complementary. For example, if "Color Palette" is a category, subsequent guidelines should use different categories like "Typography" or "Layout". Try to provide unique categories for each guideline requested.

Focus on creating a practical and insightful proposal.
`,
});

const generateDetailedProposalFlow = ai.defineFlow(
  {
    name: 'generateDetailedProposalFlow',
    inputSchema: GenerateDetailedProposalInputSchema,
    outputSchema: GenerateDetailedProposalOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate detailed proposal. AI returned no output.");
    }

    if (output.uiUxGuidelines) {
      const categoryMap = new Map<string, UiUxGuideline>();
      for (const guideline of output.uiUxGuidelines) { 
          const categoryKey = guideline.category.trim().toLowerCase();
          if (!categoryMap.has(categoryKey)) {
              categoryMap.set(categoryKey, guideline);
          }
      }
      output.uiUxGuidelines = Array.from(categoryMap.values());
    }
    
    return output;
  }
);



