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
  description: z.string().describe('A brief explanation of the trend.'),
  relevanceToApp: z.enum(["High", "Medium", "Low"]).describe('How relevant this trend is to the proposed application.'),
  potentialImpactMagnitude: z.enum(["Significant Positive", "Moderate Positive", "Neutral", "Moderate Negative", "Significant Negative"])
    .describe('The potential magnitude and direction of impact this trend could have on the app.'),
});

const CompetitorSchema = z.object({
  name: z.string().describe('The name of the competitor.'),
  strengths: z.array(z.string()).describe('List of 2-3 key strengths of the competitor.'),
  weaknesses: z.array(z.string()).describe('List of 2-3 key weaknesses of the competitor.'),
  primaryOffering: z.string().describe('Brief description of their main product/service relevant to the app concept.'),
  estimatedRevenuePotential: z.enum(["Low", "Medium", "High", "Very High", "Uncertain"])
    .describe('A qualitative estimation of the general revenue potential tier for an app like this in the market, not a specific financial figure.'),
  revenuePotentialReasoning: z.string().describe('Brief reasoning for the estimated revenue potential tier, considering monetization strategies typical for such apps (e.g., subscriptions, ads, freemium).'),
});

const SwotAnalysisSchema = z.object({
  strengths: z.array(z.string()).describe('List 2-3 most impactful internal strengths.'),
  weaknesses: z.array(z.string()).describe('List 2-3 most impactful internal weaknesses.'),
  opportunities: z.array(z.string()).describe('List 2-3 most impactful external market opportunities.'),
  threats: z.array(z.string()).describe('List 2-3 most impactful external market threats.'),
});

const MarketSizeAndGrowthSchema = z.object({
    estimation: z.string().describe('Qualitative estimation of the market size (e.g., Niche, Growing, Large, Saturated).'),
    potential: z.string().describe('Brief assessment of growth potential for an app like this.'),
    marketSaturation: z.enum(["Low", "Medium", "High"]).describe('The level of saturation in the current market.'),
    growthRateOutlook: z.enum(["Slow", "Moderate", "Rapid"]).describe('The anticipated growth rate for this market segment.'),
});

const AnalyzeMarketOutputSchema = z.object({
  marketOverview: z.string().describe("A brief overview of the current market state relevant to the app."),
  marketTrends: z.array(TrendSchema).describe('Key current market trends (provide 2-3 distinct trends), including their relevance and potential impact magnitude.'),
  potentialCompetitors: z.array(CompetitorSchema).describe('List of 2-3 key potential competitors, including their estimated revenue potential tier and reasoning.'),
  marketSizeAndGrowth: MarketSizeAndGrowthSchema.describe('Assessment of market size, growth potential, saturation, and outlook.'),
  swotAnalysis: SwotAnalysisSchema.describe('SWOT analysis, focusing on the 2-3 most impactful items for each category.'),
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
2.  **Market Trends**: Identify and describe 2-3 key current market trends. For each trend, provide:
    *   Trend title.
    *   Brief description.
    *   Relevance to this app (High, Medium, Low).
    *   Potential impact magnitude on this app (Significant Positive, Moderate Positive, Neutral, Moderate Negative, Significant Negative).
3.  **Potential Competitors**: Identify 2-3 key potential competitors. For each, provide:
    *   Competitor name.
    *   Their primary offering relevant to the app concept.
    *   2-3 key strengths.
    *   2-3 key weaknesses.
    *   Estimated revenue potential tier for apps of this nature in the market (Low, Medium, High, Very High, Uncertain). This is a qualitative assessment of the general market viability, not a financial forecast for THIS specific app or competitor.
    *   Brief reasoning for this revenue potential tier (e.g., based on typical monetization strategies like subscriptions, ads, freemium models common in similar successful apps).
4.  **Market Size and Growth**:
    *   Qualitative estimation of the market size (e.g., Niche, Emerging, Growing, Large, Mature, Saturated).
    *   Brief assessment of growth potential for an application of this nature.
    *   Market saturation level (Low, Medium, High).
    *   Anticipated growth rate outlook for this market segment (Slow, Moderate, Rapid).
5.  **SWOT Analysis**: Conduct a SWOT analysis for the application concept. For each category (Strengths, Weaknesses, Opportunities, Threats), list the 2-3 *most impactful* and distinct points.
6.  **Competitive Landscape Summary**: Write a concise summary of the competitive landscape.
7.  **Strategic Recommendations**: Based on your analysis, provide 2-3 actionable strategic recommendations for the application to succeed.

Strive for insightful, distinct, and relevant information in each section. Avoid generic statements. Ensure all requested structured fields (enums, scores) are populated correctly.
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
