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
  mockupImageUrls: z.array(z.string().describe("A data URI of a generated mockup image. Expected format: 'data:image/png;base64,<encoded_data>'."))
  .describe('An array of data URIs for the generated mockup images.'),
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

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: `Generate a set of 2-3 high-fidelity, visually engaging, and modern website mockup screens for an application called "${input.appName}".
These screens should showcase distinct key aspects of the application. For example, a landing page, a core feature in action (like a dashboard or main interaction screen), and a user profile or settings page.
Present these screens as a cohesive set. If possible, provide separate images for each screen. Alternatively, arrange them in a storyboard format or as a sequence of views within a single composite image if multiple distinct image outputs are not directly supported.

The design should be sleek, professional, and user-friendly, with intuitive navigation and clear call-to-actions. It should look polished and production-ready.

The website should visually represent the following core features:
${featuresString}

Crucially, apply these UI/UX guidelines meticulously in the design:
${uiGuidelinesString}
      
Focus on a sophisticated layout, appealing color scheme, and professional typography. Ensure text is placeholder (e.g., lorem ipsum or generic labels like "User Profile", "Dashboard", "Settings", "Feature X", "Learn More") but arranged to mimic real content flow. 
The overall style should be minimalist yet impactful. Avoid overly simplistic or generic templates; aim for a unique and compelling visual identity.
      `,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], 
      },
       safetySettings: [ 
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    });

    const imageUrls: string[] = [];
    if (response.candidates && response.candidates.length > 0) {
      for (const candidate of response.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.media && part.media.url) {
              imageUrls.push(part.media.url);
            }
          }
        }
      }
    }

    // Fallback to top-level media if no images found in parts (maintains compatibility if model returns single image directly)
    if (imageUrls.length === 0 && response.media && response.media.url) {
      imageUrls.push(response.media.url);
    }
    
    if (imageUrls.length === 0) {
      throw new Error('Image generation failed or returned no media.');
    }
    
    return {mockupImageUrls: imageUrls};
  }
);

