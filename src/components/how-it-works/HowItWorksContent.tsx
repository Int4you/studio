
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, Brain, FileText, TerminalSquare, HardDriveUpload, ArrowRight, TrendingUp, Search, CheckCircle, Tag } from 'lucide-react'; 
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Lightbulb,
    title: 'Ignite Your Vision: Share Your Idea',
    description: "Begin by articulating your app concept. Describe the problem it solves, your target audience, and key functionalities. The richer your input, the smarter PromptForge's AI assistance.",
    imageSrc: "https://picsum.photos/seed/vision-spark/800/600",
    imageAlt: "Abstract visual of a lightbulb turning into an app interface",
    aiHint: "idea spark",
  },
  {
    icon: Brain,
    title: 'Explore Possibilities: AI-Generated Concepts',
    description: "PromptForge's AI brainstorms diverse application concepts from your prompt. Review these creative options and select the one that perfectly aligns with your vision.",
    imageSrc: "https://picsum.photos/seed/ai-concepts/800/600",
    imageAlt: "Multiple unique app idea cards presented for selection",
    aiHint: "concept selection",
  },
  {
    icon: FileText,
    title: 'Solidify Your Plan: Detailed AI Proposal',
    description: "With your chosen idea, the AI crafts a comprehensive proposal. This includes a compelling app name, detailed core features, and specific UI/UX guidelines, all editable to your preference.",
    imageSrc: "https://picsum.photos/seed/ai-proposal/800/600",
    imageAlt: "A structured document showing app name, features, and UI/UX guidelines",
    aiHint: "digital proposal",
  },
  {
    icon: Search,
    title: 'Understand the Field: Market & Competitor Analysis',
    description: "Gain critical insights into the market landscape. AI analyzes trends, identifies competitors, assesses market size, and provides a SWOT analysis to inform your strategy.",
    imageSrc: "https://picsum.photos/seed/market-scan/800/600",
    imageAlt: "Infographics and charts depicting market trends and competitor data",
    aiHint: "market research",
  },
  {
    icon: TrendingUp, 
    title: 'Focus Your Efforts: AI Feature Prioritization', 
    description: "Leverage AI to analyze and rank your core features by potential market impact and estimated development effort, guiding your MVP strategy effectively.",
    imageSrc: "https://picsum.photos/seed/feature-rank/800/600", 
    imageAlt: "A visual chart or list ranking app features by priority scores",
    aiHint: "priority matrix",
  },
  {
    icon: Tag,
    title: 'Define Value: AI-Driven Pricing Strategy',
    description: "Receive AI-powered recommendations for optimal pricing models, tiers, and strategies, considering your app's value, market, and monetization goals.",
    imageSrc: "https://picsum.photos/seed/pricing-models/800/600",
    imageAlt: "Visual representation of different pricing tiers and models",
    aiHint: "pricing strategy",
  },
  {
    icon: TerminalSquare,
    title: 'Accelerate Development: AI Developer Prompt',
    description: "Transform your detailed proposal into a powerful, structured prompt, specifically engineered for \"Text-to-App\" AI code generation tools, jumpstarting actual development.",
    imageSrc: "https://picsum.photos/seed/dev-prompt/800/600",
    imageAlt: "A code editor interface showing a well-structured prompt for AI code generation",
    aiHint: "code prompt",
  },
  {
    icon: HardDriveUpload,
    title: 'Secure Your Progress: Save to Project Library',
    description: "Keep all your innovative projects meticulously organized. Save ideas, proposals, analyses, mockups, and prompts to your personal library for easy access and iteration.",
    imageSrc: "https://picsum.photos/seed/project-vault/800/600",
    imageAlt: "A clean interface showing a list or grid of saved app projects",
    aiHint: "digital library",
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
          {/* Path line */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-1 bg-border/40 -translate-x-1/2"></div>
          
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="relative mb-12 md:mb-24">
                {/* Numbered circle for the path */}
                <div className={cn(
                  "absolute top-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg border-4 border-background z-10",
                  "md:left-1/2 md:-translate-x-1/2 md:-mt-1", // Desktop positioning
                  "left-0 -translate-x-4 -mt-1 md:translate-x-0" // Mobile positioning (left aligned)
                )}>
                  {index + 1}
                </div>

                <div className={cn(
                  "flex flex-col md:flex-row items-center",
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                )}>
                  {/* Content Card */}
                  <div className={cn(
                    "w-full md:w-1/2",
                    isEven ? "md:pr-12" : "md:pl-12",
                    "md:mt-0 mt-8 ml-8 md:ml-0" // Mobile content offset
                  )}>
                    <Card className="overflow-hidden shadow-xl hover:shadow-primary/10 border border-border/20 rounded-xl transition-all duration-300 group bg-card">
                      <CardHeader className="p-6">
                        <div className="flex items-center mb-3">
                          <div className="p-3 rounded-full bg-primary/10 border border-primary/20 mr-4 group-hover:bg-primary/20 transition-colors shadow-sm">
                            <IconComponent className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                          <CardTitle className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{step.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <CardDescription className="text-base text-muted-foreground leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Image */}
                  <div className={cn(
                    "w-full md:w-1/2 mt-8 md:mt-0",
                    isEven ? "md:pl-12" : "md:pr-12",
                     "ml-8 md:ml-0" // Mobile image offset
                  )}>
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-primary/10 group hover:border-primary/30 transition-all">
                      <Image
                        src={step.imageSrc}
                        alt={step.imageAlt}
                        layout="fill"
                        objectFit="cover"
                        className="transform transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint={step.aiHint}
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:opacity-75 transition-opacity"></div>
                    </div>
                  </div>
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
