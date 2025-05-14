
"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah L.',
    role: 'Indie Developer',
    quote: "PromptForge cut my initial app planning time in half! The AI-generated proposals are incredibly detailed and a fantastic starting point.",
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwZXJzb258ZW58MHx8fHwxNzQ3MTY2MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    stars: 5,
    hint: "person avatar",
  },
  {
    name: 'Mike P.',
    role: 'Startup Founder',
    quote: "The market analysis feature is a game-changer. It gave us insights we hadn't even considered. Highly recommend!",
    avatarUrl: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8cGVyc29ufGVufDB8fHx8MTc0NzE2NjMyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    stars: 5,
    hint: "person avatar",
  },
  {
    name: 'Alex K.',
    role: 'Product Manager',
    quote: "Generating developer prompts with this tool is brilliant. It makes handoff to the dev team so much smoother. A must-have for agile workflows.",
    avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwZXJzb258ZW58MHx8fHwxNzQ3MTY2MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    stars: 4,
    hint: "person avatar",
  },
];

const TestimonialsSection = React.memo(() => {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16 md:mb-20">
          <Quote className="h-12 w-12 text-primary mx-auto mb-4 opacity-70" />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            Loved by <span className="text-primary">Innovators</span> Worldwide
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear what our users are saying about their experience with PromptForge.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card shadow-lg rounded-xl border border-border/15 overflow-hidden flex flex-col">
              <CardContent className="p-6 md:p-8 flex-grow flex flex-col items-center text-center">
                <Image 
                  src={testimonial.avatarUrl} 
                  alt={testimonial.name}
                  width={80}
                  height={80}
                  className="rounded-full mb-5 shadow-md border-2 border-primary/20"
                  data-ai-hint={testimonial.hint}
                />
                <h3 className="text-lg font-semibold text-foreground mb-0.5">{testimonial.name}</h3>
                <p className="text-xs text-primary font-medium mb-3">{testimonial.role}</p>
                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < testimonial.stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                 "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';
export default TestimonialsSection;

