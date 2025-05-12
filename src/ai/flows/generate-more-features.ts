'use server';
/**
 * @fileOverview Generates additional core feature ideas for an application.
 *
 * - generateMoreFeatures - A function that generates more feature ideas.
 * - GenerateMoreFeaturesInput - The input type for the generateMoreFeatures function.
 * - GenerateMoreFeaturesOutput - The return type for the generateMoreFeatures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoreFeatureSchema = z.object({
  feature: z.string().describe('The title of the core feature.'),
  description: z.string().describe('A short description of the core feature.'),
});

const GenerateMoreFeaturesInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appDescription: z.string().describe('The description of the application idea.'),
  existingFeatures: z.array(CoreFeatureSchema).describe('The list of existing core features.'),
});
export type GenerateMoreFeaturesInput = z.infer<typeof GenerateMoreFeaturesInputSchema>;

const GenerateMoreFeaturesOutputSchema = z.object({
  newFeatures: z.array(CoreFeatureSchema).describe('An array of new, distinct core feature ideas.'),
});
export type GenerateMoreFeaturesOutput = z.infer<typeof GenerateMoreFeaturesOutputSchema>;

export async function generateMoreFeatures(input: GenerateMoreFeaturesInput): Promise<GenerateMoreFeaturesOutput> {
  return generateMoreFeaturesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMoreFeaturesPrompt',
  input: {schema: GenerateMoreFeaturesInputSchema},
  output: {schema: GenerateMoreFeaturesOutputSchema},
  prompt: `You are an expert application feature generator.
You are working on an application called "{{appName}}".
The application's main concept is: "{{appDescription}}".

The application already has the following core features:
{{#if existingFeatures}}
{{#each existingFeatures}}
- Feature: {{this.feature}}
  Description: {{this.description}}
{{/each}}
{{else}}
(No existing features yet)
{{/if}}

Please generate 3 new and distinct core feature ideas that would complement the existing features and align with the application's overall concept.
Each new feature must have a unique 'feature' title and a concise 'description'.
Ensure the new features are genuinely different from the existing ones and provide added value. Do not repeat or rephrase existing features.
Focus on creativity and feasibility.
`,
});

const generateMoreFeaturesFlow = ai.defineFlow(
  {
    name: 'generateMoreFeaturesFlow',
    inputSchema: GenerateMoreFeaturesInputSchema,
    outputSchema: GenerateMoreFeaturesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate more features. The AI returned no output.");
    }

    // Ensure distinctness from existing features (case-insensitive for feature title)
    const existingFeatureTitlesLower = input.existingFeatures.map(f => f.feature.toLowerCase());
    const trulyNewFeatures = output.newFeatures.filter(nf => 
        !existingFeatureTitlesLower.includes(nf.feature.toLowerCase())
    );
    
    // Further deduplicate new features among themselves
    const uniqueNewFeaturesAmongGenerated = trulyNewFeatures.reduce((acc, current) => {
        const x = acc.find(item => item.feature.toLowerCase() === current.feature.toLowerCase());
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, [] as z.infer<typeof CoreFeatureSchema>[]);


    return { newFeatures: uniqueNewFeaturesAmongGenerated };
  }
);

