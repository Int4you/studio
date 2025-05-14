
"use client";

import React from 'react';
import type { Idea } from '@/ai/flows/generate-application-ideas';
import type { ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Copy, BadgeHelp, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppStepId } from '../appWorkflowTypes'; // Updated import

interface DeveloperPromptStepProps {
  proposal: ProposalOutput | null;
  selectedIdea: Idea | null;
  textToAppPrompt: string | null;
  isLoadingTextToAppPrompt: boolean;
  onGenerateTextToAppPrompt: () => Promise<void>;
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


const DeveloperPromptStep = React.memo(({
  proposal,
  selectedIdea,
  textToAppPrompt,
  isLoadingTextToAppPrompt,
  onGenerateTextToAppPrompt,
  onNavigateToStep,
}: DeveloperPromptStepProps) => {
  const { toast } = useToast();

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: "Copied to clipboard!", description: "The prompt has been copied." }))
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
      });
  };

  if (!selectedIdea) {
    return <PrerequisiteMessage message="Please complete Step 1 (Idea) first to enable AI Developer Prompt generation." onAction={() => onNavigateToStep('ideas')} buttonText="Go to Spark Idea Step" />;
  }
  if (!proposal) {
     return <PrerequisiteMessage message="Please complete Step 2 (Proposal) first to enable AI Developer Prompt generation." onAction={() => onNavigateToStep('proposal')} buttonText="Go to Craft Proposal Step" />;
  }


  return (
    <>
      {!textToAppPrompt && !isLoadingTextToAppPrompt && (
        <Button onClick={onGenerateTextToAppPrompt} disabled={isLoadingTextToAppPrompt} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow text-sm">
        {isLoadingTextToAppPrompt ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Wand2 className="mr-2 h-4 w-4" />
        )}
        Generate AI Developer Prompt
        </Button>
      )}
      {isLoadingTextToAppPrompt && (
        <div className="flex justify-center items-center py-8 px-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Generating AI Developer Prompt...</p>
        </div>
      )}
      {textToAppPrompt && (
        <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground/90">Your Generated Text-to-App Prompt:</h3>
        <div className="relative">
            <Textarea
            readOnly
            value={textToAppPrompt}
            rows={15}
            className="bg-muted/30 dark:bg-muted/10 resize-y text-sm p-4 pr-12 rounded-md leading-relaxed shadow-inner"
            aria-label="Generated Text-to-App Prompt"
            />
            <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => handleCopyToClipboard(textToAppPrompt)}
            title="Copy to Clipboard"
            >
            <Copy className="h-4 w-4" />
            </Button>
        </div>
        </div>
      )}
    </>
  );
});
DeveloperPromptStep.displayName = 'DeveloperPromptStep';
export default DeveloperPromptStep;
