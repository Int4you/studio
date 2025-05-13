
import React from 'react';
import ContactForm from '@/components/contact/ContactForm';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingPageHeader from '@/components/layout/LandingPageHeader'; // New import

const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);
const MemoizedContactForm = React.memo(ContactForm);


export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader />
      <main className="flex-grow py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-muted/20 to-background dark:from-background dark:via-muted/10 dark:to-background">
        <MemoizedContactForm />
      </main>
      <MemoizedCallToActionSection />
      <MemoizedLandingPageFooter />
    </div>
  );
}
