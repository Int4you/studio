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
      prompt: `You are an expert UI/UX designer specializing in creating high-quality mobile application mockups.
Your task is to generate a set of 3-4 distinct, high-fidelity, visually engaging, and modern mobile app mockup screens for an application called "${input.appName}".
The design should emulate the quality and style of top-tier consumer mobile applications, featuring a clean, minimalist aesthetic, intuitive navigation, and a professional, polished look. Think of modern apps with clean lines, generous white space, clear typography, and intuitive iconography (like the visual style of a well-designed health and fitness or productivity app).

Key Requirements for the Mockups:
1.  **Mobile-First Design**: All screens must be designed for a standard smartphone display (e.g., portrait orientation).
2.  **Multiple Distinct Screens**: Generate 3 to 4 different screens. These screens should represent a typical user flow or showcase different key functionalities. Examples could include:
    *   A primary dashboard or home screen.
    *   A screen demonstrating a core interactive feature (e.g., data entry, content scanning/viewing, a creation process, detailed item view).
    *   A user profile or settings screen.
    *   A list view, feed screen, or a navigation/menu screen, if applicable to the app's nature.
3.  **High-Fidelity & Quality**: Mockups should look close to a final product, with meticulous attention to detail in layout, element spacing, typography (use clear, modern sans-serif fonts), and iconography (use simple, universally understandable icons).
4.  **UI Elements**: Use common mobile UI elements (buttons with clear affordances, navigation bars - top or bottom, input fields, cards, lists, modals, etc.) appropriately and consistently.
5.  **Placeholder Content**: Text should be placeholder (e.g., "Lorem Ipsum", "User Name", "Feature Title", "Dashboard Item") but arranged realistically to mimic actual content flow. Images depicted *within* the app mockups (not the mockups themselves) should be abstract, generic placeholders, or thematic to the app's purpose.
6.  **Cohesive Set**: All screens must share a consistent design language (e.g., corner roundness, shadow styles), color scheme, and typography.

The mobile application should visually represent the following core features:
${featuresString}

Crucially, apply these UI/UX guidelines meticulously in the design:
${uiGuidelinesString}

If no specific color palette is provided in the UI/UX guidelines, adopt a light, clean theme with a single, tastefully chosen accent color for interactive elements and highlights. Ensure excellent readability and accessibility (e.g., sufficient contrast) in your design choices.
Present these screens as clearly separated individual mobile screen mockups, each looking like a distinct screenshot from a phone. If the model can only output a single composite image, ensure each screen is distinct, well-defined, and clearly demarcated as a separate phone screen within that composite.
The overall style should be sophisticated, user-centric, and modern, avoiding generic or outdated templates. Aim for a unique and compelling visual identity that looks production-ready.
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

