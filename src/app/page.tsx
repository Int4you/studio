
import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import LandingPageHeader from '@/components/layout/LandingPageHeader'; // New import

// Memoize sections for potential performance improvement
const MemoizedHeroSection = React.memo(HeroSection);
const MemoizedFeaturesSection = React.memo(FeaturesSection);
const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader /> {/* Use shared header */}
      <main className="flex-grow">
        <MemoizedHeroSection />
        <MemoizedFeaturesSection />
        <MemoizedCallToActionSection />
      </main>
      <MemoizedLandingPageFooter />
    </div>
  );
}
