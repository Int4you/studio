
import type { ReactNode } from 'react';
import React from 'react';
import LandingPageHeader from '@/components/layout/LandingPageHeader';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import CallToActionSection from '@/components/landing/CallToActionSection';

interface LegalPageLayoutProps {
  pageTitle: string;
  children: ReactNode;
}

const MemoizedCallToActionSection = React.memo(CallToActionSection);
const MemoizedLandingPageFooter = React.memo(LandingPageFooter);

const LegalPageLayout = React.memo(({ pageTitle, children }: LegalPageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingPageHeader />
      <main className="flex-grow py-12 sm:py-16 lg:py-20 bg-muted/10 dark:bg-muted/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <article className="prose dark:prose-invert lg:prose-xl bg-card p-6 sm:p-8 md:p-10 rounded-xl shadow-xl border border-border/20">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">{pageTitle}</h1>
            {children}
          </article>
        </div>
      </main>
      <MemoizedCallToActionSection />
      <MemoizedLandingPageFooter />
    </div>
  );
});

LegalPageLayout.displayName = 'LegalPageLayout';

export default LegalPageLayout;
