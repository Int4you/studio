
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Target, DollarSign, Users, ArrowRight, ExternalLink } from 'lucide-react';

const AFFILIATE_DETAILS_KEY = 'promptForgeAffiliateDetails';

export default function AffiliateProgramOverview() {
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const affiliateDetails = localStorage.getItem(AFFILIATE_DETAILS_KEY);
      setIsAffiliate(!!affiliateDetails);
    }
  }, []);

  const programHighlights = [
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: 'Generous Commissions',
      description: 'Earn a competitive 20% recurring commission on every paying customer you refer.',
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: 'Long Cookie Life',
      description: 'Benefit from a 60-day cookie tracking period. Get credited even if users sign up later.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'High-Demand Product',
      description: 'Promote an innovative AI tool that helps creators, developers, and entrepreneurs.',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Card className="w-full shadow-2xl border-border/20 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mx-auto mb-6 border border-primary/20 shadow-md w-20 h-20">
            <Handshake className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
            Partner with PromptForge
          </CardTitle>
          <CardDescription className="text-lg sm:text-xl text-muted-foreground pt-3 max-w-2xl mx-auto">
            Join our affiliate program and earn by promoting the future of AI-powered app prototyping.
            Help others turn their ideas into reality while growing your income.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 py-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {programHighlights.map((highlight, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-muted/30 dark:bg-muted/10 rounded-xl shadow-sm border border-border/10">
                <div className="p-3 bg-primary/10 rounded-full mb-4 border border-primary/20">
                  {highlight.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            {isAffiliate ? (
              <>
                <p className="text-lg text-green-600 dark:text-green-400 font-medium">Welcome back, Partner!</p>
                <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow text-base py-3 px-8">
                  <Link href="/affiliate/dashboard">
                    Go to Your Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow text-base py-3 px-8">
                <Link href="/affiliate/register">
                  Become an Affiliate <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              By joining, you agree to our Affiliate <Link href="/terms" className="underline hover:text-primary">Terms</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
