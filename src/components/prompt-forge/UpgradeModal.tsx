
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
      <AlertDialogContent className="max-w-lg rounded-xl border-border/30 shadow-2xl bg-gradient-to-br from-card via-background to-card dark:from-card dark:via-background/80 dark:to-card p-0">
        <AlertDialogHeader className="items-center pt-8 pb-6 px-6 sm:px-8">
          <div className="p-3.5 rounded-full bg-primary/10 border-2 border-primary/20 shadow-lg mb-4">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <AlertDialogTitle className="text-3xl font-extrabold text-center text-foreground">
            Unlock Unlimited Potential!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground pt-2 text-md max-w-sm mx-auto">
            You've used all your {MAX_FREE_CREDITS} free project credits.
            Upgrade to <strong className="text-amber-600 dark:text-amber-400">{PREMIUM_CREATOR_NAME}</strong> for unlimited credits & features!
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-6 px-6 sm:px-8 space-y-5 border-t border-b border-border/20">
            <div className="flex flex-col sm:flex-row gap-5 items-stretch">
                {/* Free Tier Card */}
                <div className="flex-1 p-4 sm:p-5 bg-muted/20 dark:bg-muted/10 rounded-lg border border-border/30 shadow-sm flex flex-col min-h-[260px]">
                    <div className="flex items-center gap-2 mb-2.5">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-md font-semibold text-muted-foreground">{FREE_TIER_NAME}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground/80 mb-3.5 flex-grow">{freePlanUIDetails.features.find(f => f.includes("Project Credits"))}</p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground/70">
                        {freePlanUIDetails.features.filter(f => !f.includes("Project Credits")).slice(0,2).map((feat, i) => (
                            <li key={`free-${i}`} className="flex items-start">
                                <CheckCircle2 className={`h-3.5 w-3.5 mr-1.5 mt-px shrink-0 text-green-500`} />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Premium Tier Card */}
                <div className="flex-1 p-4 sm:p-5 bg-amber-50/80 dark:bg-amber-900/25 rounded-lg border-2 border-amber-400/80 dark:border-amber-500/70 shadow-lg relative overflow-hidden flex flex-col min-h-[260px]">
                    <div className="absolute -top-px -right-px bg-amber-500 text-white text-[0.6rem] font-bold py-1 px-3 rounded-bl-lg shadow-md tracking-wider">
                        BEST VALUE
                    </div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-md font-semibold text-amber-700 dark:text-amber-300">{PREMIUM_CREATOR_NAME}</h3>
                    </div>
                     <p className="text-xs text-amber-700/90 dark:text-amber-400/90 mb-3.5 flex-grow">{premiumPlanUIDetails.description}</p>
                    <ul className="space-y-1.5 text-xs text-amber-700/80 dark:text-amber-500/80">
                        {premiumPlanUIDetails.features.map((feat, i) => (
                            <li key={`prem-${i}`} className="flex items-start">
                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 mr-1.5 mt-px shrink-0" />
                                <span>{feat.startsWith("Access to all core AI features") ? "Access to all AI features (incl. premium)" : feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center gap-3 pt-6 pb-8 px-6 sm:px-8">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} className="rounded-md text-sm shadow-sm hover:shadow w-full sm:w-auto py-2.5">
              Maybe Later
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={onClose} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto py-2.5"
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

