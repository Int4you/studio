
import React from 'react';
import PricingContent from '@/components/pricing/PricingContent';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingPageHeader from '@/components/layout/LandingPageHeader'; // New import

const MemoizedPricingContent = React.memo(PricingContent);
const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);


export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader />
      <main className="flex-grow">
        <MemoizedPricingContent />
        <MemoizedCallToActionSection />
      </main>
      <MemoizedLandingPageFooter />
    </div>
  );
}
