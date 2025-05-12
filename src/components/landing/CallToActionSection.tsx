import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function CallToActionSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
          Ready to Forge Your Next Big Idea?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Join PromptForge today and start building the future, one prompt at a time.
          Experience the power of AI-assisted app development.
        </p>
        <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow px-10 py-6 text-lg">
          <Link href="/dashboard">
            Start Forging Now
          </Link>
        </Button>
      </div>
    </section>
  );
}
