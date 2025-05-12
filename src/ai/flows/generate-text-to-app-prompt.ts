'use server';
/**
 * @fileOverview Generates a detailed prompt for a "Text to App" tool based on application details.
 *
 * - generateTextToAppPrompt - A function that generates the detailed prompt.
 * - GenerateTextToAppPromptInput - The input type for the generateTextToAppPrompt function.
 * - GenerateTextToAppPromptOutput - The return type for the generateTextToAppPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextToAppPromptInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appIdeaDescription: z.string().describe('The original description of the application idea.'),
  coreFeatures: z.array(
    z.object({
      feature: z.string().describe('The name of the core feature.'),
      description: z.string().describe('The description of the core feature.'),
    })
  ).describe('A list of core features for the application.'),
  uiUxGuidelines: z.array(
    z.object({
      category: z.string().describe('The category of the UI/UX guideline (e.g., color, typography).'),
      guideline: z.string().describe('The UI/UX guideline itself.'),
    })
  ).describe('UI/UX guidelines for the application.'),
});
export type GenerateTextToAppPromptInput = z.infer<typeof GenerateTextToAppPromptInputSchema>;

const GenerateTextToAppPromptOutputSchema = z.object({
  detailedPrompt: z.string().describe('A highly detailed prompt suitable for a "Text to App" code generation tool.'),
});
export type GenerateTextToAppPromptOutput = z.infer<typeof GenerateTextToAppPromptOutputSchema>;

export async function generateTextToAppPrompt(input: GenerateTextToAppPromptInput): Promise<GenerateTextToAppPromptOutput> {
  return generateTextToAppPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTextToAppPrompt',
  input: {schema: GenerateTextToAppPromptInputSchema},
  output: {schema: GenerateTextToAppPromptOutputSchema},
  prompt: `You are an expert prompt engineer for "Text to App" code generation tools. Your task is to create a highly detailed and actionable prompt based on the provided application concept. This prompt will be used by an AI to generate the full application code.

Application Name: {{{appName}}}
Original Idea Description: {{{appIdeaDescription}}}

Core Features:
{{#each coreFeatures}}
- Feature: {{feature}}
  Description: {{description}}
{{/each}}

UI/UX Guidelines:
{{#each uiUxGuidelines}}
- Category: {{category}}
  Guideline: {{guideline}}
{{/each}}

Based on the information above, construct a comprehensive prompt for a "Text to App" tool. The prompt should instruct the tool to generate a fully functional mobile application.

The prompt MUST include the following sections, clearly delineated with Markdown headings (e.g., ## Section Title ##):

## 1. Overall Application Overview ##
- **Application Name:** {{{appName}}}
- **Concise Summary:** Briefly reiterate the core purpose of the app based on '{{{appIdeaDescription}}}'.
- **Target Platform:** Mobile (primarily for iOS and Android, focusing on responsive design suitable for smartphones).

## 2. Detailed Feature Breakdown & User Flows ##
{{#each coreFeatures}}
- **Feature: {{feature}}**
    - **Description:** {{description}}
    - **Main User Interactions & Flows:** (Provide a step-by-step typical user flow for this feature. Be specific. For example, if it's 'Task Creation', list steps like 'User taps "Add Task" button', 'User enters task title and description', 'User selects due date', 'User taps "Save Task" button'.)
    - **Required UI Elements:** (List necessary UI elements like buttons, input fields, lists, cards, modals, navigation components, etc., specific to this feature.)
    - **Data Handling:** (Mention data to be displayed or collected for this feature, e.g., 'Displays a list of tasks', 'Collects user preferences'.)
{{/each}}

## 3. Key Screens & Navigation ##
- **Essential Screens:** List the primary screens the app must have (e.g., Splash Screen, Login/Signup Screen (if applicable), Home/Dashboard Screen, Settings Screen, User Profile Screen, dedicated screens for each core feature).
- **Navigation Structure:** Describe the main navigation pattern (e.g., "Bottom Tab Bar for primary navigation (Home, Features, Profile). Stack Navigation for flows within each tab.").

## 4. UI/UX Design & Styling Instructions ##
- **General Aesthetic:** Aim for a modern, clean, and intuitive user interface. The app should be user-friendly and visually appealing.
{{#each uiUxGuidelines}}
- **{{category}} Specifics:** {{guideline}}. (Elaborate on how this guideline translates to design choices. For example, if 'Color' guideline is 'Use a calming blue palette', suggest specific shades like 'Primary: #3B82F6, Accent: #10B981, Background: #F3F4F6').
{{/each}}
- **Color Palette:** If not detailed in guidelines, suggest: "Use a contemporary color scheme. For example: Background: hsl(220 20% 97%), Foreground: hsl(240 10% 10%), Primary: hsl(258 90% 58%), Accent: hsl(173 90% 45%). Ensure sufficient contrast for accessibility."
- **Typography:** "Use a clear, legible, modern sans-serif font family (e.g., Inter, Roboto, or system default). Define hierarchy with font sizes and weights (e.g., Headings: 24pt bold, Subheadings: 18pt semi-bold, Body: 14pt regular)."
- **Iconography:** "Employ minimalist, universally recognizable icons (e.g., from Lucide React or a similar library). Icons should be consistent in style and size."
- **Layout & Spacing:** "Maintain consistent spacing and alignment throughout the app. Use a clear visual hierarchy to guide the user. Employ padding and margins effectively for a breathable layout."
- **Imagery/Illustrations (if applicable):** "If the app uses images or illustrations, they should be high-quality and align with the app's modern aesthetic. Use placeholders where specific images are not yet defined."

## 5. Data Handling & Persistence (Conceptual) ##
- Specify data management: (e.g., "User-generated content should be stored locally on the device. If user accounts are involved, consider cloud synchronization for data backup and cross-device access using a service like Firebase Firestore or a similar BaaS.") - Be specific if the app idea implies complex data needs.

## 6. User Authentication (if applicable) ##
- If features like user profiles, personalized content, or data syncing are present (check core features): "Implement user authentication with options for Email/Password signup and login. Include a 'Forgot Password' flow. Consider social login options (e.g., Google, Apple) for ease of access."

## 7. Error Handling & User Feedback ##
- "Incorporate clear user feedback mechanisms for actions (e.g., toast notifications for success/failure, loading indicators for asynchronous operations)."
- "Implement robust error handling for common scenarios such as invalid user input, network connectivity issues, and API errors. Display user-friendly error messages."

## 8. Output Expectations for "Text to App" Tool ##
- **Framework & Language:** "Generate the application code preferably using React Native with TypeScript. Alternatively, Swift for iOS and Kotlin for Android (native) or Flutter with Dart are acceptable if React Native is not the primary generation target of the tool."
- **Code Structure:** "Organize the code logically with a clear separation of concerns. Use a component-based architecture. Group files by feature or screen."
- **State Management:** "Implement a clear state management solution (e.g., Context API, Zustand, Redux Toolkit for React Native; Provider or Riverpod for Flutter)."
- **API Integration:** "If features require external data, define placeholder API functions/endpoints and demonstrate how to integrate them."
- **Responsiveness & Accessibility:** "Ensure the UI is responsive and adapts well to various mobile screen sizes and orientations. Follow accessibility best practices (e.g., semantic HTML-like structures, ARIA attributes where applicable in web-based views if any, proper touch target sizes)."
- **Placeholder Content:** "Use meaningful placeholder text and images throughout the app to illustrate content areas and ensure the app is visually complete and testable."
- **Comments & Documentation:** "Include clear comments in the code to explain complex logic and component responsibilities. Provide a brief README on how to run the generated project."

Make the final prompt extremely detailed, well-structured, and easy for another AI to interpret and act upon to generate an application. Ensure all provided input details are incorporated effectively. The output should be a single string which is this meticulously crafted prompt. Do not add any conversational preamble or sign-off, just the prompt itself.
`,
});

const generateTextToAppPromptFlow = ai.defineFlow(
  {
    name: 'generateTextToAppPromptFlow',
    inputSchema: GenerateTextToAppPromptInputSchema,
    outputSchema: GenerateTextToAppPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate the text-to-app prompt. The AI returned no output.");
    }
    return output;
  }
);

