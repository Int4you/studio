'use server';
/**
 * @fileOverview Generates AI-driven pricing strategy recommendations for an application.
 *
 * - generatePricingStrategy - A function that generates pricing strategy recommendations.
 * - GeneratePricingStrategyInput - The input type for the function.
 * - GeneratePricingStrategyOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CoreFeatureData } from '@/lib/libraryModels'; // Assuming CoreFeatureData is defined here
import type { AnalyzeMarketOutput } from '@/ai/flows/analyze-market-flow'; // Assuming this type exists

const CoreFeatureSchema = z.object({
  feature: z.string().describe('The title of the core feature.'),
  description: z.string().describe('A short description of the core feature.'),
});

const MarketAnalysisSummarySchema = z.object({
  marketOverview: z.string().optional().describe("Brief overview of the current market state relevant to the app."),
  potentialCompetitors: z.array(z.object({
    name: z.string().describe('Name of the competitor.'),
    primaryOffering: z.string().optional().describe('Their main product/service relevant to the app concept.'),
    estimatedRevenuePotential: z.enum(["Low", "Medium", "High", "Very High", "Uncertain"]).optional()
      .describe('Estimated revenue potential tier for similar apps.'),
  })).optional().describe('List of key potential competitors.'),
  marketSizeAndGrowth: z.object({
      estimation: z.string().optional().describe('Qualitative estimation of the market size.'),
      potential: z.string().optional().describe('Brief assessment of growth potential.'),
      marketSaturation: z.enum(["Low", "Medium", "High"]).optional().describe('The level of saturation in the current market.'),
  }).optional().describe('Assessment of market size and growth.'),
  swotAnalysis: z.object({
    opportunities: z.array(z.string()).optional().describe('External market opportunities.'),
    threats: z.array(z.string()).optional().describe('External market threats.'),
  }).optional().describe('SWOT analysis focusing on opportunities and threats.'),
  competitiveLandscapeSummary: z.string().optional().describe('Concluding summary of the competitive landscape.')
}).optional().describe('A summary of the market analysis findings, focusing on competition, market size, and SWOT.');


const GeneratePricingStrategyInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appDescription: z.string().describe('A detailed description of the application and its purpose.'),
  coreFeatures: z.array(CoreFeatureSchema).describe('The list of core features of the application.'),
  targetAudience: z.string().optional().describe('A description of the target audience for the application.'),
  marketAnalysisSummary: MarketAnalysisSummarySchema.nullable().describe('Key insights from market analysis, including competitor pricing if known, market size, and demand signals. Can be null if not available.'),
  monetizationGoals: z.string().optional().describe('Primary goals for monetization (e.g., "Maximize short-term revenue", "Rapid user acquisition and scale", "Sustainable long-term profit", "Market penetration").'),
  uniqueSellingPoints: z.array(z.string()).optional().describe('What makes this app stand out from potential competitors?'),
});
export type GeneratePricingStrategyInput = z.infer<typeof GeneratePricingStrategyInputSchema>;

const PricingTierSchema = z.object({
  tierName: z.string().describe('Name of the pricing tier (e.g., "Basic", "Pro", "Enterprise", "Free Tier").'),
  price: z.string().describe('Suggested price for the tier (e.g., "$9.99/month", "Free", "$99 one-time"). Include currency and frequency if applicable.'),
  featuresIncluded: z.array(z.string()).describe('List of key features or benefits included in this tier. Should clearly differentiate from other tiers.'),
  targetUser: z.string().optional().describe('The ideal user segment for this tier (e.g. "Individual users", "Small teams", "Large organizations").'),
  justification: z.string().describe('Brief reasoning for this tier\'s pricing and feature set in relation to value provided and monetization goals.'),
});

const PricingModelSchema = z.object({
  modelName: z.string().describe('Name of the pricing model (e.g., "Subscription", "Freemium", "One-time Purchase", "Usage-based Billing", "Tiered Subscription").'),
  description: z.string().describe('Brief explanation of how this pricing model works.'),
  pros: z.array(z.string()).describe('Advantages of using this model for the application.'),
  cons: z.array(z.string()).describe('Potential disadvantages or challenges of this model.'),
  suggestedTiers: z.array(PricingTierSchema).min(1).describe('At least one, ideally 2-3, detailed pricing tiers for this model.'),
  suitabilityScore: z.number().min(1).max(5).describe('A score from 1 (Least Suitable) to 5 (Most Suitable) indicating how well this model fits the app and its goals.'),
  suitabilityReasoning: z.string().describe('Justification for the suitability score, linking back to app details, market, and goals.'),
});

const GeneratePricingStrategyOutputSchema = z.object({
  recommendedPricingModels: z.array(PricingModelSchema).min(1).max(3).describe('A list of 1 to 3 recommended pricing models, detailed with tiers, pros, cons, and suitability.'),
  competitorPricingInsights: z.string().optional().describe('Summary of how similar applications are typically priced, based on general market knowledge if specific competitor data is not available from input.'),
  valuePropositionFocus: z.string().describe('Key value propositions of the app that should be emphasized to justify its pricing.'),
  dynamicPricingSuggestions: z.array(z.string()).optional().describe('Ideas for adapting pricing over time or for different segments (e.g., promotional offers, regional pricing, volume discounts). Provide 1-2 suggestions if applicable.'),
  overallStrategySummary: z.string().describe('A concluding summary of the recommended pricing approach and key considerations.'),
});
export type GeneratePricingStrategyOutput = z.infer<typeof GeneratePricingStrategyOutputSchema>;

export async function generatePricingStrategy(input: GeneratePricingStrategyInput): Promise<GeneratePricingStrategyOutput> {
  return generatePricingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePricingStrategyPrompt',
  input: {schema: GeneratePricingStrategyInputSchema},
  output: {schema: GeneratePricingStrategyOutputSchema},
  prompt: `You are an expert Pricing Strategist and Business Consultant specializing in digital products and SaaS applications.
Your task is to analyze the provided application details and generate comprehensive pricing strategy recommendations.

Application Details:
- Name: {{{appName}}}
- Description: {{{appDescription}}}
- Core Features:
{{#each coreFeatures}}
  - {{this.feature}}: {{this.description}}
{{/each}}
{{#if targetAudience}}
- Target Audience: {{{targetAudience}}}
{{/if}}
{{#if monetizationGoals}}
- Monetization Goals: {{{monetizationGoals}}}
{{/if}}
{{#if uniqueSellingPoints}}
- Unique Selling Points:
{{#each uniqueSellingPoints}}
  - {{this}}
{{/each}}
{{/if}}

{{#if marketAnalysisSummary}}
Market Analysis Summary:
  {{#if marketAnalysisSummary.marketOverview}}Market Overview: {{marketAnalysisSummary.marketOverview}}{{/if}}
  {{#if marketAnalysisSummary.competitiveLandscapeSummary}}Competitive Landscape: {{marketAnalysisSummary.competitiveLandscapeSummary}}{{/if}}
  {{#if marketAnalysisSummary.marketSizeAndGrowth}}Market Size & Growth: Estimation: {{marketAnalysisSummary.marketSizeAndGrowth.estimation}}, Potential: {{marketAnalysisSummary.marketSizeAndGrowth.potential}}, Saturation: {{marketAnalysisSummary.marketSizeAndGrowth.marketSaturation}}.{{/if}}
  {{#if marketAnalysisSummary.potentialCompetitors}}
  Potential Competitors Overview:
  {{#each marketAnalysisSummary.potentialCompetitors}}
    - {{this.name}}: Offering: {{this.primaryOffering}}, Est. Revenue Tier: {{this.estimatedRevenuePotential}}
  {{/each}}
  {{/if}}
  {{#if marketAnalysisSummary.swotAnalysis}}
  SWOT Insights:
  Opportunities:
  {{#if marketAnalysisSummary.swotAnalysis.opportunities}}
  {{#each marketAnalysisSummary.swotAnalysis.opportunities}}
    - {{this}}
  {{/each}}
  {{else}}
    N/A
  {{/if}}
  Threats:
  {{#if marketAnalysisSummary.swotAnalysis.threats}}
  {{#each marketAnalysisSummary.swotAnalysis.threats}}
    - {{this}}
  {{/each}}
  {{else}}
    N/A
  {{/if}}
  {{/if}}
{{else}}
(No detailed market analysis summary provided. Rely on general market knowledge for similar apps.)
{{/if}}

Based on these details, provide the following:

1.  **Recommended Pricing Models (1-3 models)**:
    *   For each model, provide:
        *   \\\`modelName\\\`: (e.g., "Subscription", "Freemium", "One-time Purchase", "Usage-based", "Tiered Subscription").
        *   \\\`description\\\`: Brief explanation of the model.
        *   \\\`pros\\\`: Advantages for this app.
        *   \\\`cons\\\`: Disadvantages for this app.
        *   \\\`suggestedTiers\\\` (1-3 tiers per model):
            *   \\\`tierName\\\`: (e.g., "Free", "Basic", "Pro", "Premium").
            *   \\\`price\\\`: (e.g., "$0", "$9.99/month", "$299 one-time"). Specify currency and period.
            *   \\\`featuresIncluded\\\`: Key features differentiating this tier. Align features with perceived value.
            *   \\\`targetUser\\\`: Ideal user for this tier.
            *   \\\`justification\\\`: Why this tier is structured this way.
        *   \\\`suitabilityScore\\\` (1-5): How suitable this model is (1=Least, 5=Most).
        *   \\\`suitabilityReasoning\\\`: Justify the score.

2.  **Competitor Pricing Insights**:
    *   Briefly summarize typical pricing strategies or common price points for similar apps in the market. If specific competitor data was provided in the market analysis summary, incorporate it. Otherwise, use general knowledge.

3.  **Value Proposition Focus**:
    *   Identify the key value propositions of "{{appName}}" that should be highlighted to justify its pricing effectively to the target audience. Link these to core features and unique selling points.

4.  **Dynamic Pricing Suggestions (Optional, 1-2 suggestions)**:
    *   Suggest 1-2 ideas for adapting pricing over time or for different user segments, if applicable (e.g., introductory offers, regional pricing adjustments, A/B testing price points, volume discounts for teams).

5.  **Overall Strategy Summary**:
    *   Conclude with a concise summary of the recommended pricing approach, highlighting the most promising model(s) and key considerations for implementation.

Ensure your recommendations are actionable, well-reasoned, and tailored to the application's context, features, target audience, monetization goals, and (if available) market insights.
If monetization goals are not provided, assume a balanced approach of user growth and revenue generation.
Strive for diverse and creative yet practical pricing models.
`,
});

const generatePricingStrategyFlow = ai.defineFlow(
  {
    name: 'generatePricingStrategyFlow',
    inputSchema: GeneratePricingStrategyInputSchema,
    outputSchema: GeneratePricingStrategyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Pricing strategy generation failed or returned no output.');
    }
    // Ensure at least one model is recommended, and each model has at least one tier
    if (output.recommendedPricingModels.length === 0) {
        throw new Error('AI did not recommend any pricing models.');
    }
    output.recommendedPricingModels.forEach(model => {
        if (model.suggestedTiers.length === 0) {
            throw new Error(`Pricing model "${model.modelName}" has no suggested tiers.`);
        }
    });
    return output;
  }
);

