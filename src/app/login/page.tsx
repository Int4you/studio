
import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingPageHeader from '@/components/layout/LandingPageHeader'; // New import

const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);
const MemoizedAuthForm = React.memo(AuthForm);

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader />
      <main className="flex-grow flex items-center justify-center py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-muted/20 to-background dark:from-background dark:via-muted/10 dark:to-background">
        <MemoizedAuthForm />
      </main>
      <MemoizedCallToActionSection />
      <MemoizedLandingPageFooter />
    </div>
  );
}
