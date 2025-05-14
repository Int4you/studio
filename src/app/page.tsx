
import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import PartnersSection from '@/components/landing/PartnersSection';
import FeaturesSection from '@/components/landing/FeaturesSection'; // Renamed from BenefitsSection if it was separate
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FaqSection from '@/components/landing/FaqSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import { LandingPageHeader } from '@/components/prompt-forge/layout'; 

// Memoize sections for potential performance improvement
const MemoizedLandingPageHeader = React.memo(LandingPageHeader);
const MemoizedHeroSection = React.memo(HeroSection);
const MemoizedPartnersSection = React.memo(PartnersSection);
const MemoizedFeaturesSection = React.memo(FeaturesSection);
const MemoizedHowItWorksSection = React.memo(HowItWorksSection);
const MemoizedPricingSection = React.memo(PricingSection);
const MemoizedTestimonialsSection = React.memo(TestimonialsSection);
const MemoizedFaqSection = React.memo(FaqSection);
const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MemoizedLandingPageHeader />
      <main className="flex-grow">
        <MemoizedHeroSection />
        <MemoizedPartnersSection />
        <MemoizedFeaturesSection /> 
        <MemoizedTestimonialsSection />
        <MemoizedHowItWorksSection />
        <MemoizedPricingSection />
        <MemoizedFaqSection />
        <MemoizedCallToActionSection />
      </main>
      <MemoizedLandingPageFooter />
    </div>
  );
}

