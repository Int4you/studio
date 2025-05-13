
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import { Cpu, LogIn, DollarSign, Mail, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Cpu className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl font-bold tracking-tight">
              Prompt<span className="text-primary">Forge</span>
            </h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link href="/how-it-works" className="flex items-center text-sm">
                <Info className="mr-1.5 h-4 w-4" /> How It Works
              </Link>
            </Button>
            {/* Assuming Login, Contact are sections on the landing page or placeholders */}
            <Button variant="ghost" asChild>
              <Link href="#login" className="flex items-center text-sm"> {/* Placeholder link */}
                <LogIn className="mr-1.5 h-4 w-4" /> Login
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/pricing" className="flex items-center text-sm"> 
                <DollarSign className="mr-1.5 h-4 w-4" /> Pricing
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#contact" className="flex items-center text-sm"> {/* Placeholder link */}
                <Mail className="mr-1.5 h-4 w-4" /> Contact
              </Link>
            </Button>
             <Button variant="default" asChild size="sm" className="ml-2 shadow-sm hover:shadow-md transition-shadow">
              <Link href="/dashboard">
                Go to App
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </nav>
          <div className="md:hidden">
             <Button variant="default" asChild size="sm">
              <Link href="/dashboard">Go to App</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        {/* Placeholder sections for Login, Pricing, Contact can be added here if they are actual sections */}
        {/* <section id="login" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10 text-center">Login Section</section> */}
        {/* <section id="pricing" className="py-16 md:py-24 text-center">Pricing Section</section> */}
        {/* <section id="contact" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10 text-center">Contact Section</section> */}
        <CallToActionSection />
      </main>
      <LandingPageFooter />
    </div>
  );
}
