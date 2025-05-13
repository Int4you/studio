import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, Brain, FileText, /*ImageIcon,*/ TerminalSquare, HardDriveUpload, ArrowRight, TrendingUp, Search, CheckCircle, Tag, DollarSign } from 'lucide-react'; 
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Lightbulb,
    title: '1. Ignite Your Vision: Share Your Idea',
    description: "Begin by articulating your app concept. Describe the problem it solves, your target audience, and key functionalities. The richer your input, the smarter PromptForge's AI assistance.",
    imageSrc: "https://picsum.photos/seed/vision-spark/800/600",
    imageAlt: "Abstract visual of a lightbulb turning into an app interface",
    aiHint: "idea spark",
  },
  {
    icon: Brain,
    title: '2. Explore Possibilities: AI-Generated Concepts',
    description: "PromptForge's AI brainstorms diverse application concepts from your prompt. Review these creative options and select the one that perfectly aligns with your vision.",
    imageSrc: "https://picsum.photos/seed/ai-concepts/800/600",
    imageAlt: "Multiple unique app idea cards presented for selection",
    aiHint: "concept selection",
  },
  {
    icon: FileText,
    title: '3. Solidify Your Plan: Detailed AI Proposal',
    description: "With your chosen idea, the AI crafts a comprehensive proposal. This includes a compelling app name, detailed core features, and specific UI/UX guidelines, all editable to your preference.",
    imageSrc: "https://picsum.photos/seed/ai-proposal/800/600",
    imageAlt: "A structured document showing app name, features, and UI/UX guidelines",
    aiHint: "digital proposal",
  },
  {
    icon: Search,
    title: '4. Understand the Field: Market & Competitor Analysis',
    description: "Gain critical insights into the market landscape. AI analyzes trends, identifies competitors, assesses market size, and provides a SWOT analysis to inform your strategy.",
    imageSrc: "https://picsum.photos/seed/market-scan/800/600",
    imageAlt: "Infographics and charts depicting market trends and competitor data",
    aiHint: "market research",
  },
  {
    icon: TrendingUp, 
    title: '5. Focus Your Efforts: AI Feature Prioritization', 
    description: "Leverage AI to analyze and rank your core features by potential market impact and estimated development effort, guiding your MVP strategy effectively.",
    imageSrc: "https://picsum.photos/seed/feature-rank/800/600", 
    imageAlt: "A visual chart or list ranking app features by priority scores",
    aiHint: "priority matrix",
  },
  { // New Step for Pricing Strategy
    icon: Tag, // Or DollarSign
    title: '6. Define Value: AI-Driven Pricing Strategy',
    description: "Receive AI-powered recommendations for optimal pricing models, tiers, and strategies, considering your app's value, market, and monetization goals.",
    imageSrc: "https://picsum.photos/seed/pricing-models/800/600",
    imageAlt: "Visual representation of different pricing tiers and models",
    aiHint: "pricing strategy",
  },
  // { // Removed Mockup Step
  //   icon: ImageIcon,
  //   title: '6. See It Come to Life: AI-Generated Mockups',
  //   description: "Instantly visualize your app with multiple high-fidelity mobile mockups. Optionally provide a reference image to perfectly guide the visual style and aesthetic.",
  //   imageSrc: "https://picsum.photos/seed/app-visualization/800/600",
  //   imageAlt: "A gallery of diverse mobile app screen mockups",
  //   aiHint: "mobile UI",
  // },
  {
    icon: TerminalSquare,
    title: '7. Accelerate Development: AI Developer Prompt', // Adjusted step number
    description: "Transform your detailed proposal into a powerful, structured prompt, specifically engineered for \"Text-to-App\" AI code generation tools, jumpstarting actual development.",
    imageSrc: "https://picsum.photos/seed/dev-prompt/800/600",
    imageAlt: "A code editor interface showing a well-structured prompt for AI code generation",
    aiHint: "code prompt",
  },
  {
    icon: HardDriveUpload,
    title: '8. Secure Your Progress: Save to Project Library', // Adjusted step number
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

        <div className="space-y-16 md:space-y-20">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card 
                key={index} 
                className="overflow-hidden shadow-xl hover:shadow-primary/10 border border-border/20 rounded-xl transition-all duration-300 group bg-card"
              >
                <div className={`grid md:grid-cols-2 items-center ${index % 2 === 0 ? '' : 'md:grid-flow-col-dense'}`}>
                  <div className={`relative min-h-[300px] md:min-h-[450px] w-full ${index % 2 === 0 ? 'md:order-last' : ''}`}>
                    <Image
                      src={step.imageSrc}
                      alt={step.imageAlt}
                      layout="fill"
                      objectFit="cover"
                      className="transform transition-transform duration-500 group-hover:scale-105 rounded-md md:rounded-none"
                      data-ai-hint={step.aiHint}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-${index % 2 === 0 ? 'l' : 'r'} md:from-card md:via-transparent md:to-transparent opacity-40 group-hover:opacity-20 transition-opacity`}></div>
                  </div>
                  <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center justify-center md:justify-start mb-5">
                      <div className="p-3.5 rounded-full bg-primary/10 border border-primary/20 w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-sm">
                         <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors text-center md:text-left">{step.title}</CardTitle>
                    <CardDescription className="text-base md:text-lg text-muted-foreground leading-relaxed text-center md:text-left">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>
              </Card>
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

```
  </change>
  <change>