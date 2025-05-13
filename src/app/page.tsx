import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import { Cpu, Home, LogIn, DollarSign, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
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
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" /> Home
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#login" className="flex items-center"> {/* Placeholder link */}
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#pricing" className="flex items-center"> {/* Placeholder link */}
                <DollarSign className="mr-2 h-4 w-4" /> Pricing
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#contact" className="flex items-center"> {/* Placeholder link */}
                <Mail className="mr-2 h-4 w-4" /> Contact
              </Link>
            </Button>
          </nav>
          <div className="md:hidden">
            {/* Mobile menu button can be added here if needed */}
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CallToActionSection />
      </main>
      <LandingPageFooter />
    </div>
  );
}
