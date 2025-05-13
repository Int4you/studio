
"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Zap, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MAX_FREE_CREDITS, PREMIUM_CREATOR_NAME, premiumPlanUIDetails, FREE_TIER_NAME, freePlanUIDetails } from '@/config/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl rounded-xl border border-border bg-card text-card-foreground shadow-2xl p-6 md:p-8">
        <AlertDialogHeader className="items-center text-center pb-6 md:pb-8">
          <div className="p-3.5 rounded-full bg-primary/10 border-2 border-primary/20 shadow-lg mb-4">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <AlertDialogTitle className="text-3xl font-extrabold text-foreground">
            Unlock Unlimited Potential!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground pt-2 text-md max-w-md mx-auto">
            You've used all your {MAX_FREE_CREDITS} free project credits.
            Upgrade to <strong className="text-amber-600 dark:text-amber-400">{PREMIUM_CREATOR_NAME}</strong> for unlimited credits & features!
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-6 md:py-8">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                {/* Free Tier Card */}
                <div className="flex-1 p-5 md:p-6 bg-muted/20 dark:bg-muted/10 rounded-lg border border-border/30 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-6 w-6 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-muted-foreground">{FREE_TIER_NAME}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground/80 mb-4 flex-grow">{freePlanUIDetails.features.find(f => f.includes("Project Credits"))}</p>
                    <ul className="space-y-2 text-sm text-muted-foreground/80">
                        {freePlanUIDetails.features.filter(f => !f.includes("Project Credits")).map((feat, i) => (
                            <li key={`free-${i}`} className="flex items-start">
                                <CheckCircle2 className={`h-4 w-4 mr-2 mt-0.5 shrink-0 text-green-500`} />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Premium Tier Card */}
                <div className="flex-1 p-5 md:p-6 bg-amber-50/80 dark:bg-amber-900/25 rounded-lg border-2 border-amber-400/80 dark:border-amber-500/70 shadow-lg relative overflow-hidden flex flex-col">
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-md tracking-wider">
                        BEST VALUE
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">{PREMIUM_CREATOR_NAME}</h3>
                    </div>
                     <p className="text-sm text-amber-700/90 dark:text-amber-400/90 mb-4 flex-grow">{premiumPlanUIDetails.description}</p>
                    <ul className="space-y-2 text-sm text-amber-700/80 dark:text-amber-500/80">
                        {premiumPlanUIDetails.features.map((feat, i) => (
                            <li key={`prem-${i}`} className="flex items-start">
                                <CheckCircle2 className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                                <span>{feat.startsWith("Access to all core AI features") ? "Access to all AI features (incl. premium)" : feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center gap-3 pt-6 md:pt-8">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} className="rounded-md text-sm shadow-sm hover:shadow w-full sm:w-auto py-2.5 px-6">
              Maybe Later
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={onClose} // Close modal on action, navigation happens via Link
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto py-2.5 px-6"
            >
              <Link href="/pricing" className="flex items-center justify-center w-full">
                Upgrade to {PREMIUM_CREATOR_NAME} ({premiumPlanUIDetails.price}{premiumPlanUIDetails.frequency})
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

