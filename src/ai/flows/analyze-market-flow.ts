
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
  uniqueSellingPointsInput: z.array(z.string()).optional().describe('Optional: List of unique selling points provided by the user for their app concept.'),
});
export type AnalyzeMarketInput = z.infer<typeof AnalyzeMarketInputSchema>;

const TrendSchema = z.object({
  trend: z.string().describe('A concise name or title for the market trend.'),
  description: z.string().describe('A brief explanation of the trend.'),
  relevanceToApp: z.enum(["High", "Medium", "Low"]).describe('How relevant this trend is to the proposed application.'),
  potentialImpactMagnitude: z.enum(["Significant Positive", "Moderate Positive", "Neutral", "Moderate Negative", "Significant Negative"])
    .describe('The potential magnitude and direction of impact this trend could have on the app.'),
  actionableInsight: z.string().describe('A specific, actionable insight or recommendation for the app based on this trend.'),
  exampleImpactOnApp: z.string().describe('A concrete example of how this trend might specifically affect the user\'s app (e.g., feature adjustment, marketing angle).'),
});

const CompetitorSchema = z.object({
  name: z.string().describe('The name of the competitor.'),
  strengths: z.array(z.string()).describe('List of 2-3 key strengths of the competitor.'),
  weaknesses: z.array(z.string()).describe('List of 2-3 key weaknesses of the competitor.'),
  primaryOffering: z.string().describe('Brief description of their main product/service relevant to the app concept.'),
  estimatedRevenuePotential: z.enum(["Low", "Medium", "High", "Very High", "Uncertain"])
    .describe('A qualitative estimation of the general revenue potential tier for an app like this in the market, not a specific financial figure.'),
  revenuePotentialReasoning: z.string().describe('Brief reasoning for the estimated revenue potential tier, considering monetization strategies typical for such apps (e.g., subscriptions, ads, freemium).'),
  keyDifferentiatorsForUserApp: z.array(z.string()).describe('List 2-3 key ways the user\'s app can differentiate itself from THIS competitor.'),
  uniqueSellingPointsCompared: z.string().describe('A direct comparison highlighting how the user\'s app\'s USPs (if provided) stack up or could be positioned against this competitor. If no user USPs provided, focus on general differentiation points from app concept.'),
});

const SwotAnalysisSchema = z.object({
  strengths: z.array(z.string()).describe('List 2-3 most impactful internal strengths for the user\'s app concept.'),
  weaknesses: z.array(z.string()).describe('List 2-3 most impactful internal weaknesses for the user\'s app concept.'),
  opportunities: z.array(z.string()).describe('List 2-3 most impactful external market opportunities for the user\'s app concept.'),
  threats: z.array(z.string()).describe('List 2-3 most impactful external market threats for the user\'s app concept.'),
});

const MarketSizeAndGrowthSchema = z.object({
    estimation: z.string().describe('Qualitative estimation of the market size (e.g., Niche, Growing, Large, Saturated).'),
    potential: z.string().describe('Brief assessment of growth potential for an app like this.'),
    marketSaturation: z.enum(["Low", "Medium", "High"]).describe('The level of saturation in the current market.'),
    growthRateOutlook: z.enum(["Slow", "Moderate", "Rapid"]).describe('The anticipated growth rate for this market segment.'),
    keyMarketDrivers: z.array(z.string()).describe('List 2-3 key factors driving growth or change in this market.'),
    potentialMarketChallenges: z.array(z.string()).describe('List 2-3 potential challenges or barriers to entry in this market for a new app.'),
    customerAcquisitionChannels: z.array(z.string()).min(1).max(3).describe('Suggest 1-3 common and effective customer acquisition channels for apps in this market/niche.'),
    monetizationOpportunities: z.array(z.string()).min(1).max(3).describe('Suggest 1-3 viable monetization strategies or opportunities common in this market segment.'),
});

const AnalyzeMarketOutputSchema = z.object({
  marketOverview: z.string().describe("A brief overview of the current market state relevant to the app."),
  marketTrends: z.array(TrendSchema).min(2).max(3).describe('Key current market trends (provide 2-3 distinct trends), including their relevance, potential impact magnitude, actionable insight, and example impact.'),
  potentialCompetitors: z.array(CompetitorSchema).min(2).max(3).describe('List of 2-3 key potential competitors, including their estimated revenue potential tier, reasoning, and differentiation points for the user\'s app.'),
  marketSizeAndGrowth: MarketSizeAndGrowthSchema.describe('Assessment of market size, growth potential, saturation, outlook, key drivers, challenges, acquisition channels, and monetization opportunities.'),
  swotAnalysis: SwotAnalysisSchema.describe('SWOT analysis for the user\'s app concept, focusing on the 2-3 most impactful items for each category.'),
  competitiveLandscapeSummary: z.string().describe('A concluding summary of the competitive landscape and the app\'s potential positioning.'),
  strategicRecommendations: z.array(z.string()).min(2).max(3).describe('2-3 actionable strategic recommendations based on the analysis for the user\'s app to succeed.'),
  keySuccessFactors: z.array(z.string()).min(2).max(3).describe('Identify 2-3 critical success factors for a new app entering this market.'),
  potentialPitfalls: z.array(z.string()).min(1).max(3).describe('Highlight 1-3 common pitfalls or mistakes to avoid when launching an app in this space.'),
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
{{#if uniqueSellingPointsInput}}
- User-Provided Unique Selling Points for their App:
{{#each uniqueSellingPointsInput}}
  - {{this}}
{{/each}}
{{/if}}

Based on these details, provide the following analysis. Ensure each section is well-defined and provides actionable insights for the user's app.

1.  **Market Overview**: Briefly summarize the current state of the market relevant to this application.
2.  **Market Trends (2-3 trends)**: Identify and describe key current market trends. For each trend:
    *   Trend title.
    *   Brief description of the trend.
    *   Relevance to {{{appName}}} (High, Medium, Low).
    *   Potential impact magnitude on {{{appName}}} (Significant Positive, Moderate Positive, Neutral, Moderate Negative, Significant Negative).
    *   Actionable insight for {{{appName}}} based on this trend.
    *   A concrete example of how this trend might specifically affect {{{appName}}} (e.g., feature adjustment, marketing angle).
3.  **Potential Competitors (2-3 competitors)**: Identify key potential competitors. For each:
    *   Competitor name.
    *   Their primary offering relevant to {{{appName}}}.
    *   2-3 key strengths.
    *   2-3 key weaknesses.
    *   Estimated revenue potential tier for apps of this nature in the market (Low, Medium, High, Very High, Uncertain). This is a qualitative assessment of general market viability.
    *   Brief reasoning for this revenue potential tier (e.g., based on typical monetization strategies).
    *   2-3 key ways {{{appName}}} can differentiate itself from THIS competitor.
    *   A direct comparison highlighting how {{{appName}}}'s USPs (if provided by user) stack up or could be positioned against this competitor. If no user USPs provided, focus on general differentiation from app concept.
4.  **Market Size and Growth**:
    *   Qualitative estimation of the market size (e.g., Niche, Emerging, Growing, Large, Mature, Saturated).
    *   Brief assessment of growth potential for {{{appName}}}.
    *   Market saturation level (Low, Medium, High).
    *   Anticipated growth rate outlook for this market segment (Slow, Moderate, Rapid).
    *   2-3 key factors driving growth or change in this market.
    *   2-3 potential challenges or barriers to entry in this market for {{{appName}}}.
    *   1-3 common and effective customer acquisition channels for apps in this market/niche.
    *   1-3 viable monetization strategies or opportunities common in this market segment for apps like {{{appName}}}.
5.  **SWOT Analysis (for {{{appName}}})**: Conduct a SWOT analysis for {{{appName}}}. For each category (Strengths, Weaknesses, Opportunities, Threats), list the 2-3 *most impactful* and distinct points.
6.  **Key Success Factors (2-3 factors)**: Identify critical success factors for a new app like {{{appName}}} entering this market.
7.  **Potential Pitfalls (1-3 pitfalls)**: Highlight common pitfalls or mistakes to avoid when launching {{{appName}}} in this space.
8.  **Competitive Landscape Summary**: Write a concise summary of the competitive landscape and {{{appName}}}'s potential positioning.
9.  **Strategic Recommendations (2-3 recommendations)**: Based on your analysis, provide actionable strategic recommendations for {{{appName}}} to succeed.

Strive for insightful, distinct, and relevant information in each section. Avoid generic statements. Ensure all requested structured fields (enums, arrays, counts) are populated correctly.
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
