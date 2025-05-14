
"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: 'What is PromptForge?',
    answer: 'PromptForge is an AI-powered application prototyping tool designed to help users generate app ideas, detailed proposals, market analyses, feature prioritizations, pricing strategies, and developer-ready prompts for text-to-app tools.',
  },
  {
    question: 'Who is PromptForge for?',
    answer: 'PromptForge is ideal for entrepreneurs, indie developers, product managers, designers, and anyone looking to quickly conceptualize and plan new applications with the help of AI.',
  },
  {
    question: 'How do the project credits work on the Free Tier?',
    answer: 'On the Free Tier, you get a certain number of project credits (e.g., 3). A credit is typically used when you initiate a new app idea through the "Spark Idea" step. Generating subsequent steps (Proposal, Market Analysis, etc.) for that same project does not consume additional credits.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can upgrade from the Free Tier to a Premium plan at any time. Details on downgrading or managing your subscription can be found in your account settings once you sign up.',
  },
  {
    question: 'Is my data secure with PromptForge?',
    answer: 'We take data security seriously. Your project data is stored locally in your browser for quick access. For authenticated users, we plan to offer cloud backup options in the future. Please refer to our Privacy Policy for more details.',
  },
];

const FaqSection = React.memo(() => {
  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/20 dark:bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 shadow-sm mb-4">
            <HelpCircle className="mr-2 h-4 w-4 text-primary" />
            Got Questions?
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border/20 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 text-md font-medium text-left hover:no-underline text-foreground data-[state=open]:text-primary data-[state=open]:border-b data-[state=open]:border-border/30">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-2 text-sm text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
});

FaqSection.displayName = 'FaqSection';
export default FaqSection;
