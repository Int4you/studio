'use server';
/**
 * @fileOverview Generates an MVP roadmap for a given application concept.
 *
 * - generateRoadmap - A function that generates the MVP roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InputFeatureSchema = z.object({
  feature: z.string().describe('The title of the feature.'),
  description: z.string().describe('A short description of the feature.'),
  priorityScore: z.number().min(1).max(10).optional().describe('Optional: A numerical priority score from 1 (lowest) to 10 (highest).'),
  estimatedImpact: z.enum(["High", "Medium", "Low"]).optional().describe('Optional: Estimated market impact or user value (High, Medium, Low).'),
  estimatedEffort: z.enum(["High", "Medium", "Low"]).optional().describe('Optional: Estimated development effort (High, Medium, Low).'),
  reasoning: z.string().optional().describe('Optional: Justification for the priority, impact, or effort.'),
});

const GenerateRoadmapInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appDescription: z.string().describe('A detailed description of the application and its purpose.'),
  features: z.array(InputFeatureSchema).describe('The list of core features for the application. These may or may not include prioritization details.'),
  targetAudience: z.string().optional().describe('A description of the target audience for the application.'),
  marketAnalysisSummary: z.string().optional().describe('A brief summary of the market analysis, if available (e.g., competitive landscape or market overview).'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const RoadmapFeatureSchema = z.object({
  featureName: z.string().describe('The name of the feature included in this phase.'),
  featureDescription: z.string().describe('A brief description of what this feature entails for this phase.'),
  justificationForPhase: z.string().describe("Brief reasoning why this feature is included in this specific phase of the MVP."),
});

const RoadmapPhaseSchema = z.object({
  phaseNumber: z.number().int().positive().describe("The chronological number of the phase (e.g., 1, 2, 3)."),
  phaseTitle: z.string().describe("A concise and descriptive title for the phase (e.g., 'Phase 1: Core MVP Launch & User Onboarding')."),
  phaseGoal: z.string().describe("The primary objective or main goal to achieve by the end of this phase."),
  estimatedDuration: z.string().describe("An estimated timeframe for this phase (e.g., '4-6 Weeks', '2 Sprints (4 Weeks)', '1 Month')."),
  featuresInPhase: z.array(RoadmapFeatureSchema).min(1).describe("A list of specific features to be developed and deployed in this phase."),
  keyDeliverables: z.array(z.string()).min(1).describe("Tangible outputs or milestones expected at the end of this phase (e.g., 'Functional user registration', 'Basic search implemented')."),
});

const GenerateRoadmapOutputSchema = z.object({
  roadmapTitle: z.string().describe("An overall title for the MVP roadmap, e.g., 'MVP Roadmap for [AppName]'."),
  mvpPhases: z.array(RoadmapPhaseSchema).min(2).max(4).describe("A list of 2 to 4 MVP phases, ordered chronologically. Each phase should build upon the last."),
  overallMvpTimeline: z.string().describe("An estimated total timeline for completing all MVP phases (e.g., '3-5 Months', 'Approx. 1 Quarter')."),
  keySuccessMetricsForMvp: z.array(z.string()).min(2).max(4).describe("2-4 key metrics to track the success of the MVP post-launch (e.g., 'User sign-up rate', 'Daily Active Users', 'Feature adoption percentage')."),
  postMvpSuggestions: z.array(z.string()).max(2).optional().describe("Optional: 1-2 brief, high-level suggestions for post-MVP development or strategic focus areas."),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert Product Manager and Agile Coach specializing in creating actionable MVP (Minimum Viable Product) roadmaps.
Your task is to develop a phased MVP roadmap for the application described below.

Application Details:
- Name: {{{appName}}}
- Description: {{{appDescription}}}
{{#if targetAudience}}
- Target Audience: {{{targetAudience}}}
{{/if}}
{{#if marketAnalysisSummary}}
- Market Analysis Summary: {{{marketAnalysisSummary}}}
{{/if}}

Features to consider for the roadmap:
{{#each features}}
  - Feature: {{this.feature}}
    Description: {{this.description}}
    {{#if this.priorityScore}}Priority Score: {{this.priorityScore}}/10{{/if}}
    {{#if this.estimatedImpact}}Impact: {{this.estimatedImpact}}{{/if}}
    {{#if this.estimatedEffort}}Effort: {{this.estimatedEffort}}{{/if}}
    {{#if this.reasoning}}Reasoning: {{this.reasoning}}{{/if}}
{{/each}}

Roadmap Generation Guidelines:
1.  **Roadmap Title**: Create an overall title for the MVP roadmap.
2.  **MVP Phases (2-4 Phases)**:
    *   Divide the MVP development into 2 to 4 logical, sequential phases.
    *   For each phase, provide:
        *   \\\`phaseNumber\\\`: A chronological number (1, 2, etc.).
        *   \\\`phaseTitle\\\`: A concise, descriptive title (e.g., "Phase 1: Core Functionality & User Onboarding").
        *   \\\`phaseGoal\\\`: The primary objective of this phase.
        *   \\\`estimatedDuration\\\`: An estimated timeframe (e.g., "3-5 Weeks", "1 Sprint (2 Weeks)").
        *   \\\`featuresInPhase\\\`: List of features to be implemented. For each feature:
            *   \\\`featureName\\\`: The name of the feature.
            *   \\\`featureDescription\\\`: A brief description of what part of the feature is built in this phase.
            *   \\\`justificationForPhase\\\`: Why this feature (or part of it) belongs in this phase.
        *   \\\`keyDeliverables\\\`: Tangible outputs or milestones for this phase (e.g., "Working user login", "Ability to create basic profiles").
3.  **Feature Phasing Logic**:
    *   If \\\`priorityScore\\\`, \\\`estimatedImpact\\\`, and \\\`estimatedEffort\\\` are provided for features, use these heavily to guide phasing. High-priority (high score), high-impact, and low-to-medium effort features should generally come earlier.
    *   If prioritization details are sparse or absent for some features, use your expert judgment based on the feature descriptions, app description, and typical MVP principles to sequence them logically. Focus on delivering core value and enabling user feedback loops early.
    *   Ensure features build upon each other where logical dependencies exist.
4.  **Overall MVP Timeline**: Estimate the total time to complete all MVP phases.
5.  **Key Success Metrics**: Define 2-4 key metrics to measure the MVP's success after launch.
6.  **Post-MVP Suggestions (Optional)**: Briefly suggest 1-2 high-level directions for after the MVP is complete.

Ensure the output strictly adheres to the 'GenerateRoadmapOutputSchema'. The roadmap should be practical and help guide the initial development efforts effectively.
Focus on a lean MVP. Avoid over-scoping the initial phases.
`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Roadmap generation failed or returned no output.');
    }
    // Ensure phases are sorted by phaseNumber if AI doesn't do it perfectly
    output.mvpPhases.sort((a, b) => a.phaseNumber - b.phaseNumber);
    return output;
  }
);

