
import React from 'react';
import { LandingPageHeader } from '@/components/prompt-forge/layout';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';

const MemoizedAffiliateDashboard = React.memo(AffiliateDashboard);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);

export default function AffiliateDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader />
      <main className="flex-grow py-8 sm:py-12 lg:py-16 bg-muted/10 dark:bg-muted/5">
        <MemoizedAffiliateDashboard />
      </main>
      <MemoizedLandingPageFooter />
    </div>
  );
}
