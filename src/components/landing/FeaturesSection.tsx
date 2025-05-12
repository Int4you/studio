import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, Image as ImageIcon, TerminalSquare, TrendingUp } from 'lucide-react'; // Added TrendingUp

const features = [
  {
    icon: <Lightbulb className="h-8 w-8 mb-4 text-primary" />,
    title: 'Idea Generation',
    description: 'Brainstorm innovative application ideas based on your initial prompts.',
  },
  {
    icon: <FileText className="h-8 w-8 mb-4 text-primary" />,
    title: 'Detailed Proposals',
    description: 'Transform selected ideas into comprehensive proposals with core features and UI/UX guidelines.',
  },
  {
    icon: <ImageIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'Visual Mockups',
    description: 'Generate multiple high-fidelity mobile app mockups to visualize your concept, with style referencing.',
  },
  {
    icon: <TerminalSquare className="h-8 w-8 mb-4 text-primary" />,
    title: 'AI Developer Prompts',
    description: 'Create detailed prompts ready for "Text-to-App" AI tools to kickstart development.',
  },
  {
    icon: <TrendingUp className="h-8 w-8 mb-4 text-primary" />, // New Feature
    title: 'Feature Prioritization',
    description: 'AI-powered analysis to rank features by market demand and development effort, guiding your MVP strategy.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything You Need to Innovate
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            PromptForge offers a suite of AI-powered tools to streamline your app creation process from start to finish.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Adjusted grid for 5 items */}
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl border border-border/20 ${features.length === 5 && index === features.length -1 ? 'lg:col-span-1 md:col-span-2 lg:col-start-2' : ''}`} // Center last item if 5
            >
              <CardHeader>
                {feature.icon}
                <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
