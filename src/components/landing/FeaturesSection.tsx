
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, Search, TerminalSquare, TrendingUp, Tag, Sparkles } from 'lucide-react'; 

const features = [
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: 'AI Idea Generation',
    description: 'Unleash creativity and brainstorm innovative application ideas tailored to your vision with AI.',
    bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/5',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-500',
  },
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: 'Detailed AI Proposals',
    description: 'Transform concepts into comprehensive proposals outlining core features and clear UI/UX guidelines.',
    bgColor: 'bg-sky-500/10 dark:bg-sky-500/5',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-500',
  },
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: 'Insightful Market Analysis',
    description: 'Gain critical market insights with AI-driven analysis of trends, competitors, and SWOT.',
    bgColor: 'bg-green-500/10 dark:bg-green-500/5',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-500',
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-primary" />, 
    title: 'Intelligent Feature Prioritization',
    description: 'Strategically rank features using AI, balancing market demand with development effort for your MVP.',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/5',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-500',
  },
  {
    icon: <Tag className="h-10 w-10 text-primary" />,
    title: 'AI Pricing Strategy',
    description: 'Receive AI-driven recommendations for optimal pricing models and tiers based on your app and market.',
    bgColor: 'bg-pink-500/10 dark:bg-pink-500/5',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-500',
  },
  {
    icon: <TerminalSquare className="h-10 w-10 text-primary" />,
    title: 'Developer-Ready AI Prompts',
    description: 'Generate meticulously crafted prompts for Text-to-App AI tools to kickstart development.',
    bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/5',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-500',
  },
];

const FeaturesSection = React.memo(() => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16 md:mb-20">
           <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm mb-4">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Core Capabilities
            </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            Innovate Faster, <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Smarter.</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            PromptForge offers a powerful suite of AI-driven tools to streamline your app creation journey from initial spark to developer handoff.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`bg-card shadow-xl hover:shadow-primary/20 transition-all duration-300 rounded-2xl border border-border/10 group flex flex-col transform hover:-translate-y-1 overflow-hidden ${feature.bgColor}`}
            >
              <CardHeader className="p-6 md:p-8 items-center text-center">
                <div className={`p-4 rounded-full ${feature.bgColor} inline-block mb-5 border ${feature.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(feature.icon, { className: `h-10 w-10 ${feature.textColor}` })}
                </div>
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-6 md:p-8 pt-0 text-center">
                <CardDescription className="text-muted-foreground text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
