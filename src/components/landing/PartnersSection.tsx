
"use client";

import React from 'react';
import Image from 'next/image';

const partners = [
  { name: "Innovatech", logoUrl: "https://placehold.co/150x50.png", hint: "logo company" },
  { name: "SolutionCorp", logoUrl: "https://placehold.co/160x50.png", hint: "logo business" },
  { name: "SynergyHub", logoUrl: "https://placehold.co/140x50.png", hint: "logo tech" },
  { name: "ApexSolutions", logoUrl: "https://placehold.co/155x50.png", hint: "logo startup" },
  { name: "FutureWorks", logoUrl: "https://placehold.co/145x50.png", hint: "logo innovation" },
];

const PartnersSection = React.memo(() => {
  return (
    <section className="py-12 md:py-20 bg-muted/20 dark:bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8 md:mb-12">
          Trusted by Innovative Companies
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 md:gap-x-12 lg:gap-x-16">
          {partners.map((partner) => (
            <div key={partner.name} className="opacity-70 hover:opacity-100 transition-opacity duration-300">
              <Image 
                src={partner.logoUrl} 
                alt={`${partner.name} logo`}
                width={150}
                height={50}
                className="object-contain h-8 md:h-10"
                data-ai-hint={partner.hint}
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
