
"use client";

import React from 'react';
import type { AppStepId, AppStepConfig } from '../appWorkflowTypes';
import { PREMIUM_STEP_IDS, FREE_TIER_NAME } from '@/config/plans';
import type { ToastSignature } from '@/hooks/use-toast'; // Assuming this type exists

interface WorkflowMobileNavProps {
  currentStep: AppStepId;
  navigateToStep: (stepId: AppStepId) => void;
  isStepCompleted: (stepId: AppStepId) => boolean;
  stepsConfig: AppStepConfig[];
  currentUserPlan: string;
  canSaveProject: boolean;
  toast: ToastSignature; // Or the correct type for your toast function
  setShowUpgradeModal: (show: boolean) => void;
}

export default function WorkflowMobileNav({
  currentStep,
  navigateToStep,
  isStepCompleted,
  stepsConfig,
  currentUserPlan,
  canSaveProject,
  toast,
  setShowUpgradeModal,
}: WorkflowMobileNavProps) {
  return (
    <select 
        value={currentStep} 
        onChange={(e) => {
          const targetStepId = e.target.value as AppStepId;
          const targetStepConfig = stepsConfig.find(s => s.id === targetStepId);
          const isPremium = targetStepConfig && PREMIUM_STEP_IDS.includes(targetStepConfig.id);
          const isLockedForFreeUser = isPremium && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(targetStepConfig.id);

          if (targetStepId === 'save' && !canSaveProject) {
               toast({
                  title: "Cannot Navigate to Save",
                  description: "An idea (Step 1) and an application name (Step 2) are required before saving.",
                  variant: "destructive",
                });
              return;
          }
          if (isLockedForFreeUser) {
            setShowUpgradeModal(true);
            // Do not navigate if it's locked and trying to access, keep currentStep selected
            // Resetting e.target.value might be complex, better to handle in navigateToStep or ensure currentStep state is truth
            e.target.value = currentStep; 
            return;
          }
          navigateToStep(targetStepId);
        }}
        className="w-full p-3 border border-input rounded-md bg-background text-foreground shadow-sm"
    >
        {stepsConfig.map(step => {
          const isPremium = PREMIUM_STEP_IDS.includes(step.id);
          const isLockedForFreeUser = isPremium && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(step.id);
          let optionDisabled = false;
          if (step.id === 'save' && !canSaveProject) {
              optionDisabled = true;
          }
          // If locked for free user, option is disabled
          if (isLockedForFreeUser) {
            optionDisabled = true;
          }


          return (
            <option key={step.id} value={step.id} disabled={optionDisabled}>
                {step.title} 
                {isStepCompleted(step.id) ? ' ✔' : ''}
                {isPremium ? ' (Premium)' : ''}
                {optionDisabled && step.id === 'save' ? ' (Idea/App Name needed)' : ''}
                {optionDisabled && isLockedForFreeUser ? ' (Upgrade to Premium)' : ''}
            </option>
          );
        })}
    </select>
  );
}
