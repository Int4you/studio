import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, Sparkles, FileText, Image as ImageIcon, TerminalSquare, Library, ArrowRight, TrendingUp, BarChart3, Search, HardDriveUpload, Brain, CheckCircle } from 'lucide-react'; 
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Lightbulb,
    title: '1. Ignite Your Vision: Share Your Idea',
    description: "Begin by articulating your app concept. Describe the problem it solves, your target audience, and key functionalities. The richer your input, the smarter PromptForge's AI assistance.",
    imageSrc: "https://picsum.photos/seed/vision-spark/600/400",
    imageAlt: "Abstract visual of a lightbulb turning into an app interface",
    aiHint: "idea spark innovation",
  },
  {
    icon: Brain,
    title: '2. Explore Possibilities: AI-Generated Concepts',
    description: "PromptForge's AI brainstorms diverse application concepts from your prompt. Review these creative options and select the one that perfectly aligns with your vision.",
    imageSrc: "https://picsum.photos/seed/ai-concepts/600/400",
    imageAlt: "Multiple unique app idea cards presented for selection",
    aiHint: "concept selection interface",
  },
  {
    icon: FileText,
    title: '3. Solidify Your Plan: Detailed AI Proposal',
    description: "With your chosen idea, the AI crafts a comprehensive proposal. This includes a compelling app name, detailed core features, and specific UI/UX guidelines, all editable to your preference.",
    imageSrc: "https://picsum.photos/seed/ai-proposal/600/400",
    imageAlt: "A structured document showing app name, features, and UI/UX guidelines",
    aiHint: "digital proposal document",
  },
  {
    icon: Search,
    title: '4. Understand the Field: Market & Competitor Analysis',
    description: "Gain critical insights into the market landscape. AI analyzes trends, identifies competitors, assesses market size, and provides a SWOT analysis to inform your strategy.",
    imageSrc: "https://picsum.photos/seed/market-scan/600/400",
    imageAlt: "Infographics and charts depicting market trends and competitor data",
    aiHint: "market research dashboard",
  },
  {
    icon: TrendingUp, 
    title: '5. Focus Your Efforts: AI Feature Prioritization', 
    description: "Leverage AI to analyze and rank your core features by potential market impact and estimated development effort, guiding your MVP strategy effectively.",
    imageSrc: "https://picsum.photos/seed/feature-rank/600/400", 
    imageAlt: "A visual chart or list ranking app features by priority scores",
    aiHint: "priority matrix chart",
  },
  {
    icon: ImageIcon,
    title: '6. See It Come to Life: AI-Generated Mockups',
    description: "Instantly visualize your app with multiple high-fidelity mobile mockups. Optionally provide a reference image to perfectly guide the visual style and aesthetic.",
    imageSrc: "https://picsum.photos/seed/app-visualization/600/400",
    imageAlt: "A gallery of diverse mobile app screen mockups",
    aiHint: "mobile UI gallery",
  },
  {
    icon: TerminalSquare,
    title: '7. Accelerate Development: AI Developer Prompt',
    description: "Transform your detailed proposal into a powerful, structured prompt, specifically engineered for \"Text-to-App\" AI code generation tools, jumpstarting actual development.",
    imageSrc: "https://picsum.photos/seed/dev-prompt/600/400",
    imageAlt: "A code editor interface showing a well-structured prompt for AI code generation",
    aiHint: "code prompt interface",
  },
  {
    icon: HardDriveUpload, // Changed from Library for more visual connection to saving
    title: '8. Secure Your Progress: Save to Project Library',
    description: "Keep all your innovative projects meticulously organized. Save ideas, proposals, analyses, mockups, and prompts to your personal library for easy access and iteration.",
    imageSrc: "https://picsum.photos/seed/project-vault/600/400",
    imageAlt: "A clean interface showing a list or grid of saved app projects",
    aiHint: "digital project library",
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
            Follow our AI-guided journey to seamlessly convert your initial spark into a well-defined, visually compelling, and developer-ready app concept.
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
                <div className={`grid md:grid-cols-2 items-stretch gap-0 ${index % 2 === 0 ? '' : 'md:grid-flow-col-dense'}`}>
                  <div className={`relative min-h-[300px] md:min-h-full w-full ${index % 2 === 0 ? 'md:order-last' : ''}`}>
                    <Image
                      src={step.imageSrc}
                      alt={step.imageAlt}
                      layout="fill"
                      objectFit="cover"
                      className="transform transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={step.aiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:bg-gradient-to-r md:from-black/10 md:via-transparent md:to-transparent group-hover:opacity-80 transition-opacity"></div>
                  </div>
                  <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                    <div className="p-3 rounded-full bg-primary/10 inline-block mb-5 border border-primary/20 w-14 h-14 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                       <IconComponent className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{step.title}</CardTitle>
                    <CardDescription className="text-base md:text-lg text-muted-foreground leading-relaxed">
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
