import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, Sparkles, FileText, Image as ImageIcon, TerminalSquare, Library, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: <Lightbulb className="h-10 w-10 mb-4 text-primary" />,
    title: '1. Enter Your Idea Prompt',
    description: "Start by describing your application idea in simple terms. What problem does it solve? Who is it for? The more detail, the better the AI can assist you.",
    imageSrc: "https://picsum.photos/seed/text-input/600/400",
    imageAlt: "User entering an application idea into a text field",
    aiHint: "text input",
  },
  {
    icon: <Sparkles className="h-10 w-10 mb-4 text-primary" />,
    title: '2. Generate & Select Ideas',
    description: "PromptForge's AI will brainstorm multiple application concepts based on your prompt. Review the generated ideas and select the one that best fits your vision.",
    imageSrc: "https://picsum.photos/seed/idea-cards/600/400",
    imageAlt: "Multiple cards displaying different AI-generated app ideas for selection",
    aiHint: "idea cards",
  },
  {
    icon: <FileText className="h-10 w-10 mb-4 text-primary" />,
    title: '3. Develop a Detailed Proposal',
    description: "Once an idea is selected, the AI crafts a comprehensive proposal. This includes a suggested app name, core features with descriptions, and categorized UI/UX guidelines. You can edit and refine this proposal.",
    imageSrc: "https://picsum.photos/seed/proposal-document/600/400",
    imageAlt: "A document interface showing a detailed app proposal with features and guidelines",
    aiHint: "proposal document",
  },
  {
    icon: <ImageIcon className="h-10 w-10 mb-4 text-primary" />,
    title: '4. Visualize with Mockups',
    description: "Bring your concept to life by generating high-fidelity mobile app mockups. You can even provide a reference image to guide the visual style, ensuring the mockups align with your aesthetic preferences.",
    imageSrc: "https://picsum.photos/seed/app-mockups/600/400",
    imageAlt: "Several mobile app screen mockups displayed side-by-side",
    aiHint: "app mockups",
  },
  {
    icon: <TerminalSquare className="h-10 w-10 mb-4 text-primary" />,
    title: '5. Craft an AI Developer Prompt',
    description: "Transform your detailed proposal into a powerful prompt specifically designed for \"Text-to-App\" AI code generation tools. This jumpstarts the actual development process.",
    imageSrc: "https://picsum.photos/seed/code-editor/600/400",
    imageAlt: "A code editor interface displaying a detailed AI developer prompt",
    aiHint: "code editor",
  },
  {
    icon: <Library className="h-10 w-10 mb-4 text-primary" />,
    title: '6. Save & Manage in Your Library',
    description: "Keep all your projects organized. Save your ideas, proposals, mockups, and developer prompts to your personal library for easy access, review, and future iteration.",
    imageSrc: "https://picsum.photos/seed/project-folder/600/400",
    imageAlt: "A digital library interface with folders or cards representing saved projects",
    aiHint: "project folder",
  },
];

export default function HowItWorksContent() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            How <span className="text-primary">PromptForge</span> Works
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Follow these simple steps to transform your initial spark of an idea into a tangible app concept, ready for development.
          </p>
        </div>

        <div className="space-y-12 md:space-y-16">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className={`overflow-hidden shadow-xl border border-border/20 rounded-xl transition-all duration-300 hover:shadow-2xl group ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
            >
              <div className={`grid md:grid-cols-2 items-center gap-0 ${index % 2 === 0 ? '' : 'md:grid-flow-col-dense'}`}>
                <div className={`relative h-64 md:h-full w-full ${index % 2 === 0 ? 'md:order-last' : ''}`}>
                  <Image
                    src={step.imageSrc}
                    alt={step.imageAlt}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint={step.aiHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent md:bg-none"></div>
                </div>
                <div className="p-6 md:p-10 lg:p-12">
                  {step.icon}
                  <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-3">{step.title}</CardTitle>
                  <CardDescription className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 md:mt-24">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-6">
                Ready to Start Forging?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Experience the streamlined process yourself and see how PromptForge can accelerate your app development journey.
            </p>
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow px-10 py-6 text-lg">
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

