import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Turn Ideas into <span className="text-primary">Reality</span>, Faster.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              PromptForge empowers you to rapidly prototype and visualize your app concepts. From idea generation to detailed proposals and mockups, accelerate your development workflow with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="shadow-md hover:shadow-lg transition-shadow">
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/20 group">
            <Image 
              src="https://picsum.photos/seed/techfuture/1280/720" 
              alt="Abstract representation of AI and creativity" 
              layout="fill"
              objectFit="cover"
              className="transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
              data-ai-hint="abstract technology"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
             <div className="absolute bottom-6 left-6 p-4 bg-black/50 backdrop-blur-sm rounded-lg text-white">
                <Zap className="h-6 w-6 text-yellow-400 inline-block mr-2" />
                <span className="font-semibold">AI-Powered Innovation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
