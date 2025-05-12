/* eslint-disable @next/next/no-img-element */
"use client";

import type { GenerateApplicationIdeasOutput } from '@/ai/flows/generate-application-ideas';
import { generateApplicationIdeas } from '@/ai/flows/generate-application-ideas';
import { generateDetailedProposal } from '@/ai/flows/generate-detailed-proposal';
import type { GenerateMockupInput, GenerateMockupOutput } from '@/ai/flows/generate-mockup-flow';
import { generateMockup } from '@/ai/flows/generate-mockup-flow';
import type { GenerateTextToAppPromptInput, GenerateTextToAppPromptOutput } from '@/ai/flows/generate-text-to-app-prompt';
import { generateTextToAppPrompt } from '@/ai/flows/generate-text-to-app-prompt';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary, deleteProjectFromLibrary, getProjectById } from '@/lib/libraryService';
import { generateMoreFeatures } from '@/ai/flows/generate-more-features';
import type { GenerateMoreFeaturesInput, GenerateMoreFeaturesOutput } from '@/ai/flows/generate-more-features';


import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Lightbulb, Wand2, FileText, ListChecks, Palette, Cpu, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, UploadCloud, RefreshCw, Plus, Terminal, Copy, PlusCircle, Pencil, Save, Library as LibraryIcon, Trash2, FolderOpen, Check, Bot } from 'lucide-react';
import type { GenerateApplicationIdeasInput } from '@/ai/flows/generate-application-ideas';
import type { GenerateDetailedProposalInput, GenerateDetailedProposalOutput as ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import { format } from 'date-fns';
import Link from 'next/link';


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

type CurrentView = 'app' | 'library';

interface EditingStates {
  appName: boolean;
  coreFeatures: boolean[];
  uiUxGuidelines: boolean[];
}

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
  const [isLoadingMoreFeatures, setIsLoadingMoreFeatures] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [referenceImageDataUri, setReferenceImageDataUri] = useState<string | null>(null);
  const [referenceImageInputKey, setReferenceImageInputKey] = useState<string>(`ref-img-${Date.now()}`);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>('app');

  const [editingStates, setEditingStates] = useState<EditingStates>({
    appName: false,
    coreFeatures: [],
    uiUxGuidelines: [],
  });

  const initializeEditingStates = (currentProposal: Proposal | null) => {
    setEditingStates({
      appName: false,
      coreFeatures: currentProposal ? new Array(currentProposal.coreFeatures.length).fill(false) : [],
      uiUxGuidelines: currentProposal ? new Array(currentProposal.uiUxGuidelines.length).fill(false) : [],
    });
  };
  
  const toggleEditState = (section: keyof EditingStates, indexOrValue: number | boolean, value?: boolean) => {
    setEditingStates(prev => {
      const currentSectionState = prev[section];
      if (Array.isArray(currentSectionState)) {
        const newArrayState = [...currentSectionState];
        if (typeof indexOrValue === 'number') {
          newArrayState[indexOrValue] = typeof value === 'boolean' ? value : !newArrayState[indexOrValue];
        }
        return { ...prev, [section]: newArrayState };
      } else {
        // For non-array states like appName
        return { ...prev, [section]: typeof indexOrValue === 'boolean' ? indexOrValue : !prev[section] };
      }
    });
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedProjects(getProjectsFromLibrary());
    }
  }, []);

  const resetAppState = (clearPrompt = false) => {
    if (clearPrompt) setPrompt('');
    setIdeas([]);
    setSelectedIdea(null);
    setProposal(null);
    setMockupImages(null);
    setTextToAppPrompt(null);
    resetReferenceImage();
    setCurrentProjectId(null);
    setError(null);
    initializeEditingStates(null);
  };

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
    resetAppState(); 


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
    setCurrentProjectId(null);
    initializeEditingStates(null); 
  };

  const handleGenerateProposal = async () => {
    if (!selectedIdea) return;
    setIsLoadingProposal(true);
    setError(null);
    setProposal(null);
    setMockupImages(null);
    setTextToAppPrompt(null);
    initializeEditingStates(null);

    try {
      const input: GenerateDetailedProposalInput = { idea: selectedIdea.title + ": " + selectedIdea.description };
      const result: ProposalOutput = await generateDetailedProposal(input);
      setProposal(result);
      initializeEditingStates(result);
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
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, coreFeatures: [...prevProposal.coreFeatures, { feature: '', description: '' }] };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        coreFeatures: [...prevEditing.coreFeatures, false]
      }));
      return newProposal;
    });
  };

  const removeCoreFeature = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, coreFeatures: prevProposal.coreFeatures.filter((_, i) => i !== index) };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        coreFeatures: prevEditing.coreFeatures.filter((_, i) => i !== index)
      }));
      return newProposal;
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
     setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, uiUxGuidelines: [...prevProposal.uiUxGuidelines, { category: '', guideline: '' }] };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        uiUxGuidelines: [...prevEditing.uiUxGuidelines, false]
      }));
      return newProposal;
    });
  };

  const removeUiUxGuideline = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, uiUxGuidelines: prevProposal.uiUxGuidelines.filter((_, i) => i !== index) };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        uiUxGuidelines: prevEditing.uiUxGuidelines.filter((_, i) => i !== index)
      }));
      return newProposal;
    });
  };

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

  const handleGenerateMoreFeatures = async () => {
    if (!proposal || !selectedIdea) {
      toast({
        title: "Cannot Generate Features",
        description: "A proposal and selected idea are required to generate more features.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingMoreFeatures(true);
    setError(null);

    try {
      const input: GenerateMoreFeaturesInput = {
        appName: proposal.appName,
        appDescription: selectedIdea.description,
        existingFeatures: proposal.coreFeatures,
      };
      const result: GenerateMoreFeaturesOutput = await generateMoreFeatures(input);
      
      if (result.newFeatures && result.newFeatures.length > 0) {
        setProposal(prevProposal => {
          if (!prevProposal) return null;
          
          const existingFeatureTitlesLower = prevProposal.coreFeatures.map(f => f.feature.trim().toLowerCase());
          const trulyNewGeneratedFeatures = result.newFeatures.filter(nf => 
            !existingFeatureTitlesLower.includes(nf.feature.trim().toLowerCase())
          );

          const combinedFeatures = [...prevProposal.coreFeatures, ...trulyNewGeneratedFeatures];
          
          const newFeatureCount = trulyNewGeneratedFeatures.length;

          setEditingStates(prevEditing => ({
            ...prevEditing,
            coreFeatures: [...prevEditing.coreFeatures, ...new Array(newFeatureCount).fill(false)]
          }));

          if (newFeatureCount > 0) {
            toast({
              title: "More Features Generated!",
              description: `${newFeatureCount} new feature ideas added.`,
            });
          } else {
             toast({
              title: "No New Features Added",
              description: "The AI generated features that are already present or very similar. Try refining your existing features or prompt if you need more distinct ideas.",
              variant: "default",
            });
          }
          return { ...prevProposal, coreFeatures: combinedFeatures };
        });
      } else {
        toast({
          title: "No New Features Generated",
          description: "The AI couldn't come up with additional distinct features this time. You can try again.",
          variant: "default",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate more features: ${errorMessage}`);
      toast({
        title: "Error Generating More Features",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMoreFeatures(false);
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

  const handleSaveToLibrary = () => {
    if (!selectedIdea || !proposal) {
      toast({
        title: "Cannot Save Project",
        description: "An idea and a proposal must be generated before saving to the library.",
        variant: "destructive",
      });
      return;
    }

    const projectToSave: SavedProject = {
      id: currentProjectId || `proj-${Date.now()}`, 
      appName: proposal.appName,
      ideaTitle: selectedIdea.title,
      ideaDescription: selectedIdea.description,
      coreFeatures: proposal.coreFeatures,
      uiUxGuidelines: proposal.uiUxGuidelines,
      mockupImageUrls: mockupImages || undefined,
      textToAppPrompt: textToAppPrompt || undefined,
      referenceImageDataUri: referenceImageDataUri || undefined,
      savedAt: new Date().toISOString(),
    };

    saveProjectToLibrary(projectToSave);
    setSavedProjects(getProjectsFromLibrary()); 
    setCurrentProjectId(projectToSave.id); 
    toast({
      title: currentProjectId ? "Project Updated" : "Project Saved",
      description: `${projectToSave.appName} has been ${currentProjectId ? 'updated in' : 'saved to'} your library.`,
    });
  };

  const handleLoadFromLibrary = (projectId: string) => {
    const project = getProjectById(projectId);
    if (project) {
      resetAppState(true); 

      setSelectedIdea({ title: project.ideaTitle, description: project.ideaDescription });
      const loadedProposal = { 
        appName: project.appName, 
        coreFeatures: project.coreFeatures, 
        uiUxGuidelines: project.uiUxGuidelines 
      };
      setProposal(loadedProposal);
      initializeEditingStates(loadedProposal);

      setMockupImages(project.mockupImageUrls || null);
      setTextToAppPrompt(project.textToAppPrompt || null);
      setReferenceImageDataUri(project.referenceImageDataUri || null);
      if (project.referenceImageDataUri) {
        setReferenceImageFile(null); 
      } else {
        resetReferenceImage();
      }
      setCurrentProjectId(project.id);
      setCurrentView('app'); 
      
      toast({
        title: "Project Loaded",
        description: `${project.appName} has been loaded from your library.`,
      });
      
      setTimeout(() => { 
        const proposalSection = document.getElementById('proposal-generation');
        if (proposalSection) {
          proposalSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);

    } else {
      toast({
        title: "Error Loading Project",
        description: "Could not find the selected project in your library.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFromLibrary = (projectId: string) => {
    deleteProjectFromLibrary(projectId);
    setSavedProjects(getProjectsFromLibrary()); 
    if (currentProjectId === projectId) {
        resetAppState(true); 
    }
    toast({
      title: "Project Deleted",
      description: "The project has been removed from your library.",
      variant: "destructive"
    });
  };


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">PromptForge</span>
            </h1>
          </Link>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as CurrentView)} className="w-auto">
            <TabsList className="bg-transparent p-0 border-none">
              <TabsTrigger value="app" className="data-[state=active]:bg-muted data-[state=active]:shadow-none px-3 py-1.5 text-sm font-medium">App</TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-muted data-[state=active]:shadow-none px-3 py-1.5 text-sm font-medium">My Project Library</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-10 max-w-4xl space-y-12 mt-4">
        {currentView === 'app' && (
          <>
            <div className="text-center space-y-2 mb-10">
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Craft brilliant application ideas, detailed proposals, visual mockups, and AI developer prompts.
              </p>
            </div>

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
                      {currentProjectId && <span className="text-xs text-muted-foreground ml-2">(Loaded from Library)</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {!proposal && !isLoadingProposal && (
                      <Button onClick={handleGenerateProposal} disabled={!selectedIdea} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Detailed Proposal
                      </Button>
                    )}
                     {isLoadingProposal && (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="ml-4 text-muted-foreground">Generating proposal...</p>
                        </div>
                    )}

                    {proposal && !isLoadingProposal && (
                      <>
                        {/* App Name Editing */}
                        <Card className="shadow-sm rounded-lg">
                          <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-3">
                            <CardTitle className="text-lg font-semibold">Application Name</CardTitle>
                            {!editingStates.appName ? (
                              <Button onClick={() => toggleEditState('appName', true)} variant="ghost" size="icon" aria-label="Edit App Name" className="h-7 w-7">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button onClick={() => toggleEditState('appName', false)} variant="ghost" size="icon" aria-label="Save App Name" className="h-7 w-7">
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            {editingStates.appName ? (
                              <Input
                                type="text"
                                value={proposal.appName}
                                onChange={handleAppNameChange}
                                placeholder="Enter Application Name"
                                className="text-base"
                              />
                            ) : (
                              <p className="text-base font-medium text-primary">{proposal.appName || "Not set"}</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Core Features Editing */}
                        <Card className="shadow-sm rounded-lg">
                          <CardHeader className="px-4 pt-3 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <ListChecks className="text-primary h-5 w-5" /> Core Features
                              </CardTitle>
                              <Button onClick={addCoreFeature} variant="outline" size="sm" className="rounded-md text-xs">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Feature
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 px-4 pb-4">
                            {proposal.coreFeatures.map((feature, index) => (
                              <Card key={index} className="bg-muted/20 p-3 rounded-md shadow-none border-border/50">
                                <div className="flex justify-between items-start">
                                  {editingStates.coreFeatures[index] ? (
                                    <div className="flex-grow space-y-2 mr-2">
                                      <Label htmlFor={`feature-title-${index}`} className="text-xs font-medium">Title</Label>
                                      <Input
                                        id={`feature-title-${index}`}
                                        value={feature.feature}
                                        onChange={(e) => handleCoreFeatureChange(index, 'feature', e.target.value)}
                                        placeholder="Feature Title"
                                        className="text-sm h-8"
                                      />
                                      <Label htmlFor={`feature-desc-${index}`} className="text-xs font-medium">Description</Label>
                                      <Textarea
                                        id={`feature-desc-${index}`}
                                        value={feature.description}
                                        onChange={(e) => handleCoreFeatureChange(index, 'description', e.target.value)}
                                        placeholder="Feature Description"
                                        rows={2}
                                        className="text-sm min-h-[40px]"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex-grow space-y-0.5 mr-2">
                                      <h4 className="font-medium text-sm text-foreground">{feature.feature || "Untitled Feature"}</h4>
                                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{feature.description || "No description."}</p>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    {editingStates.coreFeatures[index] ? (
                                      <Button onClick={() => toggleEditState('coreFeatures', index, false)} variant="ghost" size="icon" aria-label="Save Feature" className="h-7 w-7">
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                    ) : (
                                      <Button onClick={() => toggleEditState('coreFeatures', index, true)} variant="ghost" size="icon" aria-label="Edit Feature" className="h-7 w-7">
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeCoreFeature(index)}
                                      aria-label="Remove Feature"
                                      disabled={editingStates.coreFeatures[index]}
                                      className="text-muted-foreground hover:text-destructive h-7 w-7"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                            {proposal.coreFeatures.length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-2">No core features added yet.</p>
                            )}
                          </CardContent>
                          <CardFooter className="border-t border-border/30 pt-4 p-4 bg-muted/20 dark:bg-muted/10 flex justify-start">
                            <Button 
                                onClick={handleGenerateMoreFeatures} 
                                variant="outline" 
                                size="sm" 
                                className="rounded-md text-xs"
                                disabled={isLoadingMoreFeatures || !proposal || !selectedIdea}
                            >
                                {isLoadingMoreFeatures ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Bot className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Generate More Feature Ideas
                            </Button>
                          </CardFooter>
                        </Card>

                        {/* UI/UX Guidelines Editing */}
                        <Card className="shadow-sm rounded-lg">
                           <CardHeader className="px-4 pt-3 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Palette className="text-primary h-5 w-5" /> UI/UX Guidelines
                              </CardTitle>
                              <Button onClick={addUiUxGuideline} variant="outline" size="sm" className="rounded-md text-xs">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Guideline
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 px-4 pb-4">
                            {proposal.uiUxGuidelines.map((guideline, index) => (
                              <Card key={index} className="bg-muted/20 p-3 rounded-md shadow-none border-border/50">
                                <div className="flex justify-between items-start">
                                  {editingStates.uiUxGuidelines[index] ? (
                                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2 mr-2">
                                      <div>
                                        <Label htmlFor={`guideline-cat-${index}`} className="text-xs font-medium">Category</Label>
                                        <Input
                                          id={`guideline-cat-${index}`}
                                          value={guideline.category}
                                          onChange={(e) => handleUiUxGuidelineChange(index, 'category', e.target.value)}
                                          placeholder="e.g., Color"
                                          className="text-sm h-8"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`guideline-text-${index}`} className="text-xs font-medium">Guideline</Label>
                                        <Input
                                          id={`guideline-text-${index}`}
                                          value={guideline.guideline}
                                          onChange={(e) => handleUiUxGuidelineChange(index, 'guideline', e.target.value)}
                                          placeholder="Guideline Text"
                                          className="text-sm h-8"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex-grow space-y-0.5 mr-2">
                                      <h4 className="font-medium text-sm text-foreground">{guideline.category || "Uncategorized"}</h4>
                                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{guideline.guideline || "No guideline text."}</p>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    {editingStates.uiUxGuidelines[index] ? (
                                      <Button onClick={() => toggleEditState('uiUxGuidelines', index, false)} variant="ghost" size="icon" aria-label="Save Guideline" className="h-7 w-7">
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                    ) : (
                                      <Button onClick={() => toggleEditState('uiUxGuidelines', index, true)} variant="ghost" size="icon" aria-label="Edit Guideline" className="h-7 w-7">
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeUiUxGuideline(index)}
                                      aria-label="Remove Guideline"
                                      disabled={editingStates.uiUxGuidelines[index]}
                                      className="text-muted-foreground hover:text-destructive h-7 w-7"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                            {proposal.uiUxGuidelines.length === 0 && (
                               <p className="text-xs text-muted-foreground text-center py-2">No UI/UX guidelines added yet.</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Reference Image Upload */}
                        <Card className="shadow-sm rounded-lg">
                          <CardHeader className="px-4 pt-3 pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <UploadCloud className="text-primary h-5 w-5" /> Style Reference (Optional)
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                              <Label htmlFor="reference-image" className="text-xs font-medium text-muted-foreground">
                                  Upload an image to guide the mockup&apos;s visual style.
                              </Label>
                              <Input
                                  id="reference-image"
                                  key={referenceImageInputKey}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleReferenceImageChange}
                                  className="mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 rounded-md shadow-sm h-10"
                              />
                              {referenceImageDataUri && (
                                  <div className="mt-3 p-2 border rounded-md bg-muted/20 dark:bg-muted/10 shadow-sm">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        {referenceImageFile ? `Selected: ${referenceImageFile.name}` : 'Current reference image:'}
                                      </p>
                                      <img 
                                          src={referenceImageDataUri} 
                                          alt="Reference preview" 
                                          className="h-20 w-auto rounded border shadow-sm"
                                          data-ai-hint="style reference"
                                      />
                                  </div>
                              )}
                          </CardContent>
                        </Card>

                        {/* Mockup Generation Trigger */}
                        <div className="pt-2 flex flex-wrap gap-3">
                          <Button onClick={() => handleGenerateMockup(false)} disabled={isLoadingMockup || !proposal} className="rounded-md shadow-md hover:shadow-lg transition-shadow text-sm">
                            {isLoadingMockup && !mockupImages ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ImageIcon className="mr-2 h-4 w-4" />
                            )}
                            Generate Mockup
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
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
                      <Button onClick={() => handleGenerateMockup(false)} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto rounded-md shadow-sm hover:shadow-md transition-shadow text-sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate New Set
                      </Button>
                      <Button onClick={() => handleGenerateMockup(true)} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto rounded-md shadow-sm hover:shadow-md transition-shadow text-sm" variant="outline">
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
                    <Button onClick={handleGenerateTextToAppPrompt} disabled={isLoadingTextToAppPrompt || !proposal || !selectedIdea} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow text-sm">
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
                  <CardFooter className="border-t border-border/30 pt-6 p-6 bg-muted/30 dark:bg-muted/10 flex justify-start">
                      <Button onClick={handleSaveToLibrary} variant="outline" className="rounded-md shadow-sm hover:shadow-md transition-shadow text-sm">
                          <Save className="mr-2 h-4 w-4" /> {currentProjectId ? "Update Project in Library" : "Save Project to Library"}
                      </Button>
                  </CardFooter>
                </Card>
              </section>
            )}
          </>
        )}

        {currentView === 'library' && (
          <section id="library-view-content" className="space-y-6">
            <Card className="shadow-lg border-border/50 rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 dark:bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <LibraryIcon className="text-primary h-6 w-6" />
                  <span>My Project Library</span>
                </CardTitle>
                <CardDescription>View and manage your saved application projects.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {savedProjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Your library is empty. Generate and save a project to see it here.</p>
                ) : (
                  <div className="space-y-4">
                    {savedProjects.map((project) => (
                      <Card key={project.id} className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow ${currentProjectId === project.id ? 'ring-2 ring-primary border-primary' : 'border-border/50'}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl">{project.appName}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            Idea: {project.ideaTitle} | Saved: {format(new Date(project.savedAt), "PPp")}
                          </CardDescription>
                        </CardHeader>
                        {project.mockupImageUrls && project.mockupImageUrls.length > 0 && (
                            <CardContent className="py-0 px-6 flex gap-2 mb-3">
                                {project.mockupImageUrls.slice(0,3).map((url, idx)=>( 
                                    <img key={idx} src={url} alt={`Mockup preview ${idx+1}`} className="h-16 w-auto rounded border" data-ai-hint="mockup preview" />
                                ))}
                                {project.mockupImageUrls.length > 3 && (
                                    <div className="h-16 w-10 flex items-center justify-center bg-muted/50 rounded border text-xs text-muted-foreground">
                                        +{project.mockupImageUrls.length - 3}
                                    </div>
                                )}
                            </CardContent>
                        )}
                        <CardFooter className="gap-2 pt-0 p-4 border-t bg-muted/20 dark:bg-muted/10">
                          <Button variant="outline" size="sm" onClick={() => handleLoadFromLibrary(project.id)} className="rounded-md text-xs">
                            <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> Load
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteFromLibrary(project.id)} className="rounded-md text-xs">
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
        
        {error && (
          <Card role="alert" className="mt-8 p-4 bg-destructive/10 border-destructive text-destructive rounded-xl shadow-md">
          <CardContent className="flex items-start gap-3 p-0">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                  <CardTitle className="text-base font-semibold text-destructive">An error occurred</CardTitle>
                  <CardDescription className="text-sm text-destructive/90">{error}</CardDescription>
              </div>
          </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
