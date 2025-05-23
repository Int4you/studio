
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react'; 

import WorkflowSidebarNav from './layout/WorkflowSidebarNav';
import WorkflowMobileNav from './layout/WorkflowMobileNav';
import WorkflowStepContainer from './layout/WorkflowStepContainer';
import UpgradeModal from './UpgradeModal';

import type { SavedProject } from '@/lib/libraryModels';
import { useAppWorkflow } from '@/hooks/useAppWorkflow';
import type { AppStepId } from './appWorkflowTypes';
import { stepsConfig } from './appWorkflowTypes';
import { FREE_TIER_NAME, MAX_FREE_CREDITS } from '@/config/plans';
import { useToast } from '@/hooks/use-toast';


interface AppViewProps {
  initialProject: SavedProject | null;
  onProjectSave: (project: SavedProject, plan: string) => boolean;
  clearInitialProject: () => void;
  currentUserPlan: string;
  creditsUsed: number;
  maxFreeCredits: number;
  onCreditUsed: () => void;
}

const AppView = React.memo(({ 
    initialProject, 
    onProjectSave, 
    clearInitialProject,
    currentUserPlan,
    creditsUsed,
    maxFreeCredits,
    onCreditUsed 
}: AppViewProps) => {
  const { toast } = useToast();
  const workflow = useAppWorkflow({ 
    initialProject, 
    onProjectSave, 
    clearInitialProject,
    currentUserPlan,
    creditsUsed,
    maxFreeCredits,
    onCreditUsed
  });

  const {
    currentStep,
    selectedIdea,
    currentProjectId,
    showUpgradeModal,
    setShowUpgradeModal,
    isStepCompleted,
    navigateToStep,
    resetAppCreationState,
  } = workflow;
  
  const canStartNewProject = !(currentUserPlan === FREE_TIER_NAME && creditsUsed >= MAX_FREE_CREDITS);
  const canSaveProject = selectedIdea && workflow.proposal?.appName && workflow.proposal.appName.trim() !== '';

  const commonNavProps = {
    currentStep,
    navigateToStep,
    isStepCompleted,
    stepsConfig,
    currentUserPlan,
    canSaveProject,
    toast,
    setShowUpgradeModal,
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 h-full">
      <WorkflowSidebarNav 
        {...commonNavProps} 
        resetAppCreationState={resetAppCreationState}
        canStartNewProject={canStartNewProject}
        currentProjectId={currentProjectId}
        selectedIdea={selectedIdea}
      />
      
      <div className="md:hidden mb-4">
          <Button 
            onClick={() => resetAppCreationState(true)} 
            variant="outline" 
            size="sm" 
            className="w-full mb-2"
            disabled={!canStartNewProject && !currentProjectId && !selectedIdea}
            title={!canStartNewProject && !currentProjectId && !selectedIdea ? "Free Tier credit limit reached" : "Start a new project"}
          >
              <RefreshCw className="mr-2 h-4 w-4" /> Start New Project
          </Button>
          <WorkflowMobileNav {...commonNavProps} />
      </div>

      <div className="flex-1 min-w-0 h-full">
        <WorkflowStepContainer workflow={workflow} />
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
});

AppView.displayName = 'AppView';
export default AppView;

