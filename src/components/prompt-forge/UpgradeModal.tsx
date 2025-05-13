
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
import { Zap, Crown, ArrowRight, CheckCircle2 } from 'lucide-react'; // Changed Star to Crown
import { MAX_FREE_CREDITS, PREMIUM_CREATOR_NAME, premiumPlanUIDetails, FREE_TIER_NAME, freePlanUIDetails } from '@/config/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg rounded-xl border-border/30 shadow-2xl bg-gradient-to-br from-card via-background to-card dark:from-card dark:via-background/80 dark:to-card">
        <AlertDialogHeader className="items-center">
          <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20 shadow-lg mb-3">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <AlertDialogTitle className="text-3xl font-extrabold text-center text-foreground">
            Unlock Unlimited Potential!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground pt-1 text-md max-w-sm mx-auto">
            You've used all your {MAX_FREE_CREDITS} free project credits.
            Upgrade to <strong className="text-primary">{PREMIUM_CREATOR_NAME}</strong> for unlimited credits &amp; features!
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 px-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/30 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm font-semibold text-muted-foreground">{FREE_TIER_NAME}</p>
                    </div>
                    <p className="text-xs text-muted-foreground/80 mb-2">{freePlanUIDetails.features.find(f => f.includes("Project Credits"))}</p>
                    <ul className="space-y-1 text-xs text-muted-foreground/70 list-disc list-inside pl-1">
                        {freePlanUIDetails.features.filter(f => !f.includes("Project Credits")).slice(0,2).map((feat, i) => <li key={`free-${i}`}>{feat}</li>)}
                    </ul>
                </div>
                <div className="flex-1 p-4 bg-primary/10 dark:bg-primary/15 rounded-lg border-2 border-primary/40 shadow-lg relative overflow-hidden">
                    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-bl-lg shadow-md transform rotate-0">
                        BEST VALUE
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <p className="text-sm font-semibold text-primary">{PREMIUM_CREATOR_NAME}</p>
                    </div>
                     <p className="text-xs text-primary/90 mb-2">{premiumPlanUIDetails.description}</p>
                    <ul className="space-y-1 text-xs text-primary/80 list-disc list-inside pl-1">
                        {premiumPlanUIDetails.features.map((feat, i) => (
                            <li key={`prem-${i}`} className="flex items-start">
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-1 mt-px shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <AlertDialogFooter className="sm:flex-row sm:justify-center gap-3 pt-4">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} className="rounded-md text-sm shadow-sm hover:shadow w-full sm:w-auto">
              Maybe Later
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
            >
              <Link href="/pricing" className="flex items-center justify-center">
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
