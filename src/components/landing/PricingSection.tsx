
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, Zap, Crown, DollarSignIcon, ArrowRight } from 'lucide-react';
import { FREE_TIER_NAME, PREMIUM_CREATOR_NAME, freePlanUIDetails, premiumPlanUIDetails } from '@/config/plans';

const pricingTiers = [
  {
    name: freePlanUIDetails.name,
    price: '$0',
    frequency: '/ month',
    description: freePlanUIDetails.features[1], // Short description
    features: freePlanUIDetails.features,
    cta: 'Get Started Free',
    href: '/dashboard', // Link to dashboard for signup/login flow
    icon: <Zap className="h-7 w-7 text-muted-foreground" />,
    borderColor: 'border-border/30',
    isPopular: false,
    featureCheckmarkColor: 'text-muted-foreground',
    buttonVariant: 'secondary' as "default" | "secondary" | "outline", // Changed to secondary
  },
  {
    name: premiumPlanUIDetails.name,
    price: premiumPlanUIDetails.price,
    frequency: premiumPlanUIDetails.frequency,
    description: premiumPlanUIDetails.description,
    features: premiumPlanUIDetails.features,
    cta: 'Choose Premium',
    href: '/pricing', // Link to full pricing page to select premium
    icon: <Crown className="h-7 w-7 text-amber-500 fill-amber-500" />,
    borderColor: 'border-primary shadow-primary/20',
    isPopular: true,
    featureCheckmarkColor: 'text-green-500',
    buttonVariant: 'default' as "default" | "secondary" | "outline",
  },
];

const PricingSection = React.memo(() => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/30 dark:bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm mb-4">
            <DollarSignIcon className="mr-2 h-4 w-4 text-primary" />
            Flexible Plans
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you. Start for free or unlock the full power of PromptForge.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`flex flex-col rounded-xl shadow-xl hover:shadow-primary/15 transition-all duration-300 group ${tier.borderColor} ${tier.isPopular ? 'border-2 ring-2 ring-primary/50 ring-offset-2 ring-offset-background transform md:scale-105' : 'border'}`}
            >
              {tier.isPopular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3 z-10">
                    <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-full shadow-lg border-2 border-background">
                        POPULAR
                    </div>
                </div>
              )}
              <CardHeader className="p-6 md:p-8 text-center items-center">
                {tier.icon}
                <CardTitle className={`text-2xl font-bold mt-2 ${tier.isPopular ? 'text-primary' : 'text-foreground'}`}>{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                  <span className="text-base font-medium text-muted-foreground">{tier.frequency}</span>
                </div>
                <CardDescription className="mt-3 text-sm text-muted-foreground min-h-[40px]">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-6 md:p-8 space-y-3">
                <ul className="space-y-2.5">
                  {tier.features.slice(0, 4).map((feature, index) => ( // Show first 4 features
                    <li key={index} className="flex items-start">
                      <CheckCircle className={`h-5 w-5 ${tier.featureCheckmarkColor} mr-2.5 mt-0.5 shrink-0`} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 md:p-8 mt-auto">
                <Button asChild size="lg" className={`w-full text-base py-3 shadow-md hover:shadow-lg transition-shadow ${tier.isPopular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`} variant={tier.buttonVariant}>
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
         <div className="text-center mt-12">
            <Button variant="link" asChild className="text-primary hover:text-primary/80">
                <Link href="/pricing">View Full Pricing Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>
      </div>
    </section>
  );
});

PricingSection.displayName = 'PricingSection';
export default PricingSection;
