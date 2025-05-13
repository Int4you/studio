
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { CheckCircle2, RefreshCw, ArrowRight, Star as StarIcon } from 'lucide-react'; // Renamed Star to StarIcon

import IdeaGenerationStep from './steps/IdeaGenerationStep';
import ProposalStep from './steps/ProposalStep';
import MarketAnalysisStep from './steps/MarketAnalysisStep';
import PrioritizationStep from './steps/PrioritizationStep';
import PricingStrategyStep from './steps/PricingStrategyStep';
import DeveloperPromptStep from './steps/DeveloperPromptStep';
import SaveProjectStep from './steps/SaveProjectStep';
import UpgradeModal from './UpgradeModal';
import PremiumFeatureMessage from './PremiumFeatureMessage';


import type { SavedProject } from '@/lib/libraryModels';
import { useAppWorkflow } from '@/hooks/useAppWorkflow';
import type { AppStepId } from './appWorkflowTypes';
import { stepsConfig } from './appWorkflowTypes';
import { FREE_TIER_NAME, MAX_FREE_GENERATIONS, PREMIUM_STEP_IDS } from '@/config/plans';


interface AppViewProps {
  initialProject: SavedProject | null;
  onProjectSave: (project: SavedProject, plan: string) => boolean;
  clearInitialProject: () => void;
  currentUserPlan: string;
  generationsUsed: number;
  maxFreeGenerations: number;
  onGenerationUsed: () => void;
}

export default function AppView({ 
    initialProject, 
    onProjectSave, 
    clearInitialProject,
    currentUserPlan,
    generationsUsed,
    maxFreeGenerations,
    onGenerationUsed 
}: AppViewProps) {
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
    showUpgradeModal,
    setShowUpgradeModal,
    editingStates,
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
    resetAppCreationState,
  } = useAppWorkflow({ 
    initialProject, 
    onProjectSave, 
    clearInitialProject,
    currentUserPlan,
    generationsUsed,
    maxFreeGenerations,
    onGenerationUsed
  });

  const currentStepDetails = stepsConfig.find(s => s.id === currentStep);
  const canStartNewProject = !(currentUserPlan === FREE_TIER_NAME && generationsUsed >= MAX_FREE_GENERATIONS);

  const isCurrentStepPremiumAndLocked = 
    PREMIUM_STEP_IDS.includes(currentStep) &&
    currentUserPlan === FREE_TIER_NAME &&
    !isStepCompleted(currentStep);


  return (
    <div className="flex flex-col md:flex-row gap-8">
      <nav className="hidden md:block w-full md:w-64 lg:w-72 shrink-0">
        <div className="sticky top-20 space-y-2">
            <Button 
                onClick={() => resetAppCreationState(true)} 
                variant="outline" 
                size="sm" 
                className="w-full mb-4"
                disabled={!canStartNewProject && !currentProjectId && !selectedIdea} 
                title={!canStartNewProject && !currentProjectId && !selectedIdea ? "Free Tier generation limit reached" : "Start a new project"}
            >
                <RefreshCw className="mr-2 h-4 w-4" /> Start New Project
            </Button>
          {stepsConfig.map((step) => {
            const isPremium = PREMIUM_STEP_IDS.includes(step.id);
            const isLockedForFreeUser = isPremium && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(step.id);

            return (
              <Button
                key={step.id}
                variant={currentStep === step.id ? 'default' : 'ghost'}
                className={cn(
                    "w-full justify-start text-left px-3 py-2 h-auto flex items-center",
                    currentStep === step.id && "shadow-md",
                    isLockedForFreeUser && "opacity-70 cursor-not-allowed hover:bg-transparent"
                )}
                onClick={() => navigateToStep(step.id)}
                title={isLockedForFreeUser ? `${step.title} is a Premium feature.` : step.description}
              >
                <step.icon className={cn("mr-3 h-5 w-5", currentStep === step.id ? "text-primary-foreground" : "text-primary")} />
                <div className="flex-grow">
                  <span className="font-medium">{step.title}</span>
                  {isStepCompleted(step.id) && currentStep !== step.id && (
                      <CheckCircle2 className="ml-2 inline-block h-4 w-4 text-green-500" />
                  )}
                </div>
                {isPremium && <StarIcon className="ml-auto h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="md:hidden mb-6">
          <Button 
            onClick={() => resetAppCreationState(true)} 
            variant="outline" 
            size="sm" 
            className="w-full mb-4"
            disabled={!canStartNewProject && !currentProjectId && !selectedIdea}
            title={!canStartNewProject && !currentProjectId && !selectedIdea ? "Free Tier generation limit reached" : "Start a new project"}
          >
              <RefreshCw className="mr-2 h-4 w-4" /> Start New Project
          </Button>
          <select 
              value={currentStep} 
              onChange={(e) => navigateToStep(e.target.value as AppStepId)}
              className="w-full p-3 border border-input rounded-md bg-background text-foreground shadow-sm"
          >
              {stepsConfig.map(step => {
                const isPremium = PREMIUM_STEP_IDS.includes(step.id);
                const isLockedForFreeUser = isPremium && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(step.id);
                return (
                  <option key={step.id} value={step.id} disabled={isLockedForFreeUser}>
                      {step.title} 
                      {isStepCompleted(step.id) ? ' ✔' : ''}
                      {isPremium ? ' (Premium)' : ''}
                  </option>
                );
              })}
          </select>
      </div>

      <div className="flex-1 min-w-0">
        <Card className="shadow-xl border rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 dark:bg-muted/10 border-b">
                <div className="flex items-center gap-3">
                    {currentStepDetails?.icon && React.createElement(currentStepDetails.icon, { className: "h-7 w-7 text-primary" })}
                    <div>
                        <CardTitle className="text-2xl font-bold">{currentStepDetails?.title}</CardTitle>
                        <CardDescription className="text-sm">{currentStepDetails?.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
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
                <div className="flex justify-end w-full">
                    {currentStep !== 'ideas' && (
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                const currentIndex = stepsConfig.findIndex(s => s.id === currentStep);
                                if (currentIndex > 0) {
                                    navigateToStep(stepsConfig[currentIndex - 1].id);
                                }
                            }}
                            className="mr-auto rounded-md shadow-sm hover:shadow-md transition-shadow"
                        >
                            Previous Step
                        </Button>
                    )}
                    {currentStep !== 'save' && ( 
                        <Button 
                            onClick={handleNextStep}
                            className="rounded-md shadow-md hover:shadow-lg transition-shadow"
                        >
                            Next: {stepsConfig[stepsConfig.findIndex(s => s.id === currentStep) + 1]?.title || 'Finish'} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
