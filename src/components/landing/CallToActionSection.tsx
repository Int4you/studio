import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';

export default function CallToActionSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <div className="mb-8">
          <Rocket className="h-16 w-16 text-primary mx-auto animate-pulse" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
          Ready to Launch Your Next Masterpiece?
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Stop dreaming, start building. PromptForge is your AI co-pilot for rapid app prototyping.
          Sign up now and experience the future of app development, today.
        </p>
        <Button asChild size="lg" className="shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 px-12 py-7 text-lg">
          <Link href="/dashboard">
            Start Forging Now for Free
          </Link>
        </Button>
      </div>
    </section>
  );
}
