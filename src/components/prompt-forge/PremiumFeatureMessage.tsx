
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { PREMIUM_CREATOR_NAME } from '@/config/plans';

interface PremiumFeatureMessageProps {
  featureName?: string;
}

export default function PremiumFeatureMessage({ featureName = "This feature" }: PremiumFeatureMessageProps) {
  return (
    <Card className="border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 p-6 my-4 text-center shadow-lg">
      <CardHeader className="p-0 pb-4">
        <div className="inline-flex items-center justify-center rounded-full bg-amber-500/20 p-3 mx-auto mb-3 border border-amber-500/30 w-16 h-16">
          <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="text-amber-700 dark:text-amber-300 text-2xl font-bold">
          Unlock Premium Access
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <p className="text-md text-amber-800 dark:text-amber-400">
          <strong>{featureName}</strong> is part of our <strong className="text-primary">{PREMIUM_CREATOR_NAME}</strong> plan.
        </p>
        <p className="text-sm text-muted-foreground dark:text-amber-500">
          Upgrade now to unlock this and other powerful AI tools to accelerate your app development.
        </p>
        <Button asChild size="lg" className="mt-2 shadow-md hover:shadow-lg transition-shadow bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-amber-50">
          <Link href="/pricing">
            View Upgrade Options
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
