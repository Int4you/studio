
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, User, Briefcase, Brain } from 'lucide-react'; // Example icons

const benefits = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Accelerate Team Collaboration',
    description: 'Streamline your team\'s workflow from brainstorming to detailed planning with a unified AI-powered platform.',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/5',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-500',
  },
  {
    icon: <Brain className="h-10 w-10 text-primary" />,
    title: 'Unlock Creative Potential',
    description: 'Leverage AI to explore novel app ideas, generate comprehensive proposals, and overcome creative blocks effortlessly.',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/5',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-500',
  },
  {
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    title: 'Make Data-Driven Decisions',
    description: 'Gain strategic advantages with AI-driven market analysis, feature prioritization, and pricing strategy recommendations.',
    bgColor: 'bg-green-500/10 dark:bg-green-500/5',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-500',
  },
];

const PartnersSection = React.memo(() => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-muted/10 via-background to-muted/10 dark:from-muted/5 dark:via-background dark:to-muted/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Unlock Your App's Full Potential with <span className="text-primary">PromptForge</span>
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            PromptForge empowers innovators by providing AI-driven insights and tools at every stage of app conceptualization.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className={`bg-card shadow-xl hover:shadow-primary/20 transition-all duration-300 rounded-2xl border border-border/10 group flex flex-col transform hover:-translate-y-1 overflow-hidden ${benefit.bgColor}`}
            >
              <CardHeader className="p-6 md:p-8 items-center text-center">
                <div className={`p-4 rounded-full ${benefit.bgColor} inline-block mb-5 border ${benefit.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(benefit.icon, { className: `h-10 w-10 ${benefit.textColor}` })}
                </div>
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-6 md:p-8 pt-0 text-center">
                <CardDescription className="text-muted-foreground text-base leading-relaxed">{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

PartnersSection.displayName = 'PartnersSection';
export default PartnersSection;
