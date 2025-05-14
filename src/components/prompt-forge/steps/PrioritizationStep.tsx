
"use client";

import React from 'react';
import type { Idea } from '@/ai/flows/generate-application-ideas';
import type { ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import type { PrioritizedFeature } from '@/ai/flows/generate-feature-prioritization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Wand2, Info, Trash2, BadgeHelp, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AppStepId } from '../appWorkflowTypes';

interface PrioritizationStepProps {
  proposal: ProposalOutput | null;
  selectedIdea: Idea | null;
  prioritizedFeatures: PrioritizedFeature[] | null;
  isLoadingPrioritization: boolean;
  onGenerateFeaturePrioritization: () => Promise<void>;
  onRemovePrioritizedFeature: (featureTitle: string) => void;
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


const getPriorityBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return "default"; 
    if (score >= 5) return "secondary"; 
    return "destructive"; 
};

const getImpactEffortBadgeVariant = (level?: "High" | "Medium" | "Low"): "default" | "secondary" | "outline" => {
    if (level === "High") return "default";
    if (level === "Medium") return "secondary";
    if (level === "Low") return "outline";
    return "outline"; 
};

const PrioritizationStep = React.memo(({
  proposal,
  selectedIdea,
  prioritizedFeatures,
  isLoadingPrioritization,
  onGenerateFeaturePrioritization,
  onRemovePrioritizedFeature,
  onNavigateToStep,
}: PrioritizationStepProps) => {
  
  const noFeaturesInProposal = proposal && proposal.coreFeatures.length === 0;

  if (!proposal || !selectedIdea || noFeaturesInProposal) {
    const message = !selectedIdea 
        ? "Please complete Step 1 (Idea) first." 
        : !proposal || noFeaturesInProposal
        ? "Please ensure Step 2 (Proposal) has core features before prioritizing."
        : "Prerequisites missing.";
    const targetStep = !selectedIdea ? 'ideas' : 'proposal';
    const buttonText = `Go to ${targetStep === 'ideas' ? 'Spark Idea' : 'Craft Proposal'} Step`;
    return <PrerequisiteMessage message={message} onAction={() => onNavigateToStep(targetStep)} buttonText={buttonText} />;
  }
  

  return (
    <>
      {!prioritizedFeatures && !isLoadingPrioritization && (
        <Button 
            onClick={onGenerateFeaturePrioritization}
            disabled={isLoadingPrioritization}
            className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow"
        >
            {isLoadingPrioritization ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wand2 className="mr-2 h-4 w-4" />
            )}
            Prioritize Features (AI)
        </Button>
      )}
      {isLoadingPrioritization && (
        <div className="flex justify-center items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Prioritizing features...</p>
        </div>
      )}
      {prioritizedFeatures && prioritizedFeatures.length > 0 && (
        <div className="space-y-4">
          <TooltipProvider>
            {prioritizedFeatures.map((pFeature, index) => (
            <Card key={index} className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-foreground">{pFeature.feature}</h4>
                    <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(pFeature.priorityScore)} className="text-sm">
                            Priority: {pFeature.priorityScore}/10
                        </Badge>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onRemovePrioritizedFeature(pFeature.feature)}
                                    aria-label={`Remove ${pFeature.feature}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Remove Feature</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{pFeature.description}</p>
                <div className="text-xs space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">Impact:</span>
                    <Badge variant={getImpactEffortBadgeVariant(pFeature.estimatedImpact)} size="sm">{pFeature.estimatedImpact}</Badge>
                    <span className="font-medium sm:ml-2">Effort:</span>
                    <Badge variant={getImpactEffortBadgeVariant(pFeature.estimatedEffort)} size="sm">{pFeature.estimatedEffort}</Badge>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 cursor-help text-primary/70" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <p>{pFeature.reasoning}</p>
                    </TooltipContent>
                    </Tooltip>
                    <span className="italic flex-1">{pFeature.reasoning}</span>
                </div>
                </div>
            </Card>
            ))}
          </TooltipProvider>
        </div>
      )}
      {prioritizedFeatures && prioritizedFeatures.length === 0 && !isLoadingPrioritization && (
          <p className="text-sm text-muted-foreground">
            No features available for prioritization, or all previously prioritized features were removed. 
            {proposal && proposal.coreFeatures.length > 0 ? " You can try generating prioritization again." : " Please add features in Step 2 (Proposal)."}
          </p>
      )}
    </>
  );
});
PrioritizationStep.displayName = 'PrioritizationStep';
export default PrioritizationStep;
