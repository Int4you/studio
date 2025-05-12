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

const UiUxGuidelineSchema = z.object({
  category: z.string().describe('The category of the UI/UX guideline (e.g., Color Palette, Typography, Layout, Navigation, Tone & Voice).'),
  guideline: z.string().describe('The specific guideline for this category.'),
});

export const GenerateDetailedProposalInputSchema = z.object({
  idea: z.string().describe('The application idea to develop a proposal for. This should be a concise description of the app concept.'),
});
export type GenerateDetailedProposalInput = z.infer<typeof GenerateDetailedProposalInputSchema>;

export const GenerateDetailedProposalOutputSchema = z.object({
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

    // Ensure UI/UX Guidelines are reasonably distinct by category and guideline text to avoid obvious duplicates
    if (output.uiUxGuidelines) {
      const uniqueGuidelines = output.uiUxGuidelines.reduce((acc, current) => {
        const trimmedCategory = current.category.trim().toLowerCase();
        const trimmedGuideline = current.guideline.trim().toLowerCase();
        
        const isDuplicate = acc.some(item => 
            item.category.trim().toLowerCase() === trimmedCategory &&
            item.guideline.trim().toLowerCase() === trimmedGuideline
        );
        // Also check for duplicate categories, even if guideline text is slightly different,
        // as the prompt asks for distinct categories if possible.
        // This simplified check focuses on category primarily for deduplication.
        const isCategoryDuplicate = acc.some(item => item.category.trim().toLowerCase() === trimmedCategory);

        if (!isDuplicate && !isCategoryDuplicate) {
          acc.push(current);
        } else if (!isDuplicate && isCategoryDuplicate) {
          // If category is duplicate but guideline text is different, allow it for now,
          // as the AI might have a reason. Stronger deduplication might be too restrictive.
          // Let's refine: only add if the category is not already present
           if (!acc.some(item => item.category.trim().toLowerCase() === trimmedCategory)) {
             acc.push(current);
           }
        }
        return acc;
      }, [] as z.infer<typeof UiUxGuidelineSchema>[]);
      
      // Second pass to ensure distinct categories as much as possible
      const categoryMap = new Map<string, z.infer<typeof UiUxGuidelineSchema>>();
      for (const guideline of output.uiUxGuidelines) { // iterate over original to respect AI's primary choices
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

