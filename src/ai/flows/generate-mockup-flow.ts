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
  ).describe('UI/UX guidelines for the application.'),
  referenceImageDataUri: z.string().optional().describe("An optional reference image (as a data URI) for style guidance. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateMockupInput = z.infer<typeof GenerateMockupInputSchema>;

const GenerateMockupOutputSchema = z.object({
  mockupImageUrls: z.array(z.string().describe("A data URI of a generated mockup image. Expected format: 'data:image/png;base64,<encoded_data>'."))
  .describe('An array of data URIs for the generated mockup images (one for each distinct screen).'),
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

    const promptText = `You are an expert UI/UX designer specializing in creating high-quality mobile application mockups.
Your primary task is to generate multiple distinct mobile app mockup screens for an application called "${input.appName}".
**You MUST generate 3 separate image outputs. If a fourth screen is highly relevant and distinct, you may generate 4 separate image outputs.** Each image output must be a single, individual mobile screen. Do not combine screens into one image.

{{#if referenceImageDataUri}}
**Style Reference:**
Use the following image as a strong visual and stylistic reference for the mockups. Adapt its color palette, typography style, element shapes, and overall modern aesthetic:
{{media url=referenceImageDataUri}}
{{/if}}

Key Requirements for the Mockups:
1.  **Mobile-First Design**: All screens must be designed for a standard smartphone display (e.g., portrait orientation).
2.  **Multiple Distinct Screens/Image Outputs**: You **must** generate 3 (or up to 4) different screens, each as a separate image. These screens should represent a typical user flow or showcase different key functionalities. Examples could include:
    *   A primary dashboard or home screen.
    *   A screen demonstrating a core interactive feature (e.g., data entry, content scanning/viewing, a creation process, detailed item view).
    *   A user profile or settings screen.
    *   A list view, feed screen, or a navigation/menu screen, if applicable to the app's nature.
3.  **High-Fidelity & Quality**: Mockups should look close to a final product, with meticulous attention to detail in layout, element spacing, typography (use clear, modern sans-serif fonts), and iconography (use simple, universally understandable icons). The quality should be comparable to professional app store screenshots or the provided reference image if one was given.
4.  **UI Elements**: Use common mobile UI elements (buttons with clear affordances, navigation bars - top or bottom, input fields, cards, lists, modals, etc.) appropriately and consistently.
5.  **Placeholder Content**: Text should be placeholder (e.g., "Lorem Ipsum", "User Name", "Feature Title", "Dashboard Item") but arranged realistically to mimic actual content flow. Images depicted *within* the app mockups (not the mockups themselves) should be abstract, generic placeholders, or thematic to the app's purpose.
6.  **Cohesive Set**: All screens must share a consistent design language (e.g., corner roundness, shadow styles), color scheme, and typography, potentially inspired by the reference image if provided.

The mobile application should visually represent the following core features:
${featuresString}

Crucially, apply these UI/UX guidelines meticulously in the design:
${uiGuidelinesString}

If no specific color palette is provided in the UI/UX guidelines (and no reference image is given or its colors are not suitable), adopt a light, clean theme with a single, tastefully chosen accent color for interactive elements and highlights. Ensure excellent readability and accessibility (e.g., sufficient contrast) in your design choices.

**Final Instruction on Output Format:**
Present these screens as clearly separated individual mobile screen mockups. You must provide 3 (or 4, if appropriate) distinct image outputs. Each image file should contain only one screen.
      `;

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: promptText,
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
    
    if (imageUrls.length === 0) {
      // Check top-level media as a fallback, though less likely with new models
      if (response.media && response.media.url) {
        imageUrls.push(response.media.url);
      } else {
        console.warn("Image generation returned no media in candidates or top-level response.");
      }
    }
        
    if (imageUrls.length === 0) {
        throw new Error('Image generation failed or returned no media. The model may not have produced any images.');
    }
    
    return {mockupImageUrls: imageUrls};
  }
);

