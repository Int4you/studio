
'use server';
/**
 * @fileOverview Prioritizes application features based on market demand and development effort.
 *
 * - generateFeaturePrioritization - A function that prioritizes features.
 * - GenerateFeaturePrioritizationInput - The input type for the function.
 * - GenerateFeaturePrioritizationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoreFeatureSchema = z.object({
  feature: z.string().describe('The title of the core feature.'),
  description: z.string().describe('A short description of the core feature.'),
});

export const PrioritizedFeatureSchema = z.object({
  feature: z.string().describe('The title of the core feature.'),
  description: z.string().describe('A short description of the core feature.'),
  priorityScore: z.number().min(1).max(10).describe('A numerical priority score from 1 (lowest) to 10 (highest).'),
  reasoning: z.string().describe('The AI\'s justification for the assigned priority.'),
  estimatedImpact: z.enum(["High", "Medium", "Low"]).describe('Estimated market impact or user value (High, Medium, Low).'),
  estimatedEffort: z.enum(["High", "Medium", "Low"]).describe('Estimated development effort (High, Medium, Low).'),
});
export type PrioritizedFeature = z.infer<typeof PrioritizedFeatureSchema>;


export const GenerateFeaturePrioritizationInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appDescription: z.string().describe('A detailed description of the application and its purpose.'),
  coreFeatures: z.array(CoreFeatureSchema).describe('The list of core features to be prioritized.'),
  targetAudience: z.string().optional().describe('A description of the target audience for the application.'),
  developmentComplexityFactors: z.string().optional().describe('Any known factors contributing to development complexity (e.g., "Requires complex backend, 3rd party API usage, advanced machine learning models").'),
});
export type GenerateFeaturePrioritizationInput = z.infer<typeof GenerateFeaturePrioritizationInputSchema>;

export const GenerateFeaturePrioritizationOutputSchema = z.object({
  prioritizedFeatures: z.array(PrioritizedFeatureSchema).describe('An array of core features, prioritized and annotated with scores and reasoning.'),
});
export type GenerateFeaturePrioritizationOutput = z.infer<typeof GenerateFeaturePrioritizationOutputSchema>;

export async function generateFeaturePrioritization(input: GenerateFeaturePrioritizationInput): Promise<GenerateFeaturePrioritizationOutput> {
  return generateFeaturePrioritizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeaturePrioritizationPrompt',
  input: {schema: GenerateFeaturePrioritizationInputSchema},
  output: {schema: GenerateFeaturePrioritizationOutputSchema},
  prompt: `You are an expert Product Manager and Software Development Lead, specializing in feature prioritization for new applications.
Your task is to analyze the provided application details and its list of core features, then prioritize these features based on potential market impact, user value, and estimated development effort.

Application Name: {{{appName}}}
Application Description: {{{appDescription}}}
{{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}
{{#if developmentComplexityFactors}}Development Complexity Factors: {{{developmentComplexityFactors}}}{{/if}}

Existing Core Features to Prioritize:
{{#each coreFeatures}}
- Feature: {{this.feature}}
  Description: {{this.description}}
{{/each}}

Prioritization Guidelines:
1.  **Assess Impact (Market Demand & User Value):**
    *   Consider the app's core purpose (from 'Application Description') and its 'Target Audience' (if provided).
    *   Features that directly address the primary problem the app solves or offer significant unique value to the target users should have higher impact.
    *   Consider how essential each feature is for a minimum viable product (MVP).
    *   Assign 'High', 'Medium', or 'Low' for 'estimatedImpact'.

2.  **Assess Effort (Development Complexity):**
    *   Based on the feature's description and any 'Development Complexity Factors' provided, estimate the development effort.
    *   Features requiring complex backend logic, third-party API integrations, novel algorithms, extensive UI/UX design, or new technology stacks generally require higher effort.
    *   Simple CRUD operations, informational displays, or minor UI enhancements are typically lower effort.
    *   Assign 'High', 'Medium', or 'Low' for 'estimatedEffort'.

3.  **Assign Priority Score (1-10):**
    *   Assign a numerical priority score from 1 (lowest priority) to 10 (highest priority).
    *   Generally, features with High Impact and Low Effort should receive the highest scores (e.g., 8-10).
    *   Features with High Impact and High Effort might still be high priority if they are critical (e.g., 7-9).
    *   Features with Low Impact and High Effort should receive the lowest scores (e.g., 1-3).
    *   Features with Low Impact and Low Effort (quick wins) might get moderate scores (e.g., 4-6).
    *   Use your judgment to balance these factors.

4.  **Provide Reasoning:**
    *   For each feature, briefly explain the rationale behind its 'priorityScore', 'estimatedImpact', and 'estimatedEffort'. This reasoning is crucial.

Output Format:
Return ALL provided core features, each augmented with 'priorityScore', 'reasoning', 'estimatedImpact', and 'estimatedEffort'. The list should be ordered by 'priorityScore' in descending order (highest priority first). If scores are tied, maintain their relative order from the input or use a secondary sorting by impact (High > Medium > Low).

Ensure that every original feature is present in the output list, along with the prioritization details.
`,
});

const generateFeaturePrioritizationFlow = ai.defineFlow(
  {
    name: 'generateFeaturePrioritizationFlow',
    inputSchema: GenerateFeaturePrioritizationInputSchema,
    outputSchema: GenerateFeaturePrioritizationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate feature prioritization. The AI returned no output.");
    }
    // The prompt asks the AI to sort, but we can double-check or re-sort here if needed.
    // For now, trust the AI's sorting based on the prompt.
    return output;
  }
);
