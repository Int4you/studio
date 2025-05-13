
"use client";

import React, { type ChangeEvent, type FormEvent } from 'react';
import type { Idea } from '@/ai/flows/generate-application-ideas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { FREE_TIER_NAME } from '@/config/plans';

interface IdeaGenerationStepProps {
  prompt: string;
  onPromptChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateIdeas: (event?: FormEvent) => Promise<void>;
  isLoadingIdeas: boolean;
  ideas: Idea[];
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea) => void;
  error: string | null;
  canGenerate: boolean;
  currentUserPlan: string;
}

export default function IdeaGenerationStep({
  prompt,
  onPromptChange,
  onGenerateIdeas,
  isLoadingIdeas,
  ideas,
  selectedIdea,
  onSelectIdea,
  error,
  canGenerate,
  currentUserPlan,
}: IdeaGenerationStepProps) {
  // Determine if the credit limit message should be shown
  // This message is specific to the Free Tier when they cannot generate a new idea
  const showCreditLimitMessage =
    currentUserPlan === FREE_TIER_NAME && // Only for Free Tier
    !canGenerate &&                      // And they cannot generate (canGenerate is false when starting new and credits are out)
    !isLoadingIdeas;                     // And not currently loading

  // Determine the button title
  const buttonTitle =
    currentUserPlan === FREE_TIER_NAME && !canGenerate
      ? "Credit limit reached for Free Tier"
      : "Generate application ideas";

  return (
    <form onSubmit={onGenerateIdeas} className="space-y-4">
      <Label htmlFor="idea-prompt" className="text-sm font-medium">Describe your application idea:</Label>
      <Textarea
        id="idea-prompt"
        placeholder="e.g., 'A mobile app for local community gardening that helps track planting schedules and share harvests.'"
        value={prompt}
        onChange={onPromptChange}
        rows={4}
        className="resize-none text-base rounded-md shadow-sm"
        aria-label="Application idea prompt"
      />
      <Button
        type="submit"
        disabled={isLoadingIdeas || !prompt.trim() || !canGenerate}
        className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow"
        title={buttonTitle}
      >
        {isLoadingIdeas ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generate Ideas
      </Button>
      {showCreditLimitMessage && (
          <p className="text-xs text-destructive mt-1">
              You've reached your credit limit for the Free Tier. Please upgrade for unlimited credits.
          </p>
      )}

      {isLoadingIdeas && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Generating ideas...</p>
        </div>
      )}

      {ideas.length > 0 && !isLoadingIdeas && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold text-foreground/90">Choose an Idea:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea, index) => (
              <Card
                key={index}
                onClick={() => onSelectIdea(idea)}
                className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xl hover:ring-2 hover:ring-primary/50 rounded-lg overflow-hidden ${selectedIdea?.title === idea.title ? 'ring-2 ring-primary shadow-xl border-primary' : 'border-border/50 shadow-md'}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{idea.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{idea.description}</p>
                </CardContent>
                {selectedIdea?.title === idea.title && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full">
                        <Check className="h-3 w-3" />
                    </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
