import { config } from 'dotenv';
config();

import '@/ai/flows/generate-application-ideas.ts';
import '@/ai/flows/generate-detailed-proposal.ts';
// import '@/ai/flows/generate-mockup-flow.ts'; // Removed
import '@/ai/flows/generate-pricing-strategy-flow.ts'; // Added
import '@/ai/flows/generate-text-to-app-prompt.ts';
import '@/ai/flows/generate-more-features.ts';
import '@/ai/flows/generate-feature-prioritization.ts';
import '@/ai/flows/analyze-market-flow.ts';
import '@/ai/flows/generate-roadmap-flow.ts';