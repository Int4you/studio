
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cpu, LogIn, DollarSign, Mail, ArrowRight } from 'lucide-react';

const LandingPageHeader = React.memo(() => {
  return (
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
            <Link href="/login" className="flex items-center text-sm">
              <LogIn className="mr-1.5 h-4 w-4" /> Login
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/pricing" className="flex items-center text-sm">
              <DollarSign className="mr-1.5 h-4 w-4" /> Pricing
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact" className="flex items-center text-sm">
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
  );
});

LandingPageHeader.displayName = 'LandingPageHeader';

export default LandingPageHeader;

