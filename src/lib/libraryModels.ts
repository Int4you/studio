
export interface CoreFeatureData {
  feature: string;
  description: string;
}

export interface UiUxGuidelineData {
  category: string;
  guideline: string;
}

export interface SavedProject {
  id: string;
  appName: string;
  ideaTitle: string;
  ideaDescription: string;
  coreFeatures: CoreFeatureData[];
  uiUxGuidelines: UiUxGuidelineData[];
  mockupImageUrls?: string[];
  textToAppPrompt?: string;
  referenceImageDataUri?: string | null;
  savedAt: string; // ISO date string
}
