
import { Lightbulb, FileText, Search, TrendingUp, Tag, Terminal, Save } from 'lucide-react';
import type { Icon as LucideIcon } from 'lucide-react';

export type AppStepId = 'ideas' | 'proposal' | 'prioritization' | 'marketAnalysis' | 'pricingStrategy' | 'devPrompt' | 'save';

export interface AppStepConfig {
  id: AppStepId;
  title: string;
  icon: LucideIcon; 
  description: string;
}

export const stepsConfig: AppStepConfig[] = [
  { id: 'ideas', title: "Spark Idea", icon: Lightbulb, description: "Describe your app idea to get started." },
  { id: 'proposal', title: "Craft Proposal", icon: FileText, description: "Develop a detailed proposal with core features & UI/UX." },
  { id: 'prioritization', title: "Prioritize Features", icon: TrendingUp, description: "Rank features by impact and effort for your MVP." },
  { id: 'marketAnalysis', title: "Analyze Market", icon: Search, description: "Understand market trends, competitors, and opportunities." },
  { id: 'pricingStrategy', title: "Pricing Strategy", icon: Tag, description: "Get AI recommendations for pricing models and tiers." },
  { id: 'devPrompt', title: "AI Developer Prompt", icon: Terminal, description: "Create a prompt for Text-to-App code generation." },
  { id: 'save', title: "Save Project", icon: Save, description: "Save your complete project to the library." },
];


export interface EditingStates {
  appName: boolean;
  coreFeatures: boolean[];
  uiUxGuidelines: boolean[];
}

    