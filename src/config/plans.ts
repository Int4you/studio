
export const FREE_TIER_NAME = "Free Tier";
export const PREMIUM_CREATOR_NAME = "Premium Creator";
export const MAX_FREE_GENERATIONS = 3;
export const MAX_FREE_TIER_PROJECTS_IN_LIBRARY = 1;

export const freePlanUIDetails = {
  name: FREE_TIER_NAME,
  features: [
    `${MAX_FREE_GENERATIONS} Project Generations (full workflow)`,
    'Access to basic AI features (Idea, Proposal, Prioritization)',
    'Standard support',
    `Save up to ${MAX_FREE_TIER_PROJECTS_IN_LIBRARY} project in library`,
  ],
};

export const premiumPlanUIDetails = {
    name: PREMIUM_CREATOR_NAME,
    price: "$4.99",
    frequency: "/ month",
    description: 'Unlock the full power of PromptForge for unlimited creativity.',
    features: [
      'Unlimited Project Generations',
      'Access to all core AI features, including premium ones (Market Analysis, Pricing Strategy, AI Dev Prompt)',
      'Priority support',
      'Save unlimited projects in library',
      'Early access to new features',
    ]
};

// Define which steps are considered premium
export const PREMIUM_STEP_IDS: ReadonlyArray<string> = ['marketAnalysis', 'pricingStrategy', 'devPrompt'];
