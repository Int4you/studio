import HowItWorksContent from '@/components/how-it-works/HowItWorksContent';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import CallToActionSection from '@/components/landing/CallToActionSection';
import { Cpu } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              PromptForge
            </h1>
          </Link>
          {/* Optional: Add a 'Back to Home' or 'Go to App' button here if needed */}
        </div>
      </header>
      <main className="flex-grow">
        <HowItWorksContent />
        <CallToActionSection />
      </main>
      <LandingPageFooter />
    </div>
  );
}
