
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, FileText, TerminalSquare, Rocket, PlayCircle, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: '1. Spark Your Idea',
    description: 'Begin by describing your app concept. Our AI helps you brainstorm and refine your initial thoughts into tangible ideas.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: '2. Develop & Refine',
    description: 'Generate detailed proposals, analyze market fit, prioritize features, and define pricing strategies with AI assistance.',
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: '3. Launch Your Vision',
    description: 'Create AI developer prompts and prepare to bring your well-defined application to life faster than ever.',
  },
];

const HowItWorksSection = React.memo(() => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm mb-4">
            <PlayCircle className="mr-2 h-4 w-4 text-primary" />
            Simple Steps
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            How <span className="text-primary">PromptForge</span> Works
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Understand the straightforward process to turn your app ideas into reality.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <Card key={index} className="bg-card shadow-lg hover:shadow-primary/15 transition-all duration-300 rounded-xl border border-border/15 group transform hover:-translate-y-1">
              <CardHeader className="items-center text-center p-6">
                <div className="p-4 bg-primary/10 rounded-full mb-4 border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center p-6 pt-0">
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = 'HowItWorksSection';
export default HowItWorksSection;
