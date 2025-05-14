
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, Search, TerminalSquare, TrendingUp, DollarSignIcon as DollarSign, Sparkles } from 'lucide-react'; 

const features = [
  {
    icon: <Lightbulb className="h-8 w-8" />, // Reduced size
    title: 'AI Idea Generation',
    description: 'Unleash creativity and brainstorm innovative application ideas tailored to your vision with AI.',
    bgColor: 'bg-yellow-500/15 dark:bg-yellow-500/10', 
    borderColor: 'border-yellow-500/40',
    textColor: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    icon: <FileText className="h-8 w-8" />, // Reduced size
    title: 'Detailed AI Proposals',
    description: 'Transform concepts into comprehensive proposals outlining core features and clear UI/UX guidelines.',
    bgColor: 'bg-sky-500/15 dark:bg-sky-500/10', 
    borderColor: 'border-sky-500/40',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    icon: <Search className="h-8 w-8" />, // Reduced size
    title: 'Insightful Market Analysis',
    description: 'Gain critical market insights with AI-driven analysis of trends, competitors, and SWOT.',
    bgColor: 'bg-green-500/15 dark:bg-green-500/10', 
    borderColor: 'border-green-500/40',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: <TrendingUp className="h-8 w-8" />, // Reduced size
    title: 'Intelligent Feature Prioritization',
    description: 'Strategically rank features using AI, balancing market demand with development effort for your MVP.',
    bgColor: 'bg-purple-500/15 dark:bg-purple-500/10', 
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: <DollarSign className="h-8 w-8" />, // Reduced size
    title: 'AI Pricing Strategy',
    description: 'Receive AI-driven recommendations for optimal pricing models and tiers based on your app and market.',
    bgColor: 'bg-pink-500/15 dark:bg-pink-500/10', 
    borderColor: 'border-pink-500/40',
    textColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    icon: <TerminalSquare className="h-8 w-8" />, // Reduced size
    title: 'Developer-Ready AI Prompts',
    description: 'Generate meticulously crafted prompts for Text-to-App AI tools to kickstart development.',
    bgColor: 'bg-indigo-500/15 dark:bg-indigo-500/10', 
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
];

const FeaturesSection = React.memo(() => {
  return (
    <section id="features" className="py-16 md:py-24 bg-background"> {/* Reduced py */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 md:mb-16"> {/* Reduced mb */}
           <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm mb-3"> {/* Reduced mb */}
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Core Capabilities
            </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground"> {/* Reduced h2 size */}
            Innovate Faster, <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Smarter.</span>
          </h2>
          <p className="mt-4 text-md sm:text-lg text-muted-foreground max-w-3xl mx-auto"> {/* Reduced mt, font size */}
            PromptForge offers a powerful suite of AI-driven tools to streamline your app creation journey from initial spark to developer handoff.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Reduced gap */}
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card shadow-lg hover:shadow-primary/15 transition-all duration-300 rounded-xl border border-border/10 group flex flex-col transform hover:-translate-y-1 overflow-hidden"
            >
              <CardHeader className="p-5 md:p-6 items-center text-center"> {/* Reduced padding */}
                <div className={`p-3 rounded-full ${feature.bgColor} inline-block mb-4 border ${feature.borderColor} group-hover:scale-110 transition-transform duration-300`}> {/* Reduced p, mb */}
                  {React.cloneElement(feature.icon, { className: `h-8 w-8 ${feature.textColor}` })}
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{feature.title}</CardTitle> {/* Reduced font size */}
              </CardHeader>
              <CardContent className="flex-grow p-5 md:p-6 pt-0 text-center"> {/* Reduced padding */}
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">{feature.description}</CardDescription> {/* Reduced font size */}
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
