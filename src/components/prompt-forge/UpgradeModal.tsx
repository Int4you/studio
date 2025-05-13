
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
import { Zap, Star, ArrowRight } from 'lucide-react';
import { MAX_FREE_CREDITS, PREMIUM_CREATOR_NAME, premiumPlanUIDetails } from '@/config/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md rounded-xl border-border/30 shadow-2xl">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Star className="h-10 w-10 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-center text-foreground">
            Unlock Unlimited Potential!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground pt-1">
            You've used all your {MAX_FREE_CREDITS} free project credits for this cycle.
            Upgrade to <strong className="text-primary">{PREMIUM_CREATOR_NAME}</strong> for unlimited credits and more!
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-foreground">Current Plan: Free Tier</p>
                    <p className="text-xs text-muted-foreground">Limited to {MAX_FREE_CREDITS} project credits.</p>
                </div>
            </div>
             <div className="flex items-center gap-3 p-3 bg-primary/10 dark:bg-primary/15 rounded-lg border border-primary/30">
                <Star className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-primary">{PREMIUM_CREATOR_NAME}</p>
                    <p className="text-xs text-primary/80">Unlimited credits, save all projects, priority support, and more for just {premiumPlanUIDetails.price}{premiumPlanUIDetails.frequency}.</p>
                </div>
            </div>
        </div>

        <AlertDialogFooter className="sm:justify-center gap-2 pt-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} className="rounded-md text-sm shadow-sm hover:shadow">
              Maybe Later
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={onClose}  // Close modal before navigating
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm shadow-md hover:shadow-lg transition-shadow"
            >
              <Link href="/pricing" className="flex items-center">
                Upgrade to {PREMIUM_CREATOR_NAME}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    
