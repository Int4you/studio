/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react'; // Added explicit React import
import type { GenerateApplicationIdeasOutput } from '@/ai/flows/generate-application-ideas';
import { generateApplicationIdeas } from '@/ai/flows/generate-application-ideas';
import { generateDetailedProposal } from '@/ai/flows/generate-detailed-proposal';
import type { GenerateMockupInput, GenerateMockupOutput } from '@/ai/flows/generate-mockup-flow';
import { generateMockup } from '@/ai/flows/generate-mockup-flow';
import type { GenerateTextToAppPromptInput, GenerateTextToAppPromptOutput } from '@/ai/flows/generate-text-to-app-prompt';
import { generateTextToAppPrompt } from '@/ai/flows/generate-text-to-app-prompt';
import type { GenerateMoreFeaturesInput, GenerateMoreFeaturesOutput } from '@/ai/flows/generate-more-features';
import { generateMoreFeatures } from '@/ai/flows/generate-more-features';
import type { GenerateFeaturePrioritizationInput, GenerateFeaturePrioritizationOutput, PrioritizedFeature } from '@/ai/flows/generate-feature-prioritization';
import { generateFeaturePrioritization } from '@/ai/flows/generate-feature-prioritization';
import type { AnalyzeMarketInput, AnalyzeMarketOutput } from '@/ai/flows/analyze-market-flow';
import { analyzeMarket } from '@/ai/flows/analyze-market-flow';


import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary, deleteProjectFromLibrary, getProjectById } from '@/lib/libraryService';


import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Lightbulb, Wand2, FileText, ListChecks, Palette, Cpu, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, UploadCloud, RefreshCw, Plus, Terminal, Copy, PlusCircle, Pencil, Save, Library as LibraryIcon, Trash2, FolderOpen, Check, Bot, TrendingUp, BadgeHelp, Info, ArrowRight, ChevronDown, ChevronUp, BarChart3, Search, Briefcase, TrendingDown, ThumbsUp, ThumbsDown, DollarSign, Network, Zap, Users, ShieldCheck, BarChartHorizontalBig, Target } from 'lucide-react';
import type { GenerateApplicationIdeasInput } from '@/ai/flows/generate-application-ideas';
import type { GenerateDetailedProposalInput, GenerateDetailedProposalOutput as ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"


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
type AppStep = 'ideas' | 'proposal' | 'marketAnalysis' | 'prioritization' | 'mockups' | 'devPrompt' | 'save';


interface EditingStates {
  appName: boolean;
  coreFeatures: boolean[];
  uiUxGuidelines: boolean[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


// Helper component for segmented display
const SegmentedDisplay = ({ title, value, segments, segmentsLowToHigh = true, icon: Icon }: { title: string, value: string | undefined, segments: string[], segmentsLowToHigh?: boolean, icon?: React.ElementType }) => {
  if (!value) return null;
  const orderedSegments = segmentsLowToHigh ? segments : [...segments].reverse();
  
  return (
    <div className="mb-3 p-3 border border-border/30 rounded-md bg-muted/20 dark:bg-muted/10 shadow-sm">
      <div className="flex items-center text-sm font-medium mb-1.5 text-foreground/90">
        {Icon && <Icon className="h-4 w-4 mr-2 text-primary/80" />}
        {title}:
        <Badge variant="outline" className="ml-2 text-xs">{value}</Badge>
      </div>
      <div className="flex gap-1 mt-1">
        {orderedSegments.map(segment => (
          <div
            key={segment}
            className={cn(
              "flex-1 py-1.5 px-1 text-xs rounded text-center transition-all duration-300 ease-in-out border",
              value.toLowerCase() === segment.toLowerCase()
                ? "bg-primary text-primary-foreground border-primary/50 shadow-md scale-105"
                : "bg-muted/50 text-muted-foreground border-transparent opacity-70"
            )}
          >
            {segment}
          </div>
        ))}
      </div>
    </div>
  );
};


export default function PromptForgeApp() {
  const [prompt, setPrompt] = useState<string>('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<AnalyzeMarketOutput | null>(null);
  const [mockupImages, setMockupImages] = useState<string[] | null>(null);
  const [textToAppPrompt, setTextToAppPrompt] = useState<string | null>(null);
  const [prioritizedFeatures, setPrioritizedFeatures] = useState<PrioritizedFeature[] | null>(null);

  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [isLoadingProposal, setIsLoadingProposal] = useState<boolean>(false);
  const [isLoadingMarketAnalysis, setIsLoadingMarketAnalysis] = useState<boolean>(false);
  const [isLoadingMockup, setIsLoadingMockup] = useState<boolean>(false);
  const [isLoadingTextToAppPrompt, setIsLoadingTextToAppPrompt] = useState<boolean>(false);
  const [isLoadingMoreFeatures, setIsLoadingMoreFeatures] = useState<boolean>(false);
  const [isLoadingPrioritization, setIsLoadingPrioritization] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [referenceImageDataUri, setReferenceImageDataUri] = useState<string | null>(null);
  const [referenceImageInputKey, setReferenceImageInputKey] = useState<string>(`ref-img-${Date.now()}`);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>('app');
  const [currentStep, setCurrentStep] = useState<AppStep>('ideas');


  const [editingStates, setEditingStates] = useState<EditingStates>({
    appName: false,
    coreFeatures: [],
    uiUxGuidelines: [],
  });

  // For accordion sections
  const [openAccordionSections, setOpenAccordionSections] = useState<string[]>(['step-1-ideas']);


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
  
 useEffect(() => {
    const newOpenSections: string[] = [];
    const currentStepAccordionMap: Record<AppStep, string> = {
        ideas: 'step-1-ideas',
        proposal: 'step-2-proposal',
        marketAnalysis: 'step-3-market-analysis',
        prioritization: 'step-4-prioritization',
        mockups: 'step-5-mockups',
        devPrompt: 'step-6-devprompt',
        save: 'step-7-save',
    };
    
    newOpenSections.push(currentStepAccordionMap[currentStep]);

    // Add previously completed steps only if they have data, to allow users to revisit
    if (selectedIdea || ideas.length > 0) newOpenSections.push('step-1-ideas');
    if (proposal) newOpenSections.push('step-2-proposal');
    if (marketAnalysis) newOpenSections.push('step-3-market-analysis');
    if (prioritizedFeatures) newOpenSections.push('step-4-prioritization');
    if (mockupImages && mockupImages.length > 0) newOpenSections.push('step-5-mockups');
    if (textToAppPrompt) newOpenSections.push('step-6-devprompt');
    // 'save' doesn't have its own data to check beyond currentProjectId, handled by currentStep
    
    setOpenAccordionSections(prevOpen => {
      // If starting completely fresh
      if (currentStep === 'ideas' && ideas.length === 0 && !selectedIdea && !proposal && !marketAnalysis && !prioritizedFeatures && !mockupImages && !textToAppPrompt && !currentProjectId) {
          return ['step-1-ideas'];
      }
      // Combine existing user-opened sections with those determined by current step and completed data.
      // This way, if a user manually closes an accordion, it stays closed unless it's the active step or becomes newly relevant.
      // However, for a smoother UX, let's prioritize showing current and already filled steps.
      let updatedOpenSections = [...newOpenSections]; // Start with current step and those with data.
      
      // Add any sections the user manually opened, if they are not already included.
      prevOpen.forEach(sectionId => {
        if (!updatedOpenSections.includes(sectionId)) {
          // Only add if it corresponds to a valid step to avoid stale section IDs
          if (Object.values(currentStepAccordionMap).includes(sectionId)) {
            // updatedOpenSections.push(sectionId); // Re-evaluate if user-closed sections should always stay closed.
                                                  // For now, let's make it more directive based on state.
          }
        }
      });
      return [...new Set(updatedOpenSections)]; 
    });

  }, [currentStep, ideas, selectedIdea, proposal, marketAnalysis, prioritizedFeatures, mockupImages, textToAppPrompt, currentProjectId]);


  const resetAppState = (clearPromptField = false) => {
    if (clearPromptField) setPrompt('');
    setIdeas([]);
    setSelectedIdea(null);
    setProposal(null);
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setMockupImages(null);
    setTextToAppPrompt(null);
    resetReferenceImage();
    setCurrentProjectId(null);
    setError(null);
    initializeEditingStates(null);
    setCurrentStep('ideas');
    setOpenAccordionSections(['step-1-ideas']); // Explicitly set to only the first step
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

  const handleGenerateIdeas = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate ideas.');
      toast({ title: "Prompt Required", description: "Please enter a prompt to generate ideas.", variant: "destructive"});
      return;
    }
    setIsLoadingIdeas(true);
    setIdeas([]); // Clear previous ideas immediately
    setSelectedIdea(null); // Deselect any previously selected idea
    // Clear all subsequent data if generating new ideas
    setProposal(null);
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setMockupImages(null);
    setTextToAppPrompt(null);
    setCurrentProjectId(null); 
    initializeEditingStates(null);


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
      } else {
         setCurrentStep('ideas'); 
         setOpenAccordionSections(['step-1-ideas']); 
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
    // Reset subsequent steps as they depend on the selected idea, unless they are already populated from a loaded project.
    // This check ensures that if a user just clicks on a selected idea without intending to regenerate, data isn't lost.
    // However, if they select a *different* idea, then subsequent data should be cleared.
    if (proposal && (!currentProjectId || (selectedIdea && selectedIdea.title !== idea.title))) {
        setProposal(null);
        setMarketAnalysis(null);
        setPrioritizedFeatures(null);
        setMockupImages(null);
        setTextToAppPrompt(null);
        initializeEditingStates(null);
    }
    setError(null); 
    setCurrentStep('proposal'); 
  };

  const handleGenerateProposal = async () => {
    if (!selectedIdea) {
       toast({ title: "Idea Not Selected", description: "Please select an idea from Step 1 first.", variant: "destructive" });
       setCurrentStep('ideas'); 
       setOpenAccordionSections(['step-1-ideas']);
       return;
    }
    setIsLoadingProposal(true);
    setError(null);
    setProposal(null); 
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setMockupImages(null);
    setTextToAppPrompt(null);
    initializeEditingStates(null);

    try {
      const input: GenerateDetailedProposalInput = { idea: selectedIdea.title + ": " + selectedIdea.description };
      const result: ProposalOutput = await generateDetailedProposal(input);
      setProposal(result);
      initializeEditingStates(result);
      setCurrentStep('marketAnalysis'); 
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
  
  const handleGenerateMarketAnalysis = async () => {
    if (!proposal || !selectedIdea) {
      toast({
        title: "Cannot Analyze Market",
        description: "A selected idea (Step 1) and a generated proposal (Step 2) are required for market analysis.",
        variant: "destructive",
      });
      if (!selectedIdea) setCurrentStep('ideas');
      else if (!proposal) setCurrentStep('proposal');
      setOpenAccordionSections(prev => [...new Set([...prev, proposal ? 'step-2-proposal': 'step-1-ideas'])]);
      return;
    }
    setIsLoadingMarketAnalysis(true);
    setError(null);
    setMarketAnalysis(null);

    try {
      const input: AnalyzeMarketInput = {
        appName: proposal.appName,
        appDescription: selectedIdea.title + ": " + selectedIdea.description,
        coreFeatures: proposal.coreFeatures,
        targetAudience: prompt, 
      };
      const result: AnalyzeMarketOutput = await analyzeMarket(input);
      setMarketAnalysis(result);
      if (!result) {
         toast({
          title: "Market Analysis Complete",
          description: "AI analysis finished, but no specific market data was returned. Review your proposal details.",
          variant: "default",
        });
       } else {
        toast({
          title: "Market Analysis Generated!",
          description: "AI has analyzed the market for your application concept.",
        });
       }
       setCurrentStep('prioritization');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate market analysis: ${errorMessage}`);
      toast({
        title: "Error Generating Market Analysis",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMarketAnalysis(false);
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
      if (field === 'feature' || field === 'description') { // If key aspects change
          setPrioritizedFeatures(null); 
          // setMarketAnalysis(null); // Market analysis also depends on features
          setTextToAppPrompt(null);
      }
      return { ...prev, coreFeatures: updatedFeatures };
    });
  };

  const addCoreFeature = () => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, coreFeatures: [...prevProposal.coreFeatures, { feature: '', description: '' }] };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        coreFeatures: [...prevEditing.coreFeatures, true] 
      }));
      return newProposal;
    });
    setPrioritizedFeatures(null); 
    // setMarketAnalysis(null);
    setTextToAppPrompt(null);
  };

  const removeCoreFeature = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, coreFeatures: prevProposal.coreFeatures.filter((_, i) => i !== index) };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        coreFeatures: prevEditing.coreFeatures.filter((_, i) => i !== index)
      }));
      if (newProposal.coreFeatures.length !== prevProposal.coreFeatures.length) {
          setPrioritizedFeatures(null); 
          // setMarketAnalysis(null);
          setTextToAppPrompt(null);
      }
      return newProposal;
    });
  };

  const handleUiUxGuidelineChange = (index: number, field: keyof UiUxGuideline, value: string) => {
    setProposal(prev => {
      if (!prev) return null;
      const updatedGuidelines = [...prev.uiUxGuidelines];
      updatedGuidelines[index] = { ...updatedGuidelines[index], [field]: value };
      if (field === 'category' || field === 'guideline') { // If key aspects change
          setMockupImages(null);
          setTextToAppPrompt(null);
      }
      return { ...prev, uiUxGuidelines: updatedGuidelines };
    });
  };

  const addUiUxGuideline = () => {
     setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, uiUxGuidelines: [...prevProposal.uiUxGuidelines, { category: '', guideline: '' }] };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        uiUxGuidelines: [...prevEditing.uiUxGuidelines, true] 
      }));
      return newProposal;
    });
    setMockupImages(null);
    setTextToAppPrompt(null);
  };

  const removeUiUxGuideline = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, uiUxGuidelines: prevProposal.uiUxGuidelines.filter((_, i) => i !== index) };
      setEditingStates(prevEditing => ({
        ...prevEditing,
        uiUxGuidelines: prevEditing.uiUxGuidelines.filter((_, i) => i !== index)
      }));
      if (newProposal.uiUxGuidelines.length !== prevProposal.uiUxGuidelines.length) {
        setMockupImages(null);
        setTextToAppPrompt(null);
      }
      return newProposal;
    });
  };

  const handleGenerateMockup = async (append: boolean = false) => {
    if (!proposal) {
      toast({ title: "Proposal Needed", description: "A proposal (Step 2) must be generated first.", variant: "destructive" });
      setCurrentStep('proposal');
      setOpenAccordionSections(prev => [...new Set([...prev, 'step-2-proposal'])]);
      return;
    }
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

       if (newImageUrls.length === 0 && !append) { 
        toast({
          title: "No Mockups Generated",
          description: "The AI didn't return any mockups. You might want to try again, adjust the proposal, or add/change the reference image.",
          variant: "default",
        });
      } else if (newImageUrls.length > 0) {
        setCurrentStep('devPrompt');
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
    if (!proposal || !selectedIdea) {
      toast({ title: "Prerequisites Missing", description: "An idea (Step 1) and proposal (Step 2) are required.", variant: "destructive" });
      if (!selectedIdea) setCurrentStep('ideas');
      else if (!proposal) setCurrentStep('proposal');
      setOpenAccordionSections(prev => [...new Set([...prev, proposal ? 'step-2-proposal': 'step-1-ideas'])]);
      return;
    }
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
      setCurrentStep('save');
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
        description: "A proposal (Step 2) and selected idea (Step 1) are required to generate more features.",
        variant: "destructive",
      });
      if (!selectedIdea) setCurrentStep('ideas');
      else if (!proposal) setCurrentStep('proposal');
      setOpenAccordionSections(prev => [...new Set([...prev, proposal ? 'step-2-proposal': 'step-1-ideas'])]);
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
            coreFeatures: [...prevEditing.coreFeatures, ...new Array(newFeatureCount).fill(true)] 
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
          setPrioritizedFeatures(null); 
          // setMarketAnalysis(null); 
          setTextToAppPrompt(null);
          return { ...prevProposal, coreFeatures: combinedFeatures };
        });
      } else {
        toast({
          title: "No New Features Generated",
          description: "The AI couldn't come up with additional distinct features this time. You can try again.",
          variant: "default",
        });
      }
    } catch (err)
 {
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

  const handleGenerateFeaturePrioritization = async () => {
    if (!proposal || !selectedIdea || proposal.coreFeatures.length === 0) {
      toast({
        title: "Cannot Prioritize Features",
        description: "A proposal (Step 2) with core features and a selected idea (Step 1) are required.",
        variant: "destructive",
      });
      if (!selectedIdea) setCurrentStep('ideas');
      else if (!proposal || proposal.coreFeatures.length === 0) setCurrentStep('proposal');
      setOpenAccordionSections(prev => [...new Set([...prev, proposal && proposal.coreFeatures.length > 0 ? 'step-2-proposal': 'step-1-ideas'])]);
      return;
    }
    setIsLoadingPrioritization(true);
    setError(null);
    setPrioritizedFeatures(null);

    try {
      const input: GenerateFeaturePrioritizationInput = {
        appName: proposal.appName,
        appDescription: selectedIdea.description, 
        coreFeatures: proposal.coreFeatures,
        targetAudience: prompt, 
      };
      const result: GenerateFeaturePrioritizationOutput = await generateFeaturePrioritization(input);
      setPrioritizedFeatures(result.prioritizedFeatures || []);
       if (!result.prioritizedFeatures || result.prioritizedFeatures.length === 0) {
         toast({
          title: "Feature Prioritization Complete",
          description: "AI analysis finished, but no specific prioritization order was determined or no features were returned. Review your feature list.",
          variant: "default",
        });
       } else {
        toast({
          title: "Features Prioritized!",
          description: "AI has analyzed and prioritized your core features.",
        });
       }
       setCurrentStep('mockups');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to prioritize features: ${errorMessage}`);
      toast({
        title: "Error Prioritizing Features",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrioritization(false);
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
        description: "An idea (Step 1) and a proposal (Step 2) must be generated before saving to the library.",
        variant: "destructive",
      });
      if (!selectedIdea) setCurrentStep('ideas');
      else if (!proposal) setCurrentStep('proposal');
      setOpenAccordionSections(prev => [...new Set([...prev, proposal ? 'step-2-proposal': 'step-1-ideas'])]);
      return;
    }

    const projectToSave: SavedProject = {
      id: currentProjectId || `proj-${Date.now()}`, 
      appName: proposal.appName,
      ideaTitle: selectedIdea.title,
      ideaDescription: selectedIdea.description,
      coreFeatures: proposal.coreFeatures,
      uiUxGuidelines: proposal.uiUxGuidelines,
      marketAnalysis: marketAnalysis || undefined,
      prioritizedFeatures: prioritizedFeatures || undefined,
      mockupImageUrls: mockupImages || undefined,
      textToAppPrompt: textToAppPrompt || undefined,
      referenceImageDataUri: referenceImageDataUri || undefined,
      savedAt: new Date().toISOString(),
      originalPrompt: prompt, 
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
      resetAppState(false); 

      setPrompt(project.originalPrompt || project.ideaTitle); 
      setSelectedIdea({ title: project.ideaTitle, description: project.ideaDescription });
      const loadedProposal = { 
        appName: project.appName, 
        coreFeatures: project.coreFeatures, 
        uiUxGuidelines: project.uiUxGuidelines 
      };
      setProposal(loadedProposal);
      initializeEditingStates(loadedProposal);
      setMarketAnalysis(project.marketAnalysis || null);
      setPrioritizedFeatures(project.prioritizedFeatures || null);
      setMockupImages(project.mockupImageUrls || null);
      setTextToAppPrompt(project.textToAppPrompt || null);
      setReferenceImageDataUri(project.referenceImageDataUri || null);
      if (project.referenceImageDataUri) {
        setReferenceImageFile(null); 
      } else {
        resetReferenceImage();
      }
      setCurrentProjectId(project.id);
      
      let resumeStep: AppStep = 'ideas';
      if (project.textToAppPrompt) resumeStep = 'save';
      else if (project.mockupImageUrls && project.mockupImageUrls.length > 0) resumeStep = 'devPrompt';
      else if (project.prioritizedFeatures && project.prioritizedFeatures.length > 0) resumeStep = 'mockups';
      else if (project.marketAnalysis) resumeStep = 'prioritization';
      else if (loadedProposal.coreFeatures && loadedProposal.coreFeatures.length > 0) resumeStep = 'marketAnalysis';
      else if (selectedIdea) resumeStep = 'proposal';
      setCurrentStep(resumeStep);

      setCurrentView('app'); 
      
      toast({
        title: "Project Loaded",
        description: `${project.appName} has been loaded from your library. Resuming at ${resumeStep} step.`,
      });
      
      setTimeout(() => { 
        const stepToAccordionId: Record<AppStep, string> = {
            ideas: 'step-1-ideas',
            proposal: 'step-2-proposal',
            marketAnalysis: 'step-3-market-analysis',
            prioritization: 'step-4-prioritization',
            mockups: 'step-5-mockups',
            devPrompt: 'step-6-devprompt',
            save: 'step-7-save',
        };
        const targetAccordionElement = document.getElementById(stepToAccordionId[resumeStep]);
        if (targetAccordionElement) {
            targetAccordionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else { 
            const firstAccordion = document.getElementById('step-1-ideas');
            firstAccordion?.scrollIntoView({ behavior: 'smooth', block: 'start'});
        }
      }, 100);

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

  const getPriorityBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return "default"; 
    if (score >= 5) return "secondary"; 
    return "destructive"; 
  };

  const getImpactEffortBadgeVariant = (level?: "High" | "Medium" | "Low"): "default" | "secondary" | "outline" => {
    if (level === "High") return "default";
    if (level === "Medium") return "secondary";
    if (level === "Low") return "outline";
    return "outline"; 
  };

  const getRevenuePotentialBadgeVariant = (level?: "Low" | "Medium" | "High" | "Very High" | "Uncertain"): "default" | "secondary" | "outline" | "destructive" => {
    switch (level) {
      case "Very High": return "default"; 
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "outline";
      case "Uncertain": return "destructive";
      default: return "outline";
    }
  };

  const getMarketAttributeBadgeVariant = (level?: "Low" | "Medium" | "High" | "Slow" | "Moderate" | "Rapid" | string ): "default" | "secondary" | "outline" => {
     switch (level) {
      case "High":
      case "Rapid":
        return "default";
      case "Medium":
      case "Moderate":
        return "secondary";
      case "Low":
      case "Slow":
        return "outline";
      default: return "outline";
     }
  };

  const getTrendImpactBadgeVariant = (impact?: "Significant Positive" | "Moderate Positive" | "Neutral" | "Moderate Negative" | "Significant Negative"): "default" | "secondary" | "outline" | "destructive" => {
    switch(impact){
        case "Significant Positive": return "default";
        case "Moderate Positive": return "secondary";
        case "Neutral": return "outline";
        case "Moderate Negative": return "destructive"; 
        case "Significant Negative": return "destructive";
        default: return "outline";
    }
  };
  
  const renderStepIndicator = (stepName: AppStep, stepNumber: number, title: string, Icon: React.ElementType) => {
    const isActive = currentStep === stepName;
    let isCompleted = false;

    switch (stepName) {
        case 'ideas': isCompleted = selectedIdea != null || (ideas.length > 0 && !isLoadingIdeas); break;
        case 'proposal': isCompleted = proposal != null; break;
        case 'marketAnalysis': isCompleted = marketAnalysis != null; break;
        case 'prioritization': isCompleted = prioritizedFeatures != null && prioritizedFeatures.length > 0; break;
        case 'mockups': isCompleted = mockupImages != null && mockupImages.length > 0; break;
        case 'devPrompt': isCompleted = textToAppPrompt != null; break;
        case 'save': isCompleted = currentProjectId != null; break;
    }


    let indicatorClass = "bg-muted border-muted-foreground/30";
    if (isActive) indicatorClass = "bg-primary text-primary-foreground border-primary animate-pulse";
    else if (isCompleted) indicatorClass = "bg-green-500 text-primary-foreground border-green-600";


    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${indicatorClass} transition-colors`}>
                {isCompleted && !isActive ? <Check className="w-5 h-5" /> : stepNumber}
            </div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
                <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                {title}
            </h3>
        </div>
    );
  };

  const renderPrerequisiteMessage = (message: string, requiredStep?: AppStep) => (
    <Card className="border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 p-4 my-4">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-amber-700 dark:text-amber-400 text-base flex items-center gap-2">
          <BadgeHelp className="h-5 w-5" /> Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <p className="text-sm text-amber-600 dark:text-amber-500">{message}</p>
        {requiredStep && (
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                    setCurrentStep(requiredStep);
                    const stepToAccordionId: Record<AppStep, string> = {
                        ideas: 'step-1-ideas', proposal: 'step-2-proposal', marketAnalysis: 'step-3-market-analysis',
                        prioritization: 'step-4-prioritization', mockups: 'step-5-mockups', devPrompt: 'step-6-devprompt', save: 'step-7-save',
                    };
                    setOpenAccordionSections(prev => [...new Set([...prev, stepToAccordionId[requiredStep]])]);
                    setTimeout(()=> document.getElementById(stepToAccordionId[requiredStep])?.scrollIntoView({behavior: 'smooth', block: 'center'}), 50);
                }}
                className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-800/50"
            >
                Go to {requiredStep.charAt(0).toUpperCase() + requiredStep.slice(1).replace('Analysis', ' Analysis').replace('Prompt',' Prompt')} Step <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
            </Button>
        )}
      </CardContent>
    </Card>
  );

  const marketSizeChartData = marketAnalysis ? [
    { name: "Market Size", value: marketAnalysis.marketSizeAndGrowth.estimation, fill: "hsl(var(--chart-1))"},
    { name: "Growth Potential", value: marketAnalysis.marketSizeAndGrowth.potential, fill: "hsl(var(--chart-2))"},
    { name: "Saturation", value: marketAnalysis.marketSizeAndGrowth.marketSaturation, fill: "hsl(var(--chart-3))"},
    { name: "Growth Outlook", value: marketAnalysis.marketSizeAndGrowth.growthRateOutlook, fill: "hsl(var(--chart-4))"},
  ] : [];

  const marketSizeChartConfig = {
    value: { label: "Value" },
    estimation: { label: "Estimation", color: "hsl(var(--chart-1))" },
    potential: { label: "Potential", color: "hsl(var(--chart-2))" },
    saturation: { label: "Saturation", color: "hsl(var(--chart-3))" },
    outlook: { label: "Outlook", color: "hsl(var(--chart-4))" },
  } satisfies Record<string, any>;

  const competitorRevenueChartData = marketAnalysis ? marketAnalysis.potentialCompetitors.map((c,i) => ({
    name: c.name,
    potential: c.estimatedRevenuePotential === "Very High" ? 4 : c.estimatedRevenuePotential === "High" ? 3 : c.estimatedRevenuePotential === "Medium" ? 2 : c.estimatedRevenuePotential === "Low" ? 1 : 0,
    fill: COLORS[i % COLORS.length]
  })) : [];
  
  const competitorRevenueChartConfig = {
     potential: { label: "Revenue Potential Score (0-4)" },
     name: {label: "Competitor"}
  } satisfies Record<string, any>;

  const swotChartData = marketAnalysis ? [
    { name: "Strengths", value: marketAnalysis.swotAnalysis.strengths.length, items: marketAnalysis.swotAnalysis.strengths, fill: "hsl(var(--chart-1))" },
    { name: "Weaknesses", value: marketAnalysis.swotAnalysis.weaknesses.length, items: marketAnalysis.swotAnalysis.weaknesses, fill: "hsl(var(--chart-2))" },
    { name: "Opportunities", value: marketAnalysis.swotAnalysis.opportunities.length, items: marketAnalysis.swotAnalysis.opportunities, fill: "hsl(var(--chart-3))" },
    { name: "Threats", value: marketAnalysis.swotAnalysis.threats.length, items: marketAnalysis.swotAnalysis.threats, fill: "hsl(var(--chart-4))" },
  ] : [];

  const swotChartConfig = {
    value: { label: "Count" },
    Strengths: { label: "Strengths", color: "hsl(var(--chart-1))" },
    Weaknesses: { label: "Weaknesses", color: "hsl(var(--chart-2))" },
    Opportunities: { label: "Opportunities", color: "hsl(var(--chart-3))" },
    Threats: { label: "Threats", color: "hsl(var(--chart-4))" },
  } satisfies Record<string, any>;


  return (
    <React.Fragment>
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">PromptForge</span>
            </h1>
          </Link>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as CurrentView)} className="w-auto">
            <TabsList className="bg-transparent p-0 border-none">
              <TabsTrigger value="app" className="data-[state=active]:bg-muted data-[state=active]:shadow-none px-3 py-1.5 text-sm font-medium">App</TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-muted data-[state=active]:shadow-none px-3 py-1.5 text-sm font-medium">My Project Library ({savedProjects.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-5xl mt-4">
        {currentView === 'app' && (
          <>
            <div className="text-center space-y-3 mb-10 p-6 bg-card border rounded-xl shadow-lg">
              <Wand2 className="h-10 w-10 text-primary mx-auto" />
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Let&apos;s Forge Your Next App
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow the steps below to transform your vision into a tangible app concept.
              </p>
               <Button onClick={() => resetAppState(true)} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Start New Project
              </Button>
            </div>
            
            <Accordion type="multiple" value={openAccordionSections} onValueChange={setOpenAccordionSections} className="w-full space-y-6">
              {/* Step 1: Idea Generation */}
              <AccordionItem value="step-1-ideas" id="step-1-ideas" className="bg-card border rounded-lg shadow-md overflow-hidden">
                <AccordionTrigger className="hover:no-underline p-4 w-full data-[state=open]:border-b data-[state=open]:border-border/50">
                    {renderStepIndicator('ideas', 1, "Spark Your Idea", Lightbulb)}
                </AccordionTrigger>
                <AccordionContent className="p-6">
                  <form onSubmit={handleGenerateIdeas} className="space-y-4">
                    <Label htmlFor="idea-prompt" className="text-sm font-medium">Describe your application idea:</Label>
                    <Textarea
                      id="idea-prompt"
                      placeholder="e.g., 'A mobile app for local community gardening that helps track planting schedules and share harvests.'"
                      value={prompt}
                      onChange={handlePromptChange}
                      rows={4}
                      className="resize-none text-base rounded-md shadow-sm"
                      aria-label="Application idea prompt"
                    />
                    <Button type="submit" disabled={isLoadingIdeas || !prompt.trim()} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
                      {isLoadingIdeas ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Generate Ideas
                    </Button>
                  </form>

                  {isLoadingIdeas && (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="ml-4 text-muted-foreground">Generating ideas...</p>
                    </div>
                  )}

                  {ideas.length > 0 && !isLoadingIdeas && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-semibold text-foreground/90">Choose an Idea:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ideas.map((idea, index) => (
                          <Card 
                            key={index} 
                            onClick={() => handleSelectIdea(idea)} 
                            className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xl hover:ring-2 hover:ring-primary/50 rounded-lg overflow-hidden ${selectedIdea?.title === idea.title ? 'ring-2 ring-primary shadow-xl border-primary' : 'border-border/50 shadow-md'}`}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md">{idea.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">{idea.description}</p>
                            </CardContent>
                            {selectedIdea?.title === idea.title && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                          </Card>
                        ))}
                      </div>
                      {selectedIdea && ( 
                        <Button 
                          onClick={() => { 
                            setCurrentStep('proposal'); 
                            setOpenAccordionSections(prev => [...new Set([...prev, 'step-2-proposal'])]); 
                            setTimeout(() => document.getElementById('step-2-proposal')?.scrollIntoView({behavior: 'smooth', block: 'center'}),50);
                          }} 
                          className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow mt-4"
                        >
                            Next: Craft Proposal <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Step 2: Detailed Proposal */}
              <AccordionItem value="step-2-proposal" id="step-2-proposal" className="bg-card border rounded-lg shadow-md overflow-hidden">
                <AccordionTrigger className="hover:no-underline p-4 w-full data-[state=open]:border-b data-[state=open]:border-border/50">
                    {renderStepIndicator('proposal', 2, "Craft Proposal", FileText)}
                </AccordionTrigger>
                <AccordionContent className="p-6 space-y-6">
                    {!selectedIdea && renderPrerequisiteMessage("Please select an idea from Step 1 to generate a proposal.", 'ideas')}
                    
                    {selectedIdea && !proposal && !isLoadingProposal && (
                      <Button onClick={handleGenerateProposal} disabled={isLoadingProposal} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
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
                    {proposal && (
                      <>
                        <CardDescription className="flex items-center gap-2 pt-0">
                            <CheckCircle2 className="text-green-500 h-5 w-5" /> 
                            Selected Idea: <span className="font-semibold text-foreground">{selectedIdea?.title || "N/A"}</span>
                            {currentProjectId && <span className="text-xs text-muted-foreground ml-2">(Loaded from Library)</span>}
                        </CardDescription>
                        <Card className="shadow-sm rounded-lg border">
                          <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                            <CardTitle className="text-lg font-semibold">Application Name</CardTitle>
                            {!editingStates.appName ? (
                              <Button onClick={() => toggleEditState('appName', true)} variant="ghost" size="icon" aria-label="Edit App Name" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button onClick={() => toggleEditState('appName', false)} variant="ghost" size="icon" aria-label="Save App Name" className="h-7 w-7 text-muted-foreground hover:text-green-600">
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </CardHeader>
                          <CardContent className="px-4 py-4">
                            {editingStates.appName ? (
                              <Input
                                type="text"
                                value={proposal.appName}
                                onChange={handleAppNameChange}
                                placeholder="Enter Application Name"
                                className="text-base rounded-md"
                              />
                            ) : (
                              <p className="text-xl font-semibold text-primary">{proposal.appName || "Not set"}</p>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm rounded-lg border">
                          <CardHeader className="px-4 pt-3 pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <ListChecks className="text-primary h-5 w-5" /> Core Features
                              </CardTitle>
                              <Button onClick={addCoreFeature} variant="outline" size="sm" className="rounded-md text-xs shadow-sm hover:shadow">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Feature
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 px-4 py-4">
                            {proposal.coreFeatures.map((feature, index) => (
                              <Card key={index} className="bg-background p-3 rounded-md shadow-none border">
                                <div className="flex justify-between items-start gap-2">
                                  {editingStates.coreFeatures[index] ? (
                                    <div className="flex-grow space-y-2">
                                      <Label htmlFor={`feature-title-${index}`} className="text-xs font-medium">Title</Label>
                                      <Input
                                        id={`feature-title-${index}`}
                                        value={feature.feature}
                                        onChange={(e) => handleCoreFeatureChange(index, 'feature', e.target.value)}
                                        placeholder="Feature Title"
                                        className="text-sm h-8 rounded-md"
                                      />
                                      <Label htmlFor={`feature-desc-${index}`} className="text-xs font-medium">Description</Label>
                                      <Textarea
                                        id={`feature-desc-${index}`}
                                        value={feature.description}
                                        onChange={(e) => handleCoreFeatureChange(index, 'description', e.target.value)}
                                        placeholder="Feature Description"
                                        rows={2}
                                        className="text-sm min-h-[40px] rounded-md"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex-grow space-y-0.5">
                                      <h4 className="font-medium text-sm text-foreground">{feature.feature || "Untitled Feature"}</h4>
                                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{feature.description || "No description."}</p>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    {editingStates.coreFeatures[index] ? (
                                      <Button onClick={() => toggleEditState('coreFeatures', index, false)} variant="ghost" size="icon" aria-label="Save Feature" className="h-7 w-7 text-muted-foreground hover:text-green-600">
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                    ) : (
                                      <Button onClick={() => toggleEditState('coreFeatures', index, true)} variant="ghost" size="icon" aria-label="Edit Feature" className="h-7 w-7 text-muted-foreground hover:text-primary">
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
                           <CardFooter className="border-t pt-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-b-lg">
                             <Button 
                                onClick={handleGenerateMoreFeatures} 
                                variant="outline" 
                                size="sm" 
                                className="rounded-md text-xs shadow-sm hover:shadow"
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

                        <Card className="shadow-sm rounded-lg border">
                           <CardHeader className="px-4 pt-3 pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Palette className="text-primary h-5 w-5" /> UI/UX Guidelines
                              </CardTitle>
                              <Button onClick={addUiUxGuideline} variant="outline" size="sm" className="rounded-md text-xs shadow-sm hover:shadow">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Guideline
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 px-4 py-4">
                            {proposal.uiUxGuidelines.map((guideline, index) => (
                              <Card key={index} className="bg-background p-3 rounded-md shadow-none border">
                                <div className="flex justify-between items-start gap-2">
                                  {editingStates.uiUxGuidelines[index] ? (
                                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <Label htmlFor={`guideline-cat-${index}`} className="text-xs font-medium">Category</Label>
                                        <Input
                                          id={`guideline-cat-${index}`}
                                          value={guideline.category}
                                          onChange={(e) => handleUiUxGuidelineChange(index, 'category', e.target.value)}
                                          placeholder="e.g., Color"
                                          className="text-sm h-8 rounded-md"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`guideline-text-${index}`} className="text-xs font-medium">Guideline</Label>
                                        <Input
                                          id={`guideline-text-${index}`}
                                          value={guideline.guideline}
                                          onChange={(e) => handleUiUxGuidelineChange(index, 'guideline', e.target.value)}
                                          placeholder="Guideline Text"
                                          className="text-sm h-8 rounded-md"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex-grow space-y-0.5">
                                      <h4 className="font-medium text-sm text-foreground">{guideline.category || "Uncategorized"}</h4>
                                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{guideline.guideline || "No guideline text."}</p>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    {editingStates.uiUxGuidelines[index] ? (
                                      <Button onClick={() => toggleEditState('uiUxGuidelines', index, false)} variant="ghost" size="icon" aria-label="Save Guideline" className="h-7 w-7 text-muted-foreground hover:text-green-600">
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                    ) : (
                                      <Button onClick={() => toggleEditState('uiUxGuidelines', index, true)} variant="ghost" size="icon" aria-label="Edit Guideline" className="h-7 w-7 text-muted-foreground hover:text-primary">
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
                        {proposal.coreFeatures.length > 0 && (
                            <Button 
                                onClick={() => { 
                                  setCurrentStep('marketAnalysis'); 
                                  setOpenAccordionSections(prev => [...new Set([...prev, 'step-3-market-analysis'])]); 
                                  setTimeout(() => document.getElementById('step-3-market-analysis')?.scrollIntoView({behavior: 'smooth', block: 'center'}),50);
                                }}
                                className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow mt-4"
                            >
                                Next: Market Analysis <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                      </>
                    )}
                </AccordionContent>
              </AccordionItem>

              {/* Step 3: Market Analysis */}
              <AccordionItem value="step-3-market-analysis" id="step-3-market-analysis" className="bg-card border rounded-lg shadow-md overflow-hidden">
                  <AccordionTrigger className="hover:no-underline p-4 w-full data-[state=open]:border-b data-[state=open]:border-border/50">
                      {renderStepIndicator('marketAnalysis', 3, "Analyze Market", BarChart3)}
                  </AccordionTrigger>
                  <AccordionContent className="p-6 space-y-6">
                      {(!proposal || !selectedIdea) && renderPrerequisiteMessage("Please complete Steps 1 (Idea) and 2 (Proposal) first.", proposal ? 'proposal' : 'ideas')}
                      
                      {proposal && selectedIdea && !marketAnalysis && !isLoadingMarketAnalysis && (
                          <Button 
                              onClick={handleGenerateMarketAnalysis}
                              disabled={isLoadingMarketAnalysis}
                              className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow"
                          >
                              {isLoadingMarketAnalysis ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                  <Search className="mr-2 h-4 w-4" />
                              )}
                              Analyze Market & Competition (AI)
                          </Button>
                      )}
                      {isLoadingMarketAnalysis && (
                          <div className="flex justify-center items-center py-8">
                              <Loader2 className="h-12 w-12 animate-spin text-primary" />
                              <p className="ml-4 text-muted-foreground">Analyzing market...</p>
                          </div>
                      )}
                      {marketAnalysis && (
                          <div className="space-y-6">
                              <Card className="shadow-sm">
                                  <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                    <CardTitle className="text-xl flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Market Overview</CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{marketAnalysis.marketOverview}</p></CardContent>
                              </Card>
                              
                              <Card className="shadow-sm">
                                  <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                    <CardTitle className="text-xl flex items-center gap-2"><BarChartHorizontalBig className="h-5 w-5 text-primary"/>Market Size & Growth</CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-4 text-sm space-y-3">
                                      <div className="flex items-center gap-2">
                                        <strong className="text-sm">Estimation:</strong> 
                                        <Badge variant={getMarketAttributeBadgeVariant(marketAnalysis.marketSizeAndGrowth.estimation)} className="text-xs">{marketAnalysis.marketSizeAndGrowth.estimation}</Badge>
                                      </div>
                                      <p><strong className="text-sm">Potential:</strong> <span className="text-muted-foreground">{marketAnalysis.marketSizeAndGrowth.potential}</span></p>
                                      <SegmentedDisplay title="Market Saturation" value={marketAnalysis.marketSizeAndGrowth.marketSaturation} segments={["Low", "Medium", "High"]} icon={Users}/>
                                      <SegmentedDisplay title="Growth Outlook" value={marketAnalysis.marketSizeAndGrowth.growthRateOutlook} segments={["Slow", "Moderate", "Rapid"]} icon={TrendingUp}/>
                                      
                                       <Card className="mt-4 shadow-xs">
                                        <CardHeader className="pb-2 pt-3 px-4 bg-muted/10 dark:bg-muted/5 rounded-t-lg">
                                          <CardTitle className="text-base font-medium">Market Attributes Visualization</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-3 pb-4 px-2">
                                          <ChartContainer config={marketSizeChartConfig} className="h-[150px] w-full text-xs">
                                            <BarChart accessibilityLayer data={[
                                                { metric: 'Saturation', value: marketAnalysis.marketSizeAndGrowth.marketSaturation === 'High' ? 3 : marketAnalysis.marketSizeAndGrowth.marketSaturation === 'Medium' ? 2 : 1, fill: "hsl(var(--chart-1))" },
                                                { metric: 'Outlook', value: marketAnalysis.marketSizeAndGrowth.growthRateOutlook === 'Rapid' ? 3 : marketAnalysis.marketSizeAndGrowth.growthRateOutlook === 'Moderate' ? 2 : 1, fill: "hsl(var(--chart-2))" }
                                            ]} layout="vertical" margin={{left:10, right: 10}}>
                                              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                                              <XAxis type="number" dataKey="value" domain={[0,3]} ticks={[0,1,2,3]} tickFormatter={(val) => ['','Low','Med','High'][val]} />
                                              <YAxis type="category" dataKey="metric" width={70} tickLine={false} axisLine={false} />
                                              <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                              />
                                              <Bar dataKey="value" radius={4} barSize={20}>
                                                 {[{value:1},{value:2}].map((entry, index) => (
                                                      <Cell key={`cell-${index}`} fill={entry.value === 1 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"} />
                                                  ))}
                                              </Bar>
                                            </BarChart>
                                          </ChartContainer>
                                        </CardContent>
                                      </Card>
                                  </CardContent>
                              </Card>

                              <Card className="shadow-sm">
                                  <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                    <CardTitle className="text-xl flex items-center gap-2"><Zap className="h-5 w-5 text-primary"/>Market Trends</CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-4 space-y-4">
                                      {marketAnalysis.marketTrends.map((trend, idx) => (
                                          <div key={idx} className="p-3 bg-background dark:bg-muted/20 rounded-md border shadow-sm">
                                              <h5 className="font-semibold text-md mb-1.5 text-foreground/90">{trend.trend}</h5>
                                              <p className="text-xs text-muted-foreground mb-2.5">{trend.description}</p>
                                              <div className="space-y-2">
                                                <SegmentedDisplay title="Relevance to App" value={trend.relevanceToApp} segments={["Low", "Medium", "High"]} icon={Target}/>
                                                <div className="flex items-center gap-2 text-xs">
                                                  <strong className="text-xs">Potential Impact:</strong> 
                                                  <Badge variant={getTrendImpactBadgeVariant(trend.potentialImpactMagnitude)} size="sm">{trend.potentialImpactMagnitude}</Badge>
                                                </div>
                                              </div>
                                          </div>
                                      ))}
                                  </CardContent>
                              </Card>
                               <Card className="shadow-sm">
                                  <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                    <CardTitle className="text-xl flex items-center gap-2"><Network className="h-5 w-5 text-primary"/>Potential Competitors</CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-4 space-y-4">
                                       <ChartContainer config={competitorRevenueChartConfig} className="h-[200px] w-full text-xs mb-6">
                                         <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={competitorRevenueChartData} layout="vertical" margin={{top: 5, right: 20, left: 60, bottom: 5}}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                                <XAxis type="number" domain={[0,4]} ticks={[0,1,2,3,4]} tickFormatter={(value) => ["","Low","Med","High","V.High"][value]} />
                                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                                <Bar dataKey="potential" name="Revenue Potential" radius={4} barSize={25}>
                                                  {competitorRevenueChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                  ))}
                                                </Bar>
                                            </BarChart>
                                          </ResponsiveContainer>
                                       </ChartContainer>
                                      {marketAnalysis.potentialCompetitors.map((competitor, idx) => (
                                          <Accordion key={idx} type="single" collapsible className="w-full border rounded-md overflow-hidden shadow-sm">
                                            <AccordionItem value={`competitor-${idx}`} className="border-b-0">
                                                <AccordionTrigger className="p-3 bg-background dark:bg-muted/20 hover:no-underline hover:bg-muted/30 dark:hover:bg-muted/30 text-md rounded-t-md data-[state=closed]:rounded-b-md">
                                                    <span className="font-semibold">{competitor.name}</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 text-sm space-y-2 bg-background border-t">
                                                    <p><strong>Primary Offering:</strong> <span className="text-muted-foreground">{competitor.primaryOffering}</span></p>
                                                    <div><strong>Strengths:</strong> <ul className="list-disc list-inside text-muted-foreground text-xs ml-4">{competitor.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul></div>
                                                    <div><strong>Weaknesses:</strong> <ul className="list-disc list-inside text-muted-foreground text-xs ml-4">{competitor.weaknesses.map((w,i) => <li key={i}>{w}</li>)}</ul></div>
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                                      <strong>Est. Revenue Potential:</strong> 
                                                      <Badge variant={getRevenuePotentialBadgeVariant(competitor.estimatedRevenuePotential)} className="shadow-sm">
                                                        <DollarSign className="h-3 w-3 mr-1"/>{competitor.estimatedRevenuePotential}
                                                      </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground italic mt-1">Reasoning: {competitor.revenuePotentialReasoning}</p>
                                                </AccordionContent>
                                            </AccordionItem>
                                          </Accordion>
                                      ))}
                                  </CardContent>
                              </Card>
                             
                              <Card className="shadow-sm">
                                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                  <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>SWOT Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm">
                                   <ChartContainer config={swotChartConfig} className="h-[250px] w-full text-xs mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                          <Pie
                                            data={swotChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                          >
                                            {swotChartData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                          </Pie>
                                          <Legend wrapperStyle={{fontSize: "0.7rem"}}/>
                                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        </PieChart>
                                      </ResponsiveContainer>
                                   </ChartContainer>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {[
                                      { title: "Strengths", items: marketAnalysis.swotAnalysis.strengths, Icon: ThumbsUp, color: "text-green-500 dark:text-green-400", bg: "bg-green-50/50 dark:bg-green-900/20 border-green-500/30" },
                                      { title: "Weaknesses", items: marketAnalysis.swotAnalysis.weaknesses, Icon: ThumbsDown, color: "text-red-500 dark:text-red-400", bg: "bg-red-50/50 dark:bg-red-900/20 border-red-500/30" },
                                      { title: "Opportunities", items: marketAnalysis.swotAnalysis.opportunities, Icon: TrendingUp, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50/50 dark:bg-blue-900/20 border-blue-500/30" },
                                      { title: "Threats", items: marketAnalysis.swotAnalysis.threats, Icon: TrendingDown, color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-50/50 dark:bg-orange-900/20 border-orange-500/30" },
                                    ].map(category => (
                                        <Card key={category.title} className={`shadow-sm rounded-lg ${category.bg} border`}>
                                            <CardHeader className="pb-2 pt-3 px-4">
                                                <CardTitle className={`flex items-center gap-2 text-lg font-semibold ${category.color}`}>
                                                    <category.Icon className={`h-5 w-5 ${category.color}`}/>{category.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-3">
                                                <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1 pl-2">
                                                    {category.items.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="shadow-sm">
                                  <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                    <CardTitle className="text-xl">Competitive Landscape Summary</CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{marketAnalysis.competitiveLandscapeSummary}</p></CardContent>
                              </Card>
                              <Card className="shadow-sm">
                                  <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                    <CardTitle className="text-xl">Strategic Recommendations</CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-4">
                                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                                          {marketAnalysis.strategicRecommendations.map((rec, idx) => <li key={idx} className="leading-relaxed">{rec}</li>)}
                                      </ul>
                                  </CardContent>
                              </Card>
                              {currentStep === 'marketAnalysis' && (
                                  <Button 
                                      onClick={() => { 
                                        setCurrentStep('prioritization'); 
                                        setOpenAccordionSections(prev => [...new Set([...prev, 'step-4-prioritization'])]); 
                                        setTimeout(() => document.getElementById('step-4-prioritization')?.scrollIntoView({behavior: 'smooth', block: 'center'}),50);
                                      }}
                                      className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow mt-4"
                                  >
                                      Next: Prioritize Features <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                      )}
                  </AccordionContent>
                </AccordionItem>

              {/* Step 4: Feature Prioritization */}
               <AccordionItem value="step-4-prioritization" id="step-4-prioritization" className="bg-card border rounded-lg shadow-md overflow-hidden">
                    <AccordionTrigger className="hover:no-underline p-4 w-full data-[state=open]:border-b data-[state=open]:border-border/50">
                        {renderStepIndicator('prioritization', 4, "Prioritize Features", TrendingUp)}
                    </AccordionTrigger>
                    <AccordionContent className="p-6 space-y-6">
                        {(!proposal || !selectedIdea || (proposal && proposal.coreFeatures.length === 0)) && 
                         renderPrerequisiteMessage("Please ensure Step 1 (Idea) is complete and Step 2 (Proposal) has core features before prioritizing.", proposal && proposal.coreFeatures.length === 0 ? 'proposal' : 'ideas')}
                        
                        {proposal && selectedIdea && proposal.coreFeatures.length > 0 && !prioritizedFeatures && !isLoadingPrioritization && (
                            <Button 
                                onClick={handleGenerateFeaturePrioritization}
                                disabled={isLoadingPrioritization}
                                className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow"
                            >
                                {isLoadingPrioritization ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-4 w-4" />
                                )}
                                Prioritize Features (AI)
                            </Button>
                        )}
                        {isLoadingPrioritization && (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="ml-4 text-muted-foreground">Prioritizing features...</p>
                            </div>
                        )}
                        {prioritizedFeatures && prioritizedFeatures.length > 0 && (
                            <div className="space-y-4">
                                {prioritizedFeatures.map((pFeature, index) => (
                                <Card key={index} className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg shadow-sm border">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                                    <h4 className="text-lg font-semibold text-foreground">{pFeature.feature}</h4>
                                    <Badge variant={getPriorityBadgeVariant(pFeature.priorityScore)} className="text-sm">
                                        Priority: {pFeature.priorityScore}/10
                                    </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{pFeature.description}</p>
                                    <div className="text-xs space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium">Impact:</span>
                                        <Badge variant={getImpactEffortBadgeVariant(pFeature.estimatedImpact)} size="sm">{pFeature.estimatedImpact}</Badge>
                                        <span className="font-medium sm:ml-2">Effort:</span>
                                        <Badge variant={getImpactEffortBadgeVariant(pFeature.estimatedEffort)} size="sm">{pFeature.estimatedEffort}</Badge>
                                    </div>
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 cursor-help text-primary/70" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p>{pFeature.reasoning}</p>
                                        </TooltipContent>
                                        </Tooltip>
                                        <span className="italic flex-1">{pFeature.reasoning}</span>
                                    </div>
                                    </div>
                                </Card>
                                ))}
                                {currentStep === 'prioritization' && (
                                    <Button 
                                        onClick={() => { 
                                          setCurrentStep('mockups'); 
                                          setOpenAccordionSections(prev => [...new Set([...prev, 'step-5-mockups'])]); 
                                          setTimeout(() => document.getElementById('step-5-mockups')?.scrollIntoView({behavior: 'smooth', block: 'center'}),50);
                                        }}
                                        className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow mt-4"
                                    >
                                        Next: Visualize Mockups <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                         {prioritizedFeatures && prioritizedFeatures.length === 0 && !isLoadingPrioritization && (
                            <p className="text-sm text-muted-foreground">No features were prioritized. Ensure core features are defined in Step 2.</p>
                         )}
                    </AccordionContent>
                </AccordionItem>

              {/* Step 5: Mockup Generation */}
              <AccordionItem value="step-5-mockups" id="step-5-mockups" className="bg-card border rounded-lg shadow-md overflow-hidden">
                    <AccordionTrigger className="hover:no-underline p-4 w-full data-[state=open]:border-b data-[state=open]:border-border/50">
                         {renderStepIndicator('mockups', 5, "Visualize Mockups", ImageIcon)}
                    </AccordionTrigger>
                    <AccordionContent className="p-6 space-y-6">
                        {!proposal && renderPrerequisiteMessage("Please generate a proposal in Step 2 first.", 'proposal')}
                        
                        {proposal && (
                            <>
                            <Card className="shadow-sm rounded-lg border">
                                <CardHeader className="px-4 pt-3 pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <UploadCloud className="text-primary h-5 w-5" /> Style Reference (Optional)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 py-4">
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
                            <div className="pt-2 flex flex-wrap gap-3">
                                <Button onClick={() => handleGenerateMockup(false)} disabled={isLoadingMockup} className="rounded-md shadow-md hover:shadow-lg transition-shadow text-sm">
                                    {isLoadingMockup && (!mockupImages || mockupImages.length === 0) ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    )}
                                    Generate Mockup Screens
                                </Button>
                            </div>
                            </>
                        )}
                        {isLoadingMockup && (!mockupImages || mockupImages.length === 0) && (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="ml-4 text-muted-foreground">Generating mockup screens...</p>
                            </div>
                        )}
                        {mockupImages && mockupImages.length > 0 && (
                             <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {mockupImages.map((imageUrl, index) => (
                                    <div key={index} className="bg-background p-3 rounded-lg border shadow-lg hover:shadow-xl transition-shadow">
                                        <img 
                                        src={imageUrl} 
                                        alt={`Generated mobile app mockup screen ${index + 1}`} 
                                        className="rounded-md border w-full h-auto object-contain aspect-[9/19]" 
                                        data-ai-hint="mobile mockup"
                                        />
                                    </div>
                                    ))}
                                    {isLoadingMockup && mockupImages.length > 0 && ( 
                                    <div className="bg-background p-3 rounded-lg border shadow-lg flex justify-center items-center aspect-[9/19]">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                    )}
                                </div>
                                 {!isLoadingMockup && ( 
                                    <div className="border-t pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start">
                                        <Button onClick={() => handleGenerateMockup(false)} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto rounded-md shadow-sm hover:shadow-md transition-shadow text-sm">
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Generate New Set
                                        </Button>
                                        <Button onClick={() => handleGenerateMockup(true)} disabled={isLoadingMockup || !proposal} className="w-full sm:w-auto rounded-md shadow-sm hover:shadow-md transition-shadow text-sm" variant="outline">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add More Mockups
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                        {proposal && mockupImages && mockupImages.length > 0 && (
                            <Button onClick={() => { 
                              setCurrentStep('devPrompt'); 
                              setOpenAccordionSections(prev => [...new Set([...prev, 'step-6-devprompt'])]); 
                              setTimeout(() => document.getElementById('step-6-devprompt')?.scrollIntoView({behavior: 'smooth', block: 'center'}),50);
                            }} 
                            className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow mt-4">
                                Next: AI Developer Prompt <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </AccordionContent>
                </AccordionItem>

              {/* Step 6: AI Developer Prompt */}
               <AccordionItem value="step-6-devprompt" id="step-6-devprompt" className="bg-card border rounded-lg shadow-md overflow-hidden">
                    <AccordionTrigger className="hover:no-underline p-4 w-full data-[state=open]:border-b data-[state=open]:border-border/50">
                        {renderStepIndicator('devPrompt', 6, "Create Developer Prompt", Terminal)}
                    </AccordionTrigger>
                    <AccordionContent className="p-6 space-y-6">
                        {(!proposal || !selectedIdea) && renderPrerequisiteMessage("Please complete Steps 1 (Idea) and 2 (Proposal) first.", proposal ? 'proposal' : 'ideas')}
                        
                        {proposal && selectedIdea && !textToAppPrompt && !isLoadingTextToAppPrompt && (
                            <Button onClick={handleGenerateTextToAppPrompt} disabled={isLoadingTextToAppPrompt} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow text-sm">
                            {isLoadingTextToAppPrompt ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Generate AI Developer Prompt
                            </Button>
                        )}
                        {isLoadingTextToAppPrompt && (
                            <div className="flex justify-center items-center py-8 px-6">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="ml-4 text-muted-foreground">Generating AI Developer Prompt...</p>
                            </div>
                        )}
                        {textToAppPrompt && (
                            <div className="space-y-4">
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
                             {currentStep === 'devPrompt' && (
                                <Button 
                                    onClick={() => { 
                                      setCurrentStep('save'); 
                                      setOpenAccordionSections(prev => [...new Set([...prev, 'step-7-save'])]); 
                                      setTimeout(() => document.getElementById('step-7-save')?.scrollIntoView({behavior: 'smooth', block: 'center'}),50);
                                    }}
                                    className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow mt-4"
                                >
                                    Next: Save Project <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

              {/* Step 7: Save to Library */}
               <AccordionItem value="step-7-save" id="step-7-save" className="bg-card border rounded-lg shadow-md overflow-hidden">
                    <AccordionTrigger className="hover:no-underline p-4 w-full data-[state=open]:border-b data-[state=open]:border-border/50">
                       {renderStepIndicator('save', 7, "Save Your Project", Save)}
                    </AccordionTrigger>
                    <AccordionContent className="p-6">
                        {(!selectedIdea || !proposal) && renderPrerequisiteMessage("An idea (Step 1) and a proposal (Step 2) are needed to save.", proposal ? 'proposal' : 'ideas')}
                        
                        {selectedIdea && proposal && (
                            <>
                            <p className="text-sm text-muted-foreground mb-4">
                                Your project is ready! Save all generated content to your personal library for future access and iteration.
                            </p>
                            <Button onClick={handleSaveToLibrary} variant="outline" className="rounded-md shadow-sm hover:shadow-md transition-shadow text-sm">
                                <Save className="mr-2 h-4 w-4" /> {currentProjectId ? "Update Project in Library" : "Save Project to Library"}
                            </Button>
                            </>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </>
        )}

        {currentView === 'library' && (
          <section id="library-view-content" className="space-y-6">
            <Card className="shadow-lg border rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 dark:bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <LibraryIcon className="text-primary h-6 w-6" />
                  <span>My Project Library</span>
                </CardTitle>
                <CardDescription>View and manage your saved application projects. ({savedProjects.length} project(s))</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {savedProjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Your library is empty. Generate and save a project to see it here.</p>
                ) : (
                  <div className="space-y-4">
                    {savedProjects.map((project) => (
                      <Card key={project.id} className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow ${currentProjectId === project.id ? 'ring-2 ring-primary border-primary' : ''}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl">{project.appName}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            Idea: {project.ideaTitle} | Saved: {format(new Date(project.savedAt), "PPp")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-0 px-6 flex flex-wrap gap-3 mb-3 items-center">
                            {project.mockupImageUrls && project.mockupImageUrls.slice(0,2).map((url, idx)=>( 
                                <img key={`mockup-${idx}`} src={url} alt={`Mockup preview ${idx+1}`} className="h-16 w-auto rounded border object-contain" data-ai-hint="mockup preview" />
                            ))}
                            {project.mockupImageUrls && project.mockupImageUrls.length > 2 && (
                                <div className="h-16 w-10 flex items-center justify-center bg-muted/50 dark:bg-muted/20 rounded border text-xs text-muted-foreground">
                                    +{project.mockupImageUrls.length - 2}
                                </div>
                            )}
                            <div className="ml-auto self-start mt-1 flex flex-col items-end gap-1">
                                {project.marketAnalysis && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" size="sm">
                                        <BarChart3 className="h-3 w-3 mr-1" /> Market Data
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Market analysis available.</p></TooltipContent>
                                  </Tooltip>
                                )}
                                {project.prioritizedFeatures && project.prioritizedFeatures.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" size="sm">
                                        <TrendingUp className="h-3 w-3 mr-1" /> Prioritized
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Features are prioritized.</p></TooltipContent>
                                  </Tooltip>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2 pt-0 p-4 border-t bg-muted/20 dark:bg-muted/10 rounded-b-lg">
                          <Button variant="outline" size="sm" onClick={() => handleLoadFromLibrary(project.id)} className="rounded-md text-xs shadow-sm hover:shadow">
                            <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> Load
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteFromLibrary(project.id)} className="rounded-md text-xs shadow-sm hover:shadow">
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
          <Card role="alert" className="mt-8 p-4 bg-destructive/10 dark:bg-destructive/20 border-destructive text-destructive rounded-xl shadow-md">
          <CardContent className="flex items-start gap-3 p-0">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                  <CardTitle className="text-base font-semibold text-destructive dark:text-destructive-foreground">{error ? 'An error occurred' : 'Something went wrong'}</CardTitle>
                  <CardDescription className="text-sm text-destructive/90 dark:text-destructive-foreground/80">{error}</CardDescription>
              </div>
          </CardContent>
          </Card>
        )}
      </main>
    </TooltipProvider>
    </React.Fragment>
  );
}

