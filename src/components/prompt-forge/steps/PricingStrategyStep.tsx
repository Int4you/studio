
"use client";

import React from 'react';
import type { Idea } from '@/ai/flows/generate-application-ideas';
import type { ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import type { AnalyzeMarketOutput } from '@/ai/flows/analyze-market-flow';
import type { GeneratePricingStrategyOutput } from '@/ai/flows/generate-pricing-strategy-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Tag, DollarSign, Network, Target, TrendingUp, BadgeHelp, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { AppStepId } from '../appWorkflowTypes'; // Updated import

interface PricingStrategyStepProps {
  proposal: ProposalOutput | null;
  selectedIdea: Idea | null;
  marketAnalysis: AnalyzeMarketOutput | null;
  pricingStrategy: GeneratePricingStrategyOutput | null;
  isLoadingPricingStrategy: boolean;
  onGeneratePricingStrategy: () => Promise<void>;
  onNavigateToStep: (stepId: AppStepId) => void;
}

const PrerequisiteMessage = React.memo(({ message, onAction, buttonText }: { message: string, onAction: () => void, buttonText: string }) => (
    <Card className="border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 p-4 my-4">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-amber-700 dark:text-amber-400 text-base flex items-center gap-2">
          <BadgeHelp className="h-5 w-5" /> Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <p className="text-sm text-amber-600 dark:text-amber-500">{message}</p>
        <Button 
            variant="outline" 
            size="sm" 
            onClick={onAction}
            className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-800/50"
        >
            {buttonText} <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
        </Button>
      </CardContent>
    </Card>
));
PrerequisiteMessage.displayName = 'PrerequisiteMessage';


const PricingStrategyStep = React.memo(({
  proposal,
  selectedIdea,
  marketAnalysis,
  pricingStrategy,
  isLoadingPricingStrategy,
  onGeneratePricingStrategy,
  onNavigateToStep,
}: PricingStrategyStepProps) => {

  if (!selectedIdea) {
    return <PrerequisiteMessage message="Please complete Step 1 (Idea) first to enable Pricing Strategy." onAction={() => onNavigateToStep('ideas')} buttonText="Go to Spark Idea Step" />;
  }
  if (!proposal) {
    return <PrerequisiteMessage message="Please complete Step 2 (Proposal) first to enable Pricing Strategy." onAction={() => onNavigateToStep('proposal')} buttonText="Go to Craft Proposal Step" />;
  }
  if (!marketAnalysis) {
    return <PrerequisiteMessage message="Please complete Step 4 (Market Analysis) first to enable Pricing Strategy." onAction={() => onNavigateToStep('marketAnalysis')} buttonText="Go to Market Analysis Step" />;
  }


  return (
    <>
      {!pricingStrategy && !isLoadingPricingStrategy && (
        <Button onClick={onGeneratePricingStrategy} disabled={isLoadingPricingStrategy} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
        {isLoadingPricingStrategy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Tag className="mr-2 h-4 w-4" />
        )}
        Generate Pricing Strategy (AI)
        </Button>
      )}
      {isLoadingPricingStrategy && (
        <div className="flex justify-center items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Generating pricing strategy...</p>
        </div>
      )}
      {pricingStrategy && (
        <div className="space-y-6">
             <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-xl flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary"/>Overall Strategy Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{pricingStrategy.overallStrategySummary}</p></CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={['model-0']} className="w-full space-y-3">
                {pricingStrategy.recommendedPricingModels.map((model, modelIdx) => (
                    <AccordionItem key={modelIdx} value={`model-${modelIdx}`} className="border rounded-lg overflow-hidden shadow-md">
                        <AccordionTrigger className="p-4 bg-muted/20 dark:bg-muted/10 hover:bg-muted/30 dark:hover:bg-muted/20 hover:no-underline text-lg rounded-t-md data-[state=closed]:rounded-b-md transition-colors">
                            <div className="flex items-center justify-between w-full">
                                <span className="font-semibold text-foreground">{model.modelName}</span>
                                <Badge variant={model.suitabilityScore >= 4 ? "default" : model.suitabilityScore >=3 ? "secondary" : "outline"}>
                                    Suitability: {model.suitabilityScore}/5
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 text-sm space-y-3 border-t bg-background">
                            <p className="text-xs text-primary/90 italic">{model.suitabilityReasoning}</p>
                            <p className="text-muted-foreground">{model.description}</p>
                            
                            <div>
                                <h6 className="font-medium text-sm mb-1 text-green-600 dark:text-green-500">Pros:</h6>
                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-4">
                                    {model.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h6 className="font-medium text-sm mb-1 text-red-600 dark:text-red-500">Cons:</h6>
                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-4">
                                    {model.cons.map((con, i) => <li key={i}>{con}</li>)}
                                </ul>
                            </div>

                            <h6 className="font-medium text-md pt-2 border-t mt-3 text-foreground">Suggested Tiers:</h6>
                            <div className="space-y-3">
                                {model.suggestedTiers.map((tier, tierIdx) => (
                                    <Card key={tierIdx} className="p-3 bg-muted/10 dark:bg-muted/5 border shadow-xs">
                                        <div className="flex justify-between items-center mb-1">
                                            <h6 className="font-semibold text-sm text-primary">{tier.tierName}</h6>
                                            <Badge variant="secondary" size="sm" className="text-xs">{tier.price}</Badge>
                                        </div>
                                        {tier.targetUser && <p className="text-xs text-muted-foreground mb-1">Target: {tier.targetUser}</p>}
                                        <p className="text-xs font-medium mb-0.5">Features:</p>
                                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-3 mb-1.5">
                                            {tier.featuresIncluded.map((feat, i) => <li key={i}>{feat}</li>)}
                                        </ul>
                                        <p className="text-xs text-muted-foreground/80 italic">Justification: {tier.justification}</p>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {pricingStrategy.competitorPricingInsights && (
                <Card className="shadow-sm">
                    <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                        <CardTitle className="text-lg flex items-center gap-2"><Network className="h-4 w-4 text-primary"/>Competitor Pricing Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{pricingStrategy.competitorPricingInsights}</p></CardContent>
                </Card>
            )}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2"><Target className="h-4 w-4 text-primary"/>Value Proposition Focus</CardTitle>
                </CardHeader>
                <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{pricingStrategy.valuePropositionFocus}</p></CardContent>
            </Card>
            {pricingStrategy.dynamicPricingSuggestions && pricingStrategy.dynamicPricingSuggestions.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                        <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/>Dynamic Pricing Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                        {pricingStrategy.dynamicPricingSuggestions.map((sugg, idx) => <li key={idx}>{sugg}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
      )}
    </>
  );
});
PricingStrategyStep.displayName = 'PricingStrategyStep';
export default PricingStrategyStep;
