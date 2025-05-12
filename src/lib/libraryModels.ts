
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
  id: string;
  appName: string;
  ideaTitle: string;
  ideaDescription: string;
  coreFeatures: CoreFeatureData[];
  uiUxGuidelines: UiUxGuidelineData[];
  prioritizedFeatures?: PrioritizedFeatureData[];
  mockupImageUrls?: string[];
  textToAppPrompt?: string;
  referenceImageDataUri?: string | null;
  savedAt: string; // ISO date string
}
