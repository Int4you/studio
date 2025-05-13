
import React from 'react';
import { LandingPageHeader } from '@/components/prompt-forge/layout';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import AffiliateProgramOverview from '@/components/affiliate/AffiliateProgramOverview';
import CallToActionSection from '@/components/landing/CallToActionSection';

const MemoizedAffiliateProgramOverview = React.memo(AffiliateProgramOverview);
const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);

export default function AffiliatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader />
      <main className="flex-grow py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-muted/20 to-background dark:from-background dark:via-muted/10 dark:to-background">
        <MemoizedAffiliateProgramOverview />
      </main>
      <MemoizedCallToActionSection />
      <MemoizedLandingPageFooter />
    </div>
  );
}
