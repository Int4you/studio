
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import Image from 'next/image';

const HeroSection = React.memo(() => {
  return (
    <section className="py-24 md:py-32 lg:py-40 bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-muted/10 dark:to-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-8 text-center md:text-left">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              AI-Powered App Prototyping
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Forge Your App Vision into <span className="text-primary">Reality</span>, Instantly.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              PromptForge utilizes cutting-edge AI to transform your ideas into detailed concepts, stunning mockups, and developer-ready prompts. Accelerate your innovation lifecycle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <Button asChild size="lg" className="shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 px-8 py-6 text-base">
                <Link href="/dashboard">
                  Start Forging Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {/* Learn More button removed */}
            </div>
          </div>
          <div className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/20 group transform transition-all duration-500 hover:scale-105 hover:shadow-primary/20">
            <Image 
              src="https://images.unsplash.com/photo-1523206489230-c012c64b2b48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxM3x8YXBwfGVufDB8fHx8MTc0NzI0NDc2NHww&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Mobile phone displaying an app icon, symbolizing app creation" 
              layout="fill"
              objectFit="cover"
              className="transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
              data-ai-hint="phone app"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-black/20 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
             <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8 p-3 md:p-4 bg-black/60 backdrop-blur-md rounded-lg text-white shadow-xl">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-yellow-400 inline-block mr-2" />
                <span className="font-semibold text-sm md:text-base">Powered by Generative AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;

