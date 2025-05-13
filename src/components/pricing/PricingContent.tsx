
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Zap, DollarSignIcon } from 'lucide-react';
import Link from 'next/link';
import { FREE_TIER_NAME, PREMIUM_CREATOR_NAME, freePlanUIDetails, premiumPlanUIDetails } from '@/config/plans';

const tiers = [
  {
    name: freePlanUIDetails.name,
    price: '$0',
    frequency: '/ month',
    description: 'Perfect for trying out PromptForge and occasional use.',
    features: freePlanUIDetails.features,
    cta: 'Get Started for Free',
    href: '/dashboard',
    icon: <Zap className="h-8 w-8 mb-4 text-primary" />,
    borderColor: 'border-border/30',
    bgColor: 'bg-card',
    textColor: 'text-foreground',
    buttonVariant: 'outline' as "outline" | "default",
  },
  {
    name: premiumPlanUIDetails.name,
    price: premiumPlanUIDetails.price,
    frequency: premiumPlanUIDetails.frequency,
    description: premiumPlanUIDetails.description,
    features: premiumPlanUIDetails.features,
    cta: 'Upgrade to Premium',
    href: '/dashboard', // Placeholder, should go to a payment/upgrade page or contact
    icon: <Star className="h-8 w-8 mb-4 text-primary" />,
    borderColor: 'border-primary/50',
    bgColor: 'bg-primary/5 dark:bg-primary/10',
    textColor: 'text-primary',
    buttonVariant: 'default' as "outline" | "default",
    popular: true,
  },
];

export default function PricingContent() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-muted/5 to-background dark:from-background dark:via-muted/10 dark:to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm mb-4">
            <DollarSignIcon className="mr-2 h-4 w-4 text-primary" />
            Simple & Transparent Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Choose Your <span className="text-primary">PromptForge</span> Plan
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free or unlock unlimited potential with our Premium plan. No hidden fees, just pure innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {tiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`flex flex-col rounded-xl shadow-xl hover:shadow-primary/10 transition-all duration-300 group ${tier.borderColor} ${tier.bgColor} ${tier.textColor} ${tier.popular ? 'border-2 ring-2 ring-primary/60 ring-offset-2 ring-offset-background' : 'border'}`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3">
                    <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-full shadow-md">
                        POPULAR
                    </div>
                </div>
              )}
              <CardHeader className="p-6 md:p-8 text-center items-center">
                {tier.icon}
                <CardTitle className={`text-3xl font-bold ${tier.textColor}`}>{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                  <span className="text-base font-medium text-muted-foreground">{tier.frequency}</span>
                </div>
                <CardDescription className="mt-3 text-sm text-muted-foreground min-h-[40px]">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-6 md:p-8 space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 md:p-8 mt-auto">
                <Button asChild size="lg" className="w-full text-base py-6 shadow-md hover:shadow-lg transition-shadow" variant={tier.buttonVariant}>
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 md:mt-24 text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto text-left space-y-6">
            <Card className="p-4 bg-card border rounded-lg shadow-sm">
                <CardTitle className="text-md font-medium text-foreground mb-1">Can I cancel my Premium subscription anytime?</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Yes, you can cancel your Premium subscription at any time. You'll retain access to Premium features until the end of your current billing period.
                </CardDescription>
            </Card>
            <Card className="p-4 bg-card border rounded-lg shadow-sm">
                <CardTitle className="text-md font-medium text-foreground mb-1">What counts as a "Project Credit"?</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    A project credit is used when you initiate a new app idea through the "Spark Idea" step. Editing an existing project or generating subsequent steps for it (like Proposal, Market Analysis, etc.) for that same initial idea does not consume additional credits.
                </CardDescription>
            </Card>
             <Card className="p-4 bg-card border rounded-lg shadow-sm">
                <CardTitle className="text-md font-medium text-foreground mb-1">What payment methods do you accept?</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    We accept all major credit cards through our secure payment processor (Stripe). More options may be available in the future.
                </CardDescription>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

