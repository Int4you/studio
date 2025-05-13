
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, Brain, FileText, TerminalSquare, HardDriveUpload, ArrowRight, TrendingUp, Search, CheckCircle, Tag, Milestone } from 'lucide-react'; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Lightbulb,
    title: 'Ignite Your Vision: Share Your Idea',
    description: "Begin by articulating your app concept. Describe the problem it solves, your target audience, and key functionalities. The richer your input, the smarter PromptForge's AI assistance.",
  },
  {
    icon: Brain,
    title: 'Explore Possibilities: AI-Generated Concepts',
    description: "PromptForge's AI brainstorms diverse application concepts from your prompt. Review these creative options and select the one that perfectly aligns with your vision.",
  },
  {
    icon: FileText,
    title: 'Solidify Your Plan: Detailed AI Proposal',
    description: "With your chosen idea, the AI crafts a comprehensive proposal. This includes a compelling app name, detailed core features, and specific UI/UX guidelines, all editable to your preference.",
  },
  {
    icon: Search,
    title: 'Understand the Field: Market & Competitor Analysis',
    description: "Gain critical insights into the market landscape. AI analyzes trends, identifies competitors, assesses market size, and provides a SWOT analysis to inform your strategy.",
  },
  {
    icon: TrendingUp, 
    title: 'Focus Your Efforts: AI Feature Prioritization', 
    description: "Leverage AI to analyze and rank your core features by potential market impact and estimated development effort, guiding your MVP strategy effectively.",
  },
  {
    icon: Tag,
    title: 'Define Value: AI-Driven Pricing Strategy',
    description: "Receive AI-powered recommendations for optimal pricing models, tiers, and strategies, considering your app's value, market, and monetization goals.",
  },
  {
    icon: Milestone, 
    title: 'Plan Your Build: MVP Roadmap Generation',
    description: "Automatically generate an MVP roadmap, including feature prioritization, effort estimation, and clear objectives based on your saved project.",
  },
  {
    icon: TerminalSquare,
    title: 'Accelerate Development: AI Developer Prompt',
    description: "Transform your detailed proposal into a powerful, structured prompt, specifically engineered for \"Text-to-App\" AI code generation tools, jumpstarting actual development.",
  },
  {
    icon: HardDriveUpload,
    title: 'Secure Your Progress: Save to Project Library',
    description: "Keep all your innovative projects meticulously organized. Save ideas, proposals, analyses, pricing strategies, and prompts to your personal library for easy access and iteration.",
  },
];

export default function HowItWorksContent() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-muted/5 to-background dark:from-background dark:via-muted/10 dark:to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm mb-4">
            <CheckCircle className="mr-2 h-4 w-4 text-primary" />
            Streamlined Workflow
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            How <span className="text-primary">PromptForge</span> Transforms Your Ideas
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Follow our AI-guided journey to seamlessly convert your initial spark into a well-defined, strategically priced, and developer-ready app concept.
          </p>
        </div>

        <div className="relative">
          {/* Central line for desktop */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-1 bg-border/70 -translate-x-1/2"></div>
          
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isLeftAlignedOnDesktop = index % 2 === 0; 
            return (
              <div key={index} className="relative mb-12 md:mb-20 flex items-center">
                {/* Numbered circle on the path */}
                <div className={cn(
                  "absolute w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg border-4 border-background z-10",
                  // Desktop positioning: centered on the line, vertically centered with the card
                  "md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2", 
                  // Mobile positioning: to the very left, aligned with where the card content starts
                  "left-0 -translate-x-1 -mt-1 top-0" 
                )}>
                  {index + 1}
                </div>

                {/* Container for the Card (handles alignment and spacing) */}
                <div className={cn(
                  "w-full md:w-[calc(50%-4rem)] group", // 4rem gives space around the central 1rem line + circle + padding
                  isLeftAlignedOnDesktop ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8", // Desktop: alternating sides with padding from center
                  "mt-8 ml-12 md:ml-0 md:mt-0" // Mobile: margin-left for number, no top margin on desktop as flex handles centering
                )}>
                  <Card className="overflow-hidden shadow-xl hover:shadow-primary/20 border border-border/30 rounded-xl transition-all duration-300 bg-card/80 backdrop-blur-sm transform group-hover:-translate-y-1 group-hover:shadow-2xl">
                    <CardHeader className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3">
                        <div className="p-3 sm:p-4 rounded-full bg-primary/10 border border-primary/20 mr-0 sm:mr-4 mb-3 sm:mb-0 group-hover:bg-primary/20 transition-colors shadow-lg self-start flex-shrink-0">
                          <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {step.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <CardDescription className="text-base text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-colors">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-20 md:mt-28">
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
                Ready to Start Forging Your App?
            </h3>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                Experience the streamlined, AI-powered app prototyping process yourself. Turn your vision into reality with PromptForge.
            </p>
            <Button asChild size="lg" className="shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 px-10 py-7 text-lg">
                <Link href="/dashboard">
                Go to PromptForge App
                <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>

      </div>
    </section>
  );
}
