'use server';
/**
 * @fileOverview Analyzes the market and competitive landscape for a given application concept.
 *
 * - analyzeMarket - A function that performs market analysis.
 * - AnalyzeMarketInput - The input type for the analyzeMarket function.
 * - AnalyzeMarketOutput - The return type for the analyzeMarket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoreFeatureSchema = z.object({
  feature: z.string().describe('The title of the core feature.'),
  description: z.string().describe('A short description of the core feature.'),
});

const AnalyzeMarketInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appDescription: z.string().describe('A detailed description of the application and its purpose.'),
  coreFeatures: z.array(CoreFeatureSchema).describe('The list of core features of the application.'),
  targetAudience: z.string().optional().describe('A description of the target audience for the application.'),
});
export type AnalyzeMarketInput = z.infer<typeof AnalyzeMarketInputSchema>;

const TrendSchema = z.object({
  trend: z.string().describe('A concise name or title for the market trend.'),
  description: z.string().describe('A brief explanation of the trend and its relevance to the application.'),
});

const CompetitorSchema = z.object({
  name: z.string().describe('The name of the competitor.'),
  strengths: z.array(z.string()).describe('List of key strengths of the competitor.'),
  weaknesses: z.array(z.string()).describe('List of key weaknesses of the competitor.'),
  primaryOffering: z.string().describe('Brief description of their main product/service relevant to the app concept.'),
});

const SwotAnalysisSchema = z.object({
  strengths: z.array(z.string()).describe('Internal strengths of the proposed application concept.'),
  weaknesses: z.array(z.string()).describe('Internal weaknesses of the proposed application concept.'),
  opportunities: z.array(z.string()).describe('External market opportunities for the application.'),
  threats: z.array(z.string()).describe('External market threats to the application.'),
});

const AnalyzeMarketOutputSchema = z.object({
  marketOverview: z.string().describe("A brief overview of the current market state relevant to the app."),
  marketTrends: z.array(TrendSchema).describe('Key current market trends relevant to the application (provide 2-3 distinct trends).'),
  potentialCompetitors: z.array(CompetitorSchema).describe('List of 2-3 key potential competitors with their strengths, weaknesses, and primary offering.'),
  marketSizeAndGrowth: z.object({
    estimation: z.string().describe('Qualitative estimation of the market size (e.g., Niche, Growing, Large, Saturated).'),
    potential: z.string().describe('Brief assessment of growth potential for an app like this.'),
  }).describe('Assessment of market size and growth potential.'),
  swotAnalysis: SwotAnalysisSchema.describe('SWOT analysis for the application concept.'),
  competitiveLandscapeSummary: z.string().describe('A concluding summary of the competitive landscape and the app\'s potential positioning.'),
  strategicRecommendations: z.array(z.string()).describe('2-3 actionable strategic recommendations based on the analysis.'),
});
export type AnalyzeMarketOutput = z.infer<typeof AnalyzeMarketOutputSchema>;

export async function analyzeMarket(input: AnalyzeMarketInput): Promise<AnalyzeMarketOutput> {
  return analyzeMarketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMarketPrompt',
  input: {schema: AnalyzeMarketInputSchema},
  output: {schema: AnalyzeMarketOutputSchema},
  prompt: `You are an expert Market Analyst and Business Strategist.
Your task is to conduct a comprehensive market analysis for a new application concept.

Application Details:
- Name: {{{appName}}}
- Description: {{{appDescription}}}
{{#if targetAudience}}
- Target Audience: {{{targetAudience}}}
{{/if}}
- Core Features:
{{#each coreFeatures}}
  - {{this.feature}}: {{this.description}}
{{/each}}

Based on these details, provide the following analysis. Ensure each section is well-defined and provides actionable insights.

1.  **Market Overview**: Briefly summarize the current state of the market relevant to this application.
2.  **Market Trends**: Identify and describe 2-3 key current market trends that could impact this application (positively or negatively). For each trend, provide a title and a short description.
3.  **Potential Competitors**: Identify 2-3 key potential competitors. For each, list their name, primary offering relevant to the app, key strengths, and key weaknesses.
4.  **Market Size and Growth**:
    *   Provide a qualitative estimation of the market size (e.g., Niche, Emerging, Growing, Large, Mature, Saturated).
    *   Briefly assess the growth potential for an application of this nature.
5.  **SWOT Analysis**: Conduct a SWOT analysis for the application concept:
    *   Strengths (Internal factors that give an advantage)
    *   Weaknesses (Internal factors that pose a disadvantage)
    *   Opportunities (External factors the app could exploit to its advantage)
    *   Threats (External factors that could cause trouble for the app)
    Provide 2-4 distinct points for each category.
6.  **Competitive Landscape Summary**: Write a concise summary of the competitive landscape.
7.  **Strategic Recommendations**: Based on your analysis, provide 2-3 actionable strategic recommendations for the application to succeed (e.g., differentiation strategy, niche focus, key partnerships).

Strive for insightful, distinct, and relevant information in each section. Avoid generic statements.
`,
});

const analyzeMarketFlow = ai.defineFlow(
  {
    name: 'analyzeMarketFlow',
    inputSchema: AnalyzeMarketInputSchema,
    outputSchema: AnalyzeMarketOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Market analysis generation failed or returned no output.');
    }
    return output;
  }
);
