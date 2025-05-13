
import type { Lightbulb, FileText, Search, TrendingUp, Tag, Terminal, Save } from 'lucide-react';

export type AppStepId = 'ideas' | 'proposal' | 'marketAnalysis' | 'prioritization' | 'pricingStrategy' | 'devPrompt' | 'save';

export interface AppStepConfig {
  id: AppStepId;
  title: string;
  icon: React.ElementType; // LucideIcon directly
  description: string;
}

// It's better to import the actual icons where stepsConfig is defined
// For now, this structure is kept, assuming icons are passed correctly.
// Actual icon components (Lightbulb, FileText etc.) will be imported in AppView or where stepsConfig is used.

export interface EditingStates {
  appName: boolean;
  coreFeatures: boolean[];
  uiUxGuidelines: boolean[];
}
