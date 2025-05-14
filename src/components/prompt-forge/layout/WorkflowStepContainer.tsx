
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react'; 

import IdeaGenerationStep from '../steps/IdeaGenerationStep';
import ProposalStep from '../steps/ProposalStep';
import MarketAnalysisStep from '../steps/MarketAnalysisStep';
import PrioritizationStep from '../steps/PrioritizationStep';
import PricingStrategyStep from '../steps/PricingStrategyStep';
import DeveloperPromptStep from '../steps/DeveloperPromptStep';
import SaveProjectStep from '../steps/SaveProjectStep';
import PremiumFeatureMessage from '../PremiumFeatureMessage';

import type { useAppWorkflow } from '@/hooks/useAppWorkflow';
import { stepsConfig, type AppStepId } from '../appWorkflowTypes';
import { PREMIUM_STEP_IDS, FREE_TIER_NAME } from '@/config/plans';

type WorkflowHookReturn = ReturnType<typeof useAppWorkflow>;

interface WorkflowStepContainerProps {
  workflow: WorkflowHookReturn;
}

export default function WorkflowStepContainer({ workflow }: WorkflowStepContainerProps) {
  const {
    prompt,
    ideas,
    selectedIdea,
    proposal,
    marketAnalysis,
    textToAppPrompt,
    prioritizedFeatures,
    pricingStrategy,
    isLoadingIdeas,
    isLoadingProposal,
    isLoadingMarketAnalysis,
    isLoadingTextToAppPrompt,
    isLoadingMoreFeatures,
    isLoadingPrioritization,
    isLoadingPricingStrategy,
    error,
    currentProjectId,
    currentStep,
    editingStates,
    currentUserPlan, 
    handlePromptChange,
    handleGenerateIdeas,
    handleSelectIdea,
    handleGenerateProposal,
    handleAppNameChange,
    handleCoreFeatureChange,
    addCoreFeature,
    removeCoreFeature,
    handleUiUxGuidelineChange,
    addUiUxGuideline,
    removeUiUxGuideline,
    handleGenerateMoreFeatures,
    handleGenerateMarketAnalysis,
    handleGenerateFeaturePrioritization,
    handleGeneratePricingStrategy,
    handleGenerateTextToAppPrompt,
    handleSaveToLibrary,
    toggleEditState,
    handleRemovePrioritizedFeature,
    isStepCompleted,
    navigateToStep,
    handleNextStep,
    canStartNewProject, 
    setShowUpgradeModal,
  } = workflow;

  const currentStepDetails = stepsConfig.find(s => s.id === currentStep);

  const isCurrentStepPremiumAndLocked = 
    currentStepDetails && 
    PREMIUM_STEP_IDS.includes(currentStepDetails.id) &&
    currentUserPlan === FREE_TIER_NAME &&
    !isStepCompleted(currentStepDetails.id);

  const nextStepIndex = stepsConfig.findIndex(s => s.id === currentStep) + 1;
  const nextStep = nextStepIndex < stepsConfig.length ? stepsConfig[nextStepIndex] : null;
  const previousStepIndex = stepsConfig.findIndex(s => s.id === currentStep) - 1;
  const previousStep = previousStepIndex >= 0 ? stepsConfig[previousStepIndex] : null;
  
  const isNextButtonDisabled = () => {
    if (currentStep === 'ideas' && !selectedIdea) return true;
    if (currentStep === 'proposal' && (!proposal || !proposal.appName.trim())) return true;
    if (currentStep === 'prioritization' && !prioritizedFeatures) return true;
    if (currentStep === 'marketAnalysis' && !marketAnalysis) return true;
    if (currentStep === 'pricingStrategy' && !pricingStrategy) return true;
    if (currentStep === 'devPrompt' && !textToAppPrompt) return true;
    return false;
  };


  return (
    <Card className="shadow-xl border rounded-xl overflow-hidden flex flex-col h-full">
        <CardHeader className="bg-muted/30 dark:bg-muted/10 border-b">
            <div className="flex items-center gap-3">
                {currentStepDetails?.icon && React.createElement(currentStepDetails.icon, { className: "h-7 w-7 text-primary" })}
                <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">{currentStepDetails?.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{currentStepDetails?.description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6 flex-grow overflow-y-auto min-h-[calc(100vh-24rem)] md:min-h-[calc(100vh-18rem)]">
        {isCurrentStepPremiumAndLocked ? (
            <PremiumFeatureMessage featureName={currentStepDetails?.title} />
        ) : (
          <>
            {currentStep === 'ideas' && (
                <IdeaGenerationStep
                prompt={prompt}
                onPromptChange={handlePromptChange}
                onGenerateIdeas={handleGenerateIdeas}
                isLoadingIdeas={isLoadingIdeas}
                ideas={ideas}
                selectedIdea={selectedIdea}
                onSelectIdea={handleSelectIdea}
                error={error}
                canGenerate={canStartNewProject || selectedIdea != null || currentProjectId != null}
                currentUserPlan={currentUserPlan}
                />
            )}
            {currentStep === 'proposal' && (
                <ProposalStep
                selectedIdea={selectedIdea}
                proposal={proposal}
                isLoadingProposal={isLoadingProposal}
                isLoadingMoreFeatures={isLoadingMoreFeatures}
                editingStates={editingStates}
                onGenerateProposal={handleGenerateProposal}
                onAppNameChange={handleAppNameChange}
                onCoreFeatureChange={handleCoreFeatureChange}
                onAddCoreFeature={addCoreFeature}
                onRemoveCoreFeature={removeCoreFeature}
                onUiUxGuidelineChange={handleUiUxGuidelineChange}
                onAddUiUxGuideline={addUiUxGuideline}
                onRemoveUiUxGuideline={removeUiUxGuideline}
                onGenerateMoreFeatures={handleGenerateMoreFeatures}
                onToggleEditState={toggleEditState}
                currentProjectId={currentProjectId}
                onNavigateToStep={navigateToStep}
                />
            )}
             {currentStep === 'prioritization' && (
                <PrioritizationStep
                proposal={proposal}
                selectedIdea={selectedIdea}
                prioritizedFeatures={prioritizedFeatures}
                isLoadingPrioritization={isLoadingPrioritization}
                onGenerateFeaturePrioritization={handleGenerateFeaturePrioritization}
                onRemovePrioritizedFeature={handleRemovePrioritizedFeature}
                onNavigateToStep={navigateToStep}
                />
            )}
            {currentStep === 'marketAnalysis' && (
                <MarketAnalysisStep
                proposal={proposal}
                selectedIdea={selectedIdea}
                marketAnalysis={marketAnalysis}
                isLoadingMarketAnalysis={isLoadingMarketAnalysis}
                onGenerateMarketAnalysis={handleGenerateMarketAnalysis}
                onNavigateToStep={navigateToStep}
                />
            )}
            {currentStep === 'pricingStrategy' && (
                <PricingStrategyStep
                    proposal={proposal}
                    selectedIdea={selectedIdea}
                    marketAnalysis={marketAnalysis}
                    pricingStrategy={pricingStrategy}
                    isLoadingPricingStrategy={isLoadingPricingStrategy}
                    onGeneratePricingStrategy={handleGeneratePricingStrategy}
                    onNavigateToStep={navigateToStep}
                />
            )}
            {currentStep === 'devPrompt' && (
                <DeveloperPromptStep
                    proposal={proposal}
                    selectedIdea={selectedIdea}
                    textToAppPrompt={textToAppPrompt}
                    isLoadingTextToAppPrompt={isLoadingTextToAppPrompt}
                    onGenerateTextToAppPrompt={handleGenerateTextToAppPrompt}
                    onNavigateToStep={navigateToStep}
                />
            )}
            {currentStep === 'save' && (
                <SaveProjectStep
                    selectedIdea={selectedIdea}
                    proposal={proposal}
                    currentProjectId={currentProjectId}
                    onSaveToLibrary={handleSaveToLibrary}
                    onNavigateToStep={navigateToStep}
                />
            )}
          </>
        )}
        </CardContent>
        <CardFooter className="border-t p-4 bg-muted/50 dark:bg-muted/20">
            <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2 sm:gap-4">
                {previousStep && (
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            // No need to check for premium on previous steps as they must have been completed or are free
                            navigateToStep(previousStep.id);
                        }}
                        className="w-full sm:w-auto rounded-md shadow-sm hover:shadow-md transition-shadow text-xs sm:text-sm"
                    >
                        <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Previous: {previousStep.title}
                    </Button>
                )}
                 {/* Spacer div to push Next button to the right if Previous button is not shown */}
                {!previousStep && <div className="sm:w-auto"></div>}

                 {nextStep && (
                    <Button 
                        onClick={() => {
                            if (PREMIUM_STEP_IDS.includes(nextStep.id) && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(nextStep.id)) {
                                setShowUpgradeModal(true);
                            } else {
                                handleNextStep();
                            }
                        }}
                        className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow text-xs sm:text-sm"
                        disabled={isNextButtonDisabled()}
                    >
                        Next: {nextStep.title} <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                )}
            </div>
        </CardFooter>
    </Card>
  );
}

