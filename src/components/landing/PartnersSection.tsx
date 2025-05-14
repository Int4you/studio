
"use client";

import React from 'react';
import Image from 'next/image';

const partners = [
  { name: "Innovatech", logoUrl: "https://images.unsplash.com/photo-1530018352490-c6eef07fd7e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxsb2dvJTIwY29tcGFueXxlbnwwfHx8fDE3NDcyNDM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { name: "SolutionCorp", logoUrl: "https://images.unsplash.com/photo-1493421419110-74f4e85ba126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dvJTIwYnVzaW5lc3N8ZW58MHx8fHwxNzQ3MjQzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { name: "SynergyHub", logoUrl: "https://images.unsplash.com/photo-1532455140376-0b97d1a2ee15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bG9nbyUyMHRlY2h8ZW58MHx8fHwxNzQ3MjQzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { name: "ApexSolutions", logoUrl: "https://images.unsplash.com/photo-1551263640-1c007852f616?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bG9nbyUyMHN0YXJ0dXB8ZW58MHx8fHwxNzQ3MjQzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { name: "FutureWorks", logoUrl: "https://images.unsplash.com/photo-1684560207594-a68e6b2f6ff1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxsb2dvJTIwaW5ub3ZhdGlvbnxlbnwwfHx8fDE3NDcyNDM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { name: "QuantumLeap", logoUrl: "https://images.unsplash.com/photo-1569605803663-e9337d901ff9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxsb2dvJTIwZGlnaXRhbHxlbnwwfHx8fDE3NDcyNDM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080" },
];

const PartnersSection = React.memo(() => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-muted/10 via-background to-muted/10 dark:from-muted/5 dark:via-background dark:to-muted/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Trusted by <span className="text-primary">Innovative Teams</span> Worldwide
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join leading companies that use PromptForge to accelerate their development lifecycle and bring ideas to market faster.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 items-center justify-items-center">
          {partners.map((partner) => (
            <div key={partner.name} className="opacity-75 hover:opacity-100 transition-opacity duration-300 transform hover:scale-105 flex justify-center">
              <Image 
                src={partner.logoUrl} 
                alt={`${partner.name} logo`}
                width={150}
                height={50}
                className="object-contain h-10 md:h-12"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

PartnersSection.displayName = 'PartnersSection';
export default PartnersSection;
