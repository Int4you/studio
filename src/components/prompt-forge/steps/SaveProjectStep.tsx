
"use client";

import React from 'react';
import type { Idea } from '@/ai/flows/generate-application-ideas';
import type { ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, BadgeHelp, ArrowRight } from 'lucide-react';
import type { AppStepId } from '../appWorkflowTypes';

interface SaveProjectStepProps {
  selectedIdea: Idea | null;
  proposal: ProposalOutput | null;
  currentProjectId: string | null; // To determine if it's an update or new save
  onSaveToLibrary: () => void;
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


const SaveProjectStep = React.memo(({
  selectedIdea,
  proposal,
  currentProjectId,
  onSaveToLibrary,
  onNavigateToStep,
}: SaveProjectStepProps) => {

  if (!selectedIdea || !proposal || !proposal.appName || proposal.appName.trim() === "") {
    return <PrerequisiteMessage 
              message="An idea (from Step 1) and an application name (in Step 2) are required to save your project." 
              onAction={() => onNavigateToStep(selectedIdea && proposal ? 'proposal' : 'ideas')} 
              buttonText={`Go to ${selectedIdea && proposal ? 'Craft Proposal' : 'Spark Idea'} Step`} 
            />;
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
          Your project "{proposal.appName || 'Untitled Project'}" is ready! Save all generated content to your personal library for future access and iteration.
      </p>
      <Button onClick={onSaveToLibrary} variant="outline" className="rounded-md shadow-sm hover:shadow-md transition-shadow text-sm">
          <Save className="mr-2 h-4 w-4" /> {currentProjectId ? "Update Project in Library" : "Save Project to Library"}
      </Button>
    </>
  );
});
SaveProjectStep.displayName = 'SaveProjectStep';
export default SaveProjectStep;
