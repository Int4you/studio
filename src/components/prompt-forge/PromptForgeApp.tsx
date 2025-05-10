/* eslint-disable @next/next/no-img-element */
"use client";

import type { GenerateApplicationIdeasOutput } from '@/ai/flows/generate-application-ideas';
import { generateApplicationIdeas } from '@/ai/flows/generate-application-ideas';
import { generateDetailedProposal } from '@/ai/flows/generate-detailed-proposal';
import type { GenerateMockupInput, GenerateMockupOutput } from '@/ai/flows/generate-mockup-flow';
import { generateMockup } from '@/ai/flows/generate-mockup-flow';
import type { GenerateTextToAppPromptInput, GenerateTextToAppPromptOutput } from '@/ai/flows/generate-text-to-app-prompt';
import { generateTextToAppPrompt } from '@/ai/flows/generate-text-to-app-prompt';

import { useState, type ChangeEvent, type FormEvent, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, Wand2, FileText, ListChecks, Palette, Cpu, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, UploadCloud, RefreshCw, Plus, Terminal, Copy, PlusCircle, XCircle, Pencil } from 'lucide-react';
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

export default function PromptForgeApp() {
  const [prompt, setPrompt] = useState<string>('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [mockupImages, setMockupImages] = useState<string[] | null>(null);
  const [textToAppPrompt, setTextToAppPrompt] = useState<string | null>(null);

  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [isLoadingProposal, setIsLoadingProposal] = useState<boolean>(false);
  const [isLoadingMockup, setIsLoadingMockup] = useState<boolean>(false);
  const [isLoadingTextToAppPrompt, setIsLoadingTextToAppPrompt] = useState<boolean>(false);
  
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
    setTextToAppPrompt(null);
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
    setTextToAppPrompt(null);
    setError(null); 
  };

  const handleGenerateProposal = async () => {
    if (!selectedIdea) return;
    setIsLoadingProposal(true);
    setError(null);
    setProposal(null);
    setMockupImages(null);
    setTextToAppPrompt(null);

    try {
      const input: GenerateDetailedProposalInput = { idea: selectedIdea.title + ": " + selectedIdea.description };
      const result: ProposalOutput = await generateDetailedProposal(input);
      setProposal(result);
    } catch (err) {
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

  // --- Proposal Editing Handlers ---
  const handleAppNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProposal(prev => prev ? { ...prev, appName: event.target.value } : null);
  };

  const handleCoreFeatureChange = (index: number, field: keyof CoreFeature, value: string) => {
    setProposal(prev => {
      if (!prev) return null;
      const updatedFeatures = [...prev.coreFeatures];
      updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
      return { ...prev, coreFeatures: updatedFeatures };
    });
  };

  const addCoreFeature = () => {
    setProposal(prev => {
      if (!prev) return null;
      return { ...prev, coreFeatures: [...prev.coreFeatures, { feature: '', description: '' }] };
    });
  };

  const removeCoreFeature = (index: number) => {
    setProposal(prev => {
      if (!prev) return null;
      return { ...prev, coreFeatures: prev.coreFeatures.filter((_, i) => i !== index) };
    });
  };

  const handleUiUxGuidelineChange = (index: number, field: keyof UiUxGuideline, value: string) => {
    setProposal(prev => {
      if (!prev) return null;
      const updatedGuidelines = [...prev.uiUxGuidelines];
      updatedGuidelines[index] = { ...updatedGuidelines[index], [field]: value };
      return { ...prev, uiUxGuidelines: updatedGuidelines };
    });
  };

  const addUiUxGuideline = () => {
    setProposal(prev => {
      if (!prev) return null;
      return { ...prev, uiUxGuidelines: [...prev.uiUxGuidelines, { category: '', guideline: '' }] };
    });
  };

  const removeUiUxGuideline = (index: number) => {
    setProposal(prev => {
      if (!prev) return null;
      return { ...prev, uiUxGuidelines: prev.uiUxGuidelines.filter((_, i) => i !== index) };
    });
  };
  // --- End Proposal Editing Handlers ---


  const handleGenerateMockup = async (append: boolean = false) => {
    if (!proposal) return;
    setIsLoadingMockup(true);
    setError(null);
    if (!append) {
      setMockupImages(null); 
    }

    try {
      const input: GenerateMockupInput = {
        appName: proposal.appName,
        coreFeatures: proposal.coreFeatures,
        uiUxGuidelines: proposal.uiUxGuidelines,
        ...(referenceImageDataUri && { referenceImageDataUri: referenceImageDataUri }),
      };
      const result: GenerateMockupOutput = await generateMockup(input);
      
      const newImageUrls = result.mockupImageUrls || [];

      if (append) {
        setMockupImages(prev => [...(prev || []), ...newImageUrls]);
      } else {
        setMockupImages(newImageUrls);
      }

       if (newImageUrls.length === 0) {
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

  const handleGenerateTextToAppPrompt = async () => {
    if (!proposal || !selectedIdea) return;
    setIsLoadingTextToAppPrompt(true);
    setError(null);
    setTextToAppPrompt(null);

    try {
      const input: GenerateTextToAppPromptInput = {
        appName: proposal.appName,
        appIdeaDescription: selectedIdea.description,
        coreFeatures: proposal.coreFeatures,
        uiUxGuidelines: proposal.uiUxGuidelines,
      };
      const result: GenerateTextToAppPromptOutput = await generateTextToAppPrompt(input);
      setTextToAppPrompt(result.detailedPrompt);
      toast({
        title: "AI Developer Prompt Generated!",
        description: "Your detailed prompt for Text-to-App tools is ready.",
      });
    } catch (err) {
      console.error('Error generating Text-to-App prompt:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate Text-to-App prompt: ${errorMessage}`);
      toast({
        title: "Error Generating AI Developer Prompt",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTextToAppPrompt(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "The prompt has been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="container mx-auto p-6 md:p-10 max-w-4xl space-y-12">
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Cpu className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            PromptForge
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Craft brilliant application ideas, detailed proposals, visual mockups, and AI developer prompts.
        </p>
      </header>

      <section id="idea-generation" className="space-y-6">
        <Card className="shadow-lg border-border/50 rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/30 dark:bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lightbulb className="text-primary h-6 w-6" />
              <span>Generate Application Ideas</span>
            </CardTitle>
            <CardDescription>Enter a prompt to brainstorm innovative app concepts.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleGenerateIdeas} className="space-y-4">
              <Textarea
                placeholder="Describe the type of application you want to build, e.g., 'A mobile app for local community gardening'"
                value={prompt}
                onChange={handlePromptChange}
                rows={4}
                className="resize-none text-base rounded-md shadow-sm"
                aria-label="Application idea prompt"
              />
              <Button type="submit" disabled={isLoadingIdeas} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
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
            <h2 className="text-xl font-semibold text-foreground/90">Choose an Idea:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, index) => (
                <Card 
                  key={index} 
                  onClick={() => handleSelectIdea(idea)} 
                  className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xl hover:ring-2 hover:ring-primary/50 rounded-lg overflow-hidden ${selectedIdea?.title === idea.title ? 'ring-2 ring-primary shadow-xl border-primary' : 'border-border/50 shadow-md'}`}
                >
                  <CardHeader className="pb-2">
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
          <Card className="shadow-lg border-border/50 rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 dark:bg-muted/10">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="text-primary h-6 w-6" />
                <span>Detailed Application Proposal</span>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2">
                <CheckCircle2 className="text-primary h-5 w-5" /> 
                Selected Idea: <span className="font-semibold">{selectedIdea.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button onClick={handleGenerateProposal} disabled={isLoadingProposal || !selectedIdea} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
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
            <Card className="shadow-lg border-border/50 rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 dark:bg-muted/10">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <Input 
                        type="text"
                        value={proposal.appName}
                        onChange={handleAppNameChange}
                        placeholder="Application Name"
                        className="text-3xl font-bold text-primary bg-transparent border-0 focus:ring-0 p-0 h-auto"
                        aria-label="Application Name"
                    />
                </div>
                <CardDescription>Your application name and details. You can edit them below.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Core Features Editing */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xl font-semibold mb-3 text-foreground/90">
                    <ListChecks className="text-primary h-5 w-5" /> Core Features
                  </h3>
                  {proposal.coreFeatures.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg shadow-sm bg-card space-y-3 relative">
                      <Label htmlFor={`feature-title-${index}`} className="font-medium text-foreground/80">Feature Title</Label>
                      <Input
                        id={`feature-title-${index}`}
                        type="text"
                        value={feature.feature}
                        onChange={(e) => handleCoreFeatureChange(index, 'feature', e.target.value)}
                        placeholder="Feature Title"
                        className="text-base rounded-md"
                      />
                      <Label htmlFor={`feature-desc-${index}`} className="font-medium text-foreground/80">Description</Label>
                      <Textarea
                        id={`feature-desc-${index}`}
                        value={feature.description}
                        onChange={(e) => handleCoreFeatureChange(index, 'description', e.target.value)}
                        placeholder="Feature Description"
                        rows={3}
                        className="text-sm rounded-md"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCoreFeature(index)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-7 w-7"
                        aria-label="Remove feature"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addCoreFeature} variant="outline" className="rounded-md text-sm shadow-sm hover:shadow-md transition-shadow">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Feature
                  </Button>
                </div>

                {/* UI/UX Guidelines Editing */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xl font-semibold mb-3 text-foreground/90">
                    <Palette className="text-primary h-5 w-5" /> UI/UX Guidelines
                  </h3>
                  {proposal.uiUxGuidelines.map((guideline, index) => (
                    <div key={index} className="p-4 border rounded-lg shadow-sm bg-card space-y-3 relative">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor={`guideline-cat-${index}`} className="font-medium text-foreground/80">Category</Label>
                                <Input
                                    id={`guideline-cat-${index}`}
                                    type="text"
                                    value={guideline.category}
                                    onChange={(e) => handleUiUxGuidelineChange(index, 'category', e.target.value)}
                                    placeholder="Guideline Category (e.g., Color)"
                                    className="text-sm rounded-md"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`guideline-text-${index}`} className="font-medium text-foreground/80">Guideline</Label>
                                <Input
                                    id={`guideline-text-${index}`}
                                    type="text"
                                    value={guideline.guideline}
                                    onChange={(e) => handleUiUxGuidelineChange(index, 'guideline', e.target.value)}
                                    placeholder="Guideline Text"
                                    className="text-sm rounded-md"
                                />
                            </div>
                       </div>
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUiUxGuideline(index)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-7 w-7"
                        aria-label="Remove guideline"
                       >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addUiUxGuideline} variant="outline" className="rounded-md text-sm shadow-sm hover:shadow-md transition-shadow">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Guideline
                  </Button>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-border/30">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground/90">
                        <UploadCloud className="text-primary h-5 w-5" /> Style Reference (Optional)
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
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 rounded-md shadow-sm"
                        />
                        {referenceImageDataUri && referenceImageFile && (
                            <div className="mt-3 p-3 border rounded-lg bg-muted/20 dark:bg-muted/10 shadow-sm">
                                <p className="text-xs text-muted-foreground mb-1.5">Selected: {referenceImageFile.name}</p>
                                <img 
                                    src={referenceImageDataUri} 
                                    alt="Reference preview" 
                                    className="h-24 w-auto rounded-md border shadow-sm"
                                    data-ai-hint="style reference"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6">
                   <Button onClick={() => handleGenerateMockup(false)} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
                    {isLoadingMockup && !mockupImages ? ( 
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

      {isLoadingMockup && (!mockupImages || mockupImages.length === 0) && ( 
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Generating mockup...</p>
        </div>
      )}

      {mockupImages && mockupImages.length > 0 && (
        <section id="mockup-display" className="space-y-6">
          <Card className="shadow-lg border-border/50 rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 dark:bg-muted/10">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ImageIcon className="text-primary h-6 w-6" />
                <span>Application Mockups</span>
              </CardTitle>
              <CardDescription>
                Visual concepts for your application. {mockupImages.length} screen(s) generated.
                {isLoadingMockup && " Generating more..."} 
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {mockupImages.map((imageUrl, index) => (
                <div key={index} className="bg-card p-3 rounded-lg border border-border/30 shadow-lg hover:shadow-xl transition-shadow">
                    <img 
                    src={imageUrl} 
                    alt={`Generated mobile app mockup screen ${index + 1}`} 
                    className="rounded-md border border-border/50 w-full h-auto object-contain aspect-[9/19]" 
                    data-ai-hint="mobile mockup"
                    />
                </div>
              ))}
               {isLoadingMockup && mockupImages.length > 0 && ( 
                <div className="col-span-full flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Generating more mockups...</p>
                </div>
              )}
            </CardContent>
            {!isLoadingMockup && ( 
              <CardFooter className="border-t border-border/30 pt-6 p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start bg-muted/30 dark:bg-muted/10">
                <Button onClick={() => handleGenerateMockup(false)} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate New Set
                </Button>
                <Button onClick={() => handleGenerateMockup(true)} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto rounded-md shadow-sm hover:shadow-md transition-shadow" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add More Mockups
                </Button>
              </CardFooter>
            )}
          </Card>
        </section>
      )}

      {proposal && !isLoadingProposal && (
        <section id="text-to-app-prompt-generation" className="space-y-6">
          <Card className="shadow-lg border-border/50 rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 dark:bg-muted/10">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Terminal className="text-primary h-6 w-6" />
                <span>AI Developer Prompt</span>
              </CardTitle>
              <CardDescription>
                Generate a super-detailed prompt for Text-to-App AI tools to code your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button onClick={handleGenerateTextToAppPrompt} disabled={isLoadingTextToAppPrompt || !proposal || !selectedIdea} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
                {isLoadingTextToAppPrompt ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate AI Developer Prompt
              </Button>
            </CardContent>
          
            {isLoadingTextToAppPrompt && (
              <div className="flex justify-center items-center py-8 px-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Generating AI Developer Prompt...</p>
              </div>
            )}

            {textToAppPrompt && !isLoadingTextToAppPrompt && (
              <CardContent className="p-6 pt-0 space-y-4">
                <h3 className="text-lg font-semibold text-foreground/90">Your Generated Text-to-App Prompt:</h3>
                <div className="relative">
                  <Textarea
                    readOnly
                    value={textToAppPrompt}
                    rows={15}
                    className="bg-muted/30 dark:bg-muted/10 resize-y text-sm p-4 pr-12 rounded-md leading-relaxed shadow-inner"
                    aria-label="Generated Text-to-App Prompt"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleCopyToClipboard(textToAppPrompt)}
                    title="Copy to Clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </section>
      )}
      
      {error && (
        <Card role="alert" className="p-4 bg-destructive/10 border-destructive text-destructive rounded-xl shadow-md">
         <CardContent className="flex items-start gap-3 p-0">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
                <CardTitle className="text-base font-semibold text-destructive">An error occurred</CardTitle>
                <CardDescription className="text-sm text-destructive/90">{error}</CardDescription>
            </div>
         </CardContent>
        </Card>
      )}
    </div>
  );
}
