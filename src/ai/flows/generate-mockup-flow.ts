'use server';
/**
 * @fileOverview Generates a website mockup image based on application details.
 *
 * - generateMockup - A function that generates the mockup.
 * - GenerateMockupInput - The input type for the generateMockup function.
 * - GenerateMockupOutput - The return type for the generateMockup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMockupInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  coreFeatures: z.array(
    z.object({
      feature: z.string(),
      description: z.string(),
    })
  ).describe('A list of core features for the application.'),
  uiUxGuidelines: z.array(
    z.object({
      category: z.string(),
      guideline: z.string(),
    })
  ).describe('UI/UX guidelines for the application.')
});
export type GenerateMockupInput = z.infer<typeof GenerateMockupInputSchema>;

const GenerateMockupOutputSchema = z.object({
  mockupImageUrl: z.string().describe("A data URI of the generated mockup image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateMockupOutput = z.infer<typeof GenerateMockupOutputSchema>;

export async function generateMockup(input: GenerateMockupInput): Promise<GenerateMockupOutput> {
  return generateMockupFlow(input);
}

const generateMockupFlow = ai.defineFlow(
  {
    name: 'generateMockupFlow',
    inputSchema: GenerateMockupInputSchema,
    outputSchema: GenerateMockupOutputSchema,
  },
  async (input) => {
    const featuresString = input.coreFeatures.map(f => `- ${f.feature}: ${f.description}`).join('\n');
    const uiGuidelinesString = input.uiUxGuidelines.map(g => `- ${g.category}: ${g.guideline}`).join('\n');

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Must use this model for image generation
      prompt: `Generate a clean, simple, and modern website mockup for an application called "${input.appName}". 
      
      The website should visually represent the following core features:
      ${featuresString}

      Consider these UI/UX guidelines in the design:
      ${uiGuidelinesString}
      
      The mockup should be a single, clear landing page concept. Focus on layout, color scheme, and typography that would be appropriate for such an app. Avoid excessive detail or complex illustrations. Ensure text is placeholder lorem ipsum or generic labels like "Feature X", "Learn More". The style should be minimalist and professional.
      `,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must provide both
      },
       safetySettings: [ // Add safety settings to allow more content generation
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media.');
    }
    
    return {mockupImageUrl: media.url};
  }
);
