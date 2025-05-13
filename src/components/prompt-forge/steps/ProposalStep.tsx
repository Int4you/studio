
"use client";

import React, { type ChangeEvent } from 'react';
import type { Idea } from '@/ai/flows/generate-application-ideas';
import type { ProposalOutput, CoreFeature, UiUxGuideline } from '@/ai/flows/generate-detailed-proposal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, ListChecks, Palette, PlusCircle, Pencil, Check, Trash2, Bot, CheckCircle2, BadgeHelp, ArrowRight } from 'lucide-react';
import type { EditingStates, AppStepId } from '../appWorkflowTypes';

interface ProposalStepProps {
  selectedIdea: Idea | null;
  proposal: ProposalOutput | null;
  isLoadingProposal: boolean;
  isLoadingMoreFeatures: boolean;
  editingStates: EditingStates;
  onGenerateProposal: () => Promise<void>;
  onAppNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCoreFeatureChange: (index: number, field: keyof CoreFeature, value: string) => void;
  onAddCoreFeature: () => void;
  onRemoveCoreFeature: (index: number) => void;
  onUiUxGuidelineChange: (index: number, field: keyof UiUxGuideline, value: string) => void;
  onAddUiUxGuideline: () => void;
  onRemoveUiUxGuideline: (index: number) => void;
  onGenerateMoreFeatures: () => Promise<void>;
  onToggleEditState: (section: keyof EditingStates, indexOrValue: number | boolean, value?: boolean) => void;
  currentProjectId: string | null;
  onNavigateToStep: (stepId: AppStepId) => void;
}

const PrerequisiteMessage = ({ message, onAction, buttonText }: { message: string, onAction: () => void, buttonText: string }) => (
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
);


export default function ProposalStep({
  selectedIdea,
  proposal,
  isLoadingProposal,
  isLoadingMoreFeatures,
  editingStates,
  onGenerateProposal,
  onAppNameChange,
  onCoreFeatureChange,
  onAddCoreFeature,
  onRemoveCoreFeature,
  onUiUxGuidelineChange,
  onAddUiUxGuideline,
  onRemoveUiUxGuideline,
  onGenerateMoreFeatures,
  onToggleEditState,
  currentProjectId,
  onNavigateToStep,
}: ProposalStepProps) {

  if (!selectedIdea) {
    return <PrerequisiteMessage message="Please select an idea from Step 1 to generate a proposal." onAction={() => onNavigateToStep('ideas')} buttonText="Go to Spark Idea Step" />;
  }

  return (
    <>
      {!proposal && !isLoadingProposal && (
        <Button onClick={onGenerateProposal} disabled={isLoadingProposal} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Detailed Proposal
        </Button>
      )}
      {isLoadingProposal && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Generating proposal...</p>
        </div>
      )}
      {proposal && (
        <>
          <CardDescription className="flex items-center gap-2 pt-0">
            <CheckCircle2 className="text-green-500 h-5 w-5" /> 
            Selected Idea: <span className="font-semibold text-foreground">{selectedIdea?.title || "N/A"}</span>
            {currentProjectId && <span className="text-xs text-muted-foreground ml-2">(Loaded from Library)</span>}
          </CardDescription>
          
          <Card className="shadow-sm rounded-lg border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                <CardTitle className="text-lg font-semibold">Application Name</CardTitle>
                {!editingStates.appName ? (
                <Button onClick={() => onToggleEditState('appName', true)} variant="ghost" size="icon" aria-label="Edit App Name" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                </Button>
                ) : (
                <Button onClick={() => onToggleEditState('appName', false)} variant="ghost" size="icon" aria-label="Save App Name" className="h-7 w-7 text-muted-foreground hover:text-green-600">
                    <Check className="h-4 w-4 text-green-600" />
                </Button>
                )}
            </CardHeader>
            <CardContent className="px-4 py-4">
                {editingStates.appName ? (
                <Input
                    type="text"
                    value={proposal.appName}
                    onChange={onAppNameChange}
                    placeholder="Enter Application Name"
                    className="text-base rounded-md"
                />
                ) : (
                <p className="text-xl font-semibold text-primary">{proposal.appName || "Not set"}</p>
                )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm rounded-lg border">
            <CardHeader className="px-4 pt-3 pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <ListChecks className="text-primary h-5 w-5" /> Core Features
                </CardTitle>
                <Button onClick={onAddCoreFeature} variant="outline" size="sm" className="rounded-md text-xs shadow-sm hover:shadow">
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Feature
                </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-4">
                {proposal.coreFeatures.map((feature, index) => (
                <Card key={index} className="bg-background p-3 rounded-md shadow-none border">
                    <div className="flex justify-between items-start gap-2">
                    {editingStates.coreFeatures[index] ? (
                        <div className="flex-grow space-y-2">
                        <Label htmlFor={`feature-title-${index}`} className="text-xs font-medium">Title</Label>
                        <Input
                            id={`feature-title-${index}`}
                            value={feature.feature}
                            onChange={(e) => onCoreFeatureChange(index, 'feature', e.target.value)}
                            placeholder="Feature Title"
                            className="text-sm h-8 rounded-md"
                        />
                        <Label htmlFor={`feature-desc-${index}`} className="text-xs font-medium">Description</Label>
                        <Textarea
                            id={`feature-desc-${index}`}
                            value={feature.description}
                            onChange={(e) => onCoreFeatureChange(index, 'description', e.target.value)}
                            placeholder="Feature Description"
                            rows={2}
                            className="text-sm min-h-[40px] rounded-md"
                        />
                        </div>
                    ) : (
                        <div className="flex-grow space-y-0.5">
                        <h4 className="font-medium text-sm text-foreground">{feature.feature || "Untitled Feature"}</h4>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{feature.description || "No description."}</p>
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                        {editingStates.coreFeatures[index] ? (
                        <Button onClick={() => onToggleEditState('coreFeatures', index, false)} variant="ghost" size="icon" aria-label="Save Feature" className="h-7 w-7 text-muted-foreground hover:text-green-600">
                            <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        ) : (
                        <Button onClick={() => onToggleEditState('coreFeatures', index, true)} variant="ghost" size="icon" aria-label="Edit Feature" className="h-7 w-7 text-muted-foreground hover:text-primary">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        )}
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveCoreFeature(index)}
                        aria-label="Remove Feature"
                        disabled={editingStates.coreFeatures[index]}
                        className="text-muted-foreground hover:text-destructive h-7 w-7"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </div>
                </Card>
                ))}
                {proposal.coreFeatures.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No core features added yet.</p>
                )}
            </CardContent>
            <CardFooter className="border-t pt-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-b-lg">
                <Button 
                    onClick={onGenerateMoreFeatures} 
                    variant="outline" 
                    size="sm" 
                    className="rounded-md text-xs shadow-sm hover:shadow"
                    disabled={isLoadingMoreFeatures || !proposal || !selectedIdea}
                >
                    {isLoadingMoreFeatures ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Bot className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Generate More Feature Ideas
                </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-sm rounded-lg border">
            <CardHeader className="px-4 pt-3 pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Palette className="text-primary h-5 w-5" /> UI/UX Guidelines
                </CardTitle>
                <Button onClick={onAddUiUxGuideline} variant="outline" size="sm" className="rounded-md text-xs shadow-sm hover:shadow">
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Guideline
                </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-4">
                {proposal.uiUxGuidelines.map((guideline, index) => (
                <Card key={index} className="bg-background p-3 rounded-md shadow-none border">
                    <div className="flex justify-between items-start gap-2">
                    {editingStates.uiUxGuidelines[index] ? (
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor={`guideline-cat-${index}`} className="text-xs font-medium">Category</Label>
                            <Input
                            id={`guideline-cat-${index}`}
                            value={guideline.category}
                            onChange={(e) => onUiUxGuidelineChange(index, 'category', e.target.value)}
                            placeholder="e.g., Color"
                            className="text-sm h-8 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`guideline-text-${index}`} className="text-xs font-medium">Guideline</Label>
                            <Input
                            id={`guideline-text-${index}`}
                            value={guideline.guideline}
                            onChange={(e) => onUiUxGuidelineChange(index, 'guideline', e.target.value)}
                            placeholder="Guideline Text"
                            className="text-sm h-8 rounded-md"
                            />
                        </div>
                        </div>
                    ) : (
                        <div className="flex-grow space-y-0.5">
                        <h4 className="font-medium text-sm text-foreground">{guideline.category || "Uncategorized"}</h4>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{guideline.guideline || "No guideline text."}</p>
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                        {editingStates.uiUxGuidelines[index] ? (
                        <Button onClick={() => onToggleEditState('uiUxGuidelines', index, false)} variant="ghost" size="icon" aria-label="Save Guideline" className="h-7 w-7 text-muted-foreground hover:text-green-600">
                            <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        ) : (
                        <Button onClick={() => onToggleEditState('uiUxGuidelines', index, true)} variant="ghost" size="icon" aria-label="Edit Guideline" className="h-7 w-7 text-muted-foreground hover:text-primary">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        )}
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveUiUxGuideline(index)}
                        aria-label="Remove Guideline"
                        disabled={editingStates.uiUxGuidelines[index]}
                        className="text-muted-foreground hover:text-destructive h-7 w-7"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </div>
                </Card>
                ))}
                {proposal.uiUxGuidelines.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No UI/UX guidelines added yet.</p>
                )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

