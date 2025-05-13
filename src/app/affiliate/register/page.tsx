
import React from 'react';
import LandingPageHeader from '@/components/layout/LandingPageHeader';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import AffiliateRegisterForm from '@/components/affiliate/AffiliateRegisterForm';
import CallToActionSection from '@/components/landing/CallToActionSection';

const MemoizedAffiliateRegisterForm = React.memo(AffiliateRegisterForm);
const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);

export default function AffiliateRegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader />
      <main className="flex-grow flex items-center justify-center py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-muted/20 to-background dark:from-background dark:via-muted/10 dark:to-background">
        <MemoizedAffiliateRegisterForm />
      </main>
      <MemoizedCallToActionSection />
      <MemoizedLandingPageFooter />
    </div>
  );
}
