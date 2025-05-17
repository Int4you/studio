
import type { AnalyzeMarketOutput } from "@/ai/flows/analyze-market-flow";
import type { GeneratePricingStrategyOutput } from "@/ai/flows/generate-pricing-strategy-flow";

export interface CoreFeatureData {
  feature: string;
  description: string;
}

export interface UiUxGuidelineData {
  category: string;
  guideline: string;
}

export interface PrioritizedFeatureData {
  feature: string;
  description: string;
  priorityScore: number;
  reasoning: string;
  estimatedImpact: "High" | "Medium" | "Low";
  estimatedEffort: "High" | "Medium" | "Low";
}

export interface SavedProject {
  id: string; // Document ID in Firestore
  userId?: string; // UID of the Firebase authenticated user who owns this project
  appName: string;
  ideaTitle: string;
  ideaDescription: string;
  coreFeatures: CoreFeatureData[];
  uiUxGuidelines: UiUxGuidelineData[];
  marketAnalysis?: AnalyzeMarketOutput; 
  prioritizedFeatures?: PrioritizedFeatureData[];
  pricingStrategy?: GeneratePricingStrategyOutput;
  textToAppPrompt?: string;
  savedAt: string; // ISO date string for client-side, Firestore Timestamp for storage
  originalPrompt?: string; 
}
