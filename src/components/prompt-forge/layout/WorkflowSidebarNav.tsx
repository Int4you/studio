
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { CheckCircle2, Crown, RefreshCw } from 'lucide-react'; 
import type { AppStepId, AppStepConfig } from '../appWorkflowTypes';
import { PREMIUM_STEP_IDS, FREE_TIER_NAME, MAX_FREE_CREDITS } from '@/config/plans';
import type { ToastSignature } from '@/hooks/use-toast'; // Assuming this type exists or is similar

interface WorkflowSidebarNavProps {
  currentStep: AppStepId;
  navigateToStep: (stepId: AppStepId) => void;
  isStepCompleted: (stepId: AppStepId) => boolean;
  stepsConfig: AppStepConfig[];
  currentUserPlan: string;
  canSaveProject: boolean;
  toast: ToastSignature; // Or the correct type for your toast function
  setShowUpgradeModal: (show: boolean) => void;
  // Add props for resetAppCreationState and related disabled logic
  resetAppCreationState?: (clearPromptField?: boolean) => void;
  canStartNewProject?: boolean;
  currentProjectId?: string | null;
  selectedIdea?: any; // Replace with actual Idea type
}

export default function WorkflowSidebarNav({
  currentStep,
  navigateToStep,
  isStepCompleted,
  stepsConfig,
  currentUserPlan,
  canSaveProject,
  toast,
  setShowUpgradeModal,
  resetAppCreationState, // Optional for now if AppView handles it
  canStartNewProject,    // Optional
  currentProjectId,      // Optional
  selectedIdea,          // Optional
}: WorkflowSidebarNavProps) {
  
  // Determine if the Start New Project button should be disabled
  // This logic might be better passed as a prop if resetAppCreationState is also passed
  const startNewProjectDisabled = 
    resetAppCreationState && // Only consider if reset function is available
    typeof canStartNewProject === 'boolean' && // Ensure canStartNewProject is provided
    !canStartNewProject && 
    !currentProjectId && 
    !selectedIdea;

  return (
    <nav className="hidden md:block w-full md:w-64 lg:w-72 shrink-0">
      <div className="sticky top-20 space-y-2">
        {resetAppCreationState && ( // Conditionally render if function is passed
            <Button 
                onClick={() => resetAppCreationState(true)} 
                variant="outline" 
                size="sm" 
                className="w-full mb-4"
                disabled={startNewProjectDisabled} 
                title={startNewProjectDisabled ? "Free Tier credit limit reached" : "Start a new project"}
            >
                <RefreshCw className="mr-2 h-4 w-4" /> Start New Project
            </Button>
        )}
        {stepsConfig.map((step) => {
          const isPremium = PREMIUM_STEP_IDS.includes(step.id);
          const isLockedForFreeUser = isPremium && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(step.id);
          
          let navButtonDisabled = false;
          if (step.id === 'save' && !canSaveProject && currentStep !== 'save') {
              navButtonDisabled = true;
          }
          // If locked for free user, it's disabled regardless of canSaveProject for the 'save' step
          if (isLockedForFreeUser && currentStep !== step.id) {
            navButtonDisabled = true;
          }

          return (
            <Button
              key={step.id}
              variant={currentStep === step.id ? 'default' : 'ghost'}
              className={cn(
                  "w-full justify-start text-left px-3 py-2 h-auto flex items-center",
                  currentStep === step.id && "shadow-md",
                  navButtonDisabled && currentStep !== step.id && "opacity-70 cursor-not-allowed hover:bg-transparent"
              )}
              onClick={() => {
                  if (step.id === 'save' && !canSaveProject) {
                       toast({
                          title: "Cannot Navigate to Save",
                          description: "An idea (Step 1) and an application name (Step 2) are required before saving.",
                          variant: "destructive",
                        });
                      return;
                  }
                   if (isLockedForFreeUser) {
                        setShowUpgradeModal(true);
                        return;
                    }
                  navigateToStep(step.id)
              }}
              disabled={navButtonDisabled && currentStep !== step.id}
              title={
                  isLockedForFreeUser ? `${step.title} is a Premium feature.` :
                  step.id === 'save' && !canSaveProject ? "Idea and App Name required to save." :
                  step.description
              }
            >
              <step.icon className={cn("mr-3 h-5 w-5 shrink-0", currentStep === step.id ? "text-primary-foreground" : "text-primary")} />
              <div className="flex-grow min-w-0 flex items-center"> 
                <span className="font-medium block">{step.title}</span>
                {isStepCompleted(step.id) && currentStep !== step.id && (
                    <CheckCircle2 className="ml-2 inline-block h-4 w-4 text-green-500 shrink-0" />
                )}
              </div>
              {isPremium && <Crown className="ml-auto h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
