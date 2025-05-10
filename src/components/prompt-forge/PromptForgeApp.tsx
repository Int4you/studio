/* eslint-disable @next/next/no-img-element */
"use client";

import type { GenerateApplicationIdeasOutput } from '@/ai/flows/generate-application-ideas';
import { generateApplicationIdeas } from '@/ai/flows/generate-application-ideas';
import { generateDetailedProposal } from '@/ai/flows/generate-detailed-proposal';
import type { GenerateMockupInput, GenerateMockupOutput } from '@/ai/flows/generate-mockup-flow';
import { generateMockup } from '@/ai/flows/generate-mockup-flow';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, Wand2, FileText, ListChecks, Palette, Cpu, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, UploadCloud } from 'lucide-react';
import type { GenerateApplicationIdeasInput } from '@/ai/flows/generate-application-ideas';
import type { GenerateDetailedProposalInput, GenerateDetailedProposalOutput as ProposalOutput } from '@/ai/flows/generate-detailed-proposal';


interface Idea {
  title: string;
  description: string;
}

interface CoreFeature {
  feature: string;
  description: string;
}

interface UiUxGuideline {
  category: string;
  guideline: string;
}

interface Proposal extends ProposalOutput {} 

interface GroupedUiUxGuidelines {
  [category: string]: UiUxGuideline[];
}

export default function PromptForgeApp() {
  const [prompt, setPrompt] = useState<string>('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [mockupImages, setMockupImages] = useState<string[] | null>(null);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [isLoadingProposal, setIsLoadingProposal] = useState<boolean>(false);
  const [isLoadingMockup, setIsLoadingMockup] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [referenceImageDataUri, setReferenceImageDataUri] = useState<string | null>(null);
  const [referenceImageInputKey, setReferenceImageInputKey] = useState<string>(`ref-img-${Date.now()}`);


  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleReferenceImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReferenceImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReferenceImageFile(null);
      setReferenceImageDataUri(null);
    }
  };

  const resetReferenceImage = () => {
    setReferenceImageFile(null);
    setReferenceImageDataUri(null);
    setReferenceImageInputKey(`ref-img-${Date.now()}`);
  };

  const handleGenerateIdeas = async (event: FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate ideas.');
      return;
    }
    setIsLoadingIdeas(true);
    setError(null);
    setIdeas([]);
    setSelectedIdea(null);
    setProposal(null);
    setMockupImages(null);
    resetReferenceImage();


    try {
      const input: GenerateApplicationIdeasInput = { prompt };
      const result: GenerateApplicationIdeasOutput = await generateApplicationIdeas(input);
      setIdeas(result.ideas || []);
      if (!result.ideas || result.ideas.length === 0) {
        toast({
          title: "No ideas generated",
          description: "The AI didn't return any ideas for your prompt. Try refining it.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error generating ideas:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate ideas: ${errorMessage}`);
      toast({
        title: "Error Generating Ideas",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setProposal(null); 
    setMockupImages(null);
    setError(null); 
    // Keep reference image if user wants to use it for a new idea's proposal
  };

  const handleGenerateProposal = async () => {
    if (!selectedIdea) return;
    setIsLoadingProposal(true);
    setError(null);
    setProposal(null);
    setMockupImages(null);
    // Keep reference image if user wants to use it for mockups of this proposal

    try {
      const input: GenerateDetailedProposalInput = { idea: selectedIdea.title + ": " + selectedIdea.description };
      const result: ProposalOutput = await generateDetailedProposal(input);
      setProposal(result);
    } catch (err) {
      console.error('Error generating proposal:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate proposal: ${errorMessage}`);
      toast({
        title: "Error Generating Proposal",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingProposal(false);
    }
  };

  const handleGenerateMockup = async () => {
    if (!proposal) return;
    setIsLoadingMockup(true);
    setError(null);
    setMockupImages(null);

    try {
      const input: GenerateMockupInput = {
        appName: proposal.appName,
        coreFeatures: proposal.coreFeatures,
        uiUxGuidelines: proposal.uiUxGuidelines,
        ...(referenceImageDataUri && { referenceImageDataUri: referenceImageDataUri }),
      };
      const result: GenerateMockupOutput = await generateMockup(input);
      setMockupImages(result.mockupImageUrls);
       if (!result.mockupImageUrls || result.mockupImageUrls.length === 0) {
        toast({
          title: "No Mockups Generated",
          description: "The AI didn't return any mockups. You might want to try again, adjust the proposal, or add/change the reference image.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error generating mockup:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate mockup: ${errorMessage}`);
      toast({
        title: "Error Generating Mockup",
        description: `An error occurred while generating the mockup: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMockup(false);
    }
  };


  const groupUiUxGuidelines = (guidelines: UiUxGuideline[]): GroupedUiUxGuidelines => {
    return guidelines.reduce((acc, guideline) => {
      const { category } = guideline;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(guideline);
      return acc;
    }, {} as GroupedUiUxGuidelines);
  };
  
  const groupedUiUxGuidelines = proposal ? groupUiUxGuidelines(proposal.uiUxGuidelines) : {};

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-12">
      <header className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Cpu className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-teal-400 text-transparent bg-clip-text">
            PromptForge
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Craft brilliant application ideas, detailed proposals, and visual mockups with the power of AI.
        </p>
      </header>

      <section id="idea-generation" className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lightbulb className="text-primary" />
              <span>Generate Application Ideas</span>
            </CardTitle>
            <CardDescription>Enter a prompt to brainstorm innovative app concepts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateIdeas} className="space-y-4">
              <Textarea
                placeholder="Describe the type of application you want to build, e.g., 'A mobile app for local community gardening'"
                value={prompt}
                onChange={handlePromptChange}
                rows={4}
                className="resize-none text-base"
                aria-label="Application idea prompt"
              />
              <Button type="submit" disabled={isLoadingIdeas} className="w-full sm:w-auto">
                {isLoadingIdeas ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Ideas
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoadingIdeas && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Generating ideas...</p>
          </div>
        )}

        {ideas.length > 0 && !isLoadingIdeas && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Choose an Idea:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, index) => (
                <Card 
                  key={index} 
                  onClick={() => handleSelectIdea(idea)} 
                  className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xl hover:border-primary ${selectedIdea?.title === idea.title ? 'border-primary ring-2 ring-primary shadow-xl' : 'border-border'}`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedIdea && (
        <section id="proposal-generation" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="text-primary" />
                <span>Detailed Application Proposal</span>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2">
                <CheckCircle2 className="text-green-500 h-5 w-5" /> 
                Selected Idea: <span className="font-semibold">{selectedIdea.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateProposal} disabled={isLoadingProposal || !selectedIdea} className="w-full sm:w-auto">
                {isLoadingProposal ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Detailed Proposal
              </Button>
            </CardContent>
          </Card>
          
          {isLoadingProposal && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Generating proposal...</p>
            </div>
          )}

          {proposal && !isLoadingProposal && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <CardTitle className="text-3xl font-bold text-primary">{proposal.appName}</CardTitle>
                </div>
                <CardDescription>Your generated application name and details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold mb-3">
                    <ListChecks className="text-primary" /> Core Features
                  </h3>
                  <Accordion type="multiple" className="w-full space-y-2" defaultValue={proposal.coreFeatures.map((_, index) => `feature-${index}`)}>
                    {proposal.coreFeatures.map((feature, index) => (
                      <AccordionItem key={index} value={`feature-${index}`} className="bg-background rounded-md border px-4">
                        <AccordionTrigger className="text-base hover:no-underline">{feature.feature}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pb-4">
                          {feature.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold mb-3">
                    <Palette className="text-primary" /> UI/UX Guidelines
                  </h3>
                  <Accordion type="multiple" className="w-full space-y-2" defaultValue={Object.keys(groupedUiUxGuidelines).map((_,index) => `category-${index}` )}>
                    {Object.entries(groupedUiUxGuidelines).map(([category, guidelines], catIndex) => (
                      <AccordionItem key={category} value={`category-${catIndex}`} className="bg-background rounded-md border px-4">
                        <AccordionTrigger className="text-base hover:no-underline">{category}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pb-4">
                          <ul className="list-disc pl-5 space-y-1">
                            {guidelines.map((g, index) => (
                              <li key={index}>{g.guideline}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <UploadCloud className="text-primary" /> Style Reference (Optional)
                    </h3>
                    <div className="space-y-2">
                        <Label htmlFor="reference-image" className="text-sm font-medium text-muted-foreground">
                            Upload an image to guide the mockup&apos;s visual style.
                        </Label>
                        <Input
                            id="reference-image"
                            key={referenceImageInputKey}
                            type="file"
                            accept="image/*"
                            onChange={handleReferenceImageChange}
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {referenceImageDataUri && referenceImageFile && (
                            <div className="mt-2 p-2 border rounded-md bg-muted/50">
                                <p className="text-xs text-muted-foreground mb-1">Selected: {referenceImageFile.name}</p>
                                <img 
                                    src={referenceImageDataUri} 
                                    alt="Reference preview" 
                                    className="h-24 w-auto rounded border shadow-sm"
                                    data-ai-hint="style reference"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                   <Button onClick={handleGenerateMockup} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto">
                    {isLoadingMockup ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="mr-2 h-4 w-4" />
                    )}
                    Generate Mockup
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {isLoadingMockup && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Generating mockup...</p>
        </div>
      )}

      {mockupImages && mockupImages.length > 0 && !isLoadingMockup && (
        <section id="mockup-display" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ImageIcon className="text-primary" />
                <span>Application Mockups</span>
              </CardTitle>
              <CardDescription>Visual concepts for your application. {mockupImages.length} screen(s) generated.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
              {mockupImages.map((imageUrl, index) => (
                <div key={index} className="bg-background p-2 rounded-lg border shadow-sm">
                    <img 
                    src={imageUrl} 
                    alt={`Generated mobile app mockup screen ${index + 1}`} 
                    className="rounded-md border border-border shadow-lg w-full h-auto object-contain"
                    data-ai-hint="mobile mockup"
                    />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
      
      {error && (
        <div role="alert" className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">An error occurred:</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

