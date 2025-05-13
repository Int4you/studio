/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react'; 
import type { GenerateApplicationIdeasOutput } from '@/ai/flows/generate-application-ideas';
import { generateApplicationIdeas } from '@/ai/flows/generate-application-ideas';
import type { GenerateDetailedProposalInput, GenerateDetailedProposalOutput as ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import { generateDetailedProposal } from '@/ai/flows/generate-detailed-proposal';
// import type { GenerateMockupInput, GenerateMockupOutput } from '@/ai/flows/generate-mockup-flow'; // Removed
// import { generateMockup } from '@/ai/flows/generate-mockup-flow'; // Removed
import type { GenerateTextToAppPromptInput, GenerateTextToAppPromptOutput } from '@/ai/flows/generate-text-to-app-prompt';
import { generateTextToAppPrompt } from '@/ai/flows/generate-text-to-app-prompt';
import type { GenerateMoreFeaturesInput, GenerateMoreFeaturesOutput } from '@/ai/flows/generate-more-features';
import { generateMoreFeatures } from '@/ai/flows/generate-more-features';
import type { GenerateFeaturePrioritizationInput, GenerateFeaturePrioritizationOutput, PrioritizedFeature } from '@/ai/flows/generate-feature-prioritization';
import { generateFeaturePrioritization } from '@/ai/flows/generate-feature-prioritization';
import type { AnalyzeMarketInput, AnalyzeMarketOutput } from '@/ai/flows/analyze-market-flow';
import { analyzeMarket } from '@/ai/flows/analyze-market-flow';
import type { GeneratePricingStrategyInput, GeneratePricingStrategyOutput } from '@/ai/flows/generate-pricing-strategy-flow'; // Added
import { generatePricingStrategy } from '@/ai/flows/generate-pricing-strategy-flow'; // Added
import type { GenerateRoadmapInput, GenerateRoadmapOutput } from '@/ai/flows/generate-roadmap-flow';
import { generateRoadmap } from '@/ai/flows/generate-roadmap-flow';


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
import { Loader2, Lightbulb, Wand2, FileText, ListChecks, Palette, Cpu, CheckCircle2, AlertCircle, Sparkles, /*Image as ImageIcon, UploadCloud,*/ RefreshCw, Plus, Terminal, Copy, PlusCircle, Pencil, Save, Library as LibraryIcon, Trash2, FolderOpen, Check, Bot, TrendingUp, BadgeHelp, Info, ArrowRight, BarChart3, Search, Briefcase, BarChartHorizontalBig, Network, ShieldCheck, Users, ThumbsUp, ThumbsDown, DollarSign, Target, TrendingDown, Zap, Milestone, CalendarDays, ListOrdered, Route, LogOut, Award, Tag } from 'lucide-react'; // ImageIcon, UploadCloud removed, Tag added
import { useRouter } from 'next/navigation';

import type { GenerateApplicationIdeasInput } from '@/ai/flows/generate-application-ideas';

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

type CurrentView = 'app' | 'roadmap' | 'library';
type AppStep = 'ideas' | 'proposal' | 'marketAnalysis' | 'prioritization' | 'pricingStrategy' | 'devPrompt' | 'save'; // 'mockups' removed, 'pricingStrategy' added


interface EditingStates {
  appName: boolean;
  coreFeatures: boolean[];
  uiUxGuidelines: boolean[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const AUTH_TOKEN_KEY = 'promptForgeAuthToken';

const stepsConfig: { id: AppStep, title: string, icon: React.ElementType, description: string }[] = [
  { id: 'ideas', title: "Spark Idea", icon: Lightbulb, description: "Describe your app idea to get started." },
  { id: 'proposal', title: "Craft Proposal", icon: FileText, description: "Develop a detailed proposal with core features & UI/UX." },
  { id: 'marketAnalysis', title: "Analyze Market", icon: Search, description: "Understand market trends, competitors, and opportunities." },
  { id: 'prioritization', title: "Prioritize Features", icon: TrendingUp, description: "Rank features by impact and effort for your MVP." },
  { id: 'pricingStrategy', title: "Pricing Strategy", icon: Tag, description: "Get AI recommendations for pricing models and tiers." }, // New step
  // { id: 'mockups', title: "Visualize Mockups", icon: ImageIcon, description: "Generate mobile app mockups based on your proposal." }, // Removed
  { id: 'devPrompt', title: "AI Developer Prompt", icon: Terminal, description: "Create a prompt for Text-to-App code generation." },
  { id: 'save', title: "Save Project", icon: Save, description: "Save your complete project to the library." },
];

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
  // const [mockupImages, setMockupImages] = useState<string[] | null>(null); // Removed
  const [textToAppPrompt, setTextToAppPrompt] = useState<string | null>(null);
  const [prioritizedFeatures, setPrioritizedFeatures] = useState<PrioritizedFeature[] | null>(null);
  const [pricingStrategy, setPricingStrategy] = useState<GeneratePricingStrategyOutput | null>(null); // Added
  const [generatedRoadmap, setGeneratedRoadmap] = useState<GenerateRoadmapOutput | null>(null);


  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [isLoadingProposal, setIsLoadingProposal] = useState<boolean>(false);
  const [isLoadingMarketAnalysis, setIsLoadingMarketAnalysis] = useState<boolean>(false);
  // const [isLoadingMockup, setIsLoadingMockup] = useState<boolean>(false); // Removed
  const [isLoadingTextToAppPrompt, setIsLoadingTextToAppPrompt] = useState<boolean>(false);
  const [isLoadingMoreFeatures, setIsLoadingMoreFeatures] = useState<boolean>(false);
  const [isLoadingPrioritization, setIsLoadingPrioritization] = useState<boolean>(false);
  const [isLoadingPricingStrategy, setIsLoadingPricingStrategy] = useState<boolean>(false); // Added
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null); // Removed
  // const [referenceImageDataUri, setReferenceImageDataUri] = useState<string | null>(null); // Removed
  // const [referenceImageInputKey, setReferenceImageInputKey] = useState<string>(`ref-img-${Date.now()}`); // Removed

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>('app');
  const [currentStep, setCurrentStep] = useState<AppStep>('ideas');
  const [selectedProjectForRoadmap, setSelectedProjectForRoadmap] = useState<SavedProject | null>(null);

  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('Free Explorer');


  const [editingStates, setEditingStates] = useState<EditingStates>({
    appName: false,
    coreFeatures: [],
    uiUxGuidelines: [],
  });


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedProjects(getProjectsFromLibrary());
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        setAuthStatus('authenticated');
        setCurrentUserPlan('Free Explorer'); // Default to Free plan on auth
      } else {
        setAuthStatus('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);
  

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
        return { ...prev, [section]: typeof indexOrValue === 'boolean' ? indexOrValue : !prev[section] };
      }
    });
  };

  const resetAppState = (clearPromptField = false) => {
    if (clearPromptField) setPrompt('');
    setIdeas([]);
    setSelectedIdea(null);
    setProposal(null);
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setPricingStrategy(null); // Added
    // setMockupImages(null); // Removed
    setTextToAppPrompt(null);
    setGeneratedRoadmap(null);
    setSelectedProjectForRoadmap(null);
    // resetReferenceImage(); // Removed
    setCurrentProjectId(null);
    setError(null);
    initializeEditingStates(null);
    setCurrentStep('ideas');
  };

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  // const handleReferenceImageChange = (event: ChangeEvent<HTMLInputElement>) => { // Removed
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setReferenceImageFile(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setReferenceImageDataUri(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   } else {
  //     setReferenceImageFile(null);
  //     setReferenceImageDataUri(null);
  //   }
  // };

  // const resetReferenceImage = () => { // Removed
  //   setReferenceImageFile(null);
  //   setReferenceImageDataUri(null);
  //   setReferenceImageInputKey(`ref-img-${Date.now()}`);
  // };

  const handleGenerateIdeas = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate ideas.');
      toast({ title: "Prompt Required", description: "Please enter a prompt to generate ideas.", variant: "destructive"});
      return;
    }
    setIsLoadingIdeas(true);
    setIdeas([]); 
    setSelectedIdea(null); 
    setProposal(null);
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setPricingStrategy(null); // Added
    // setMockupImages(null); // Removed
    setTextToAppPrompt(null);
    setGeneratedRoadmap(null);
    setSelectedProjectForRoadmap(null);
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
    if (proposal && (!currentProjectId || (selectedIdea && selectedIdea.title !== idea.title))) {
        setProposal(null);
        setMarketAnalysis(null);
        setPrioritizedFeatures(null);
        setPricingStrategy(null); // Added
        // setMockupImages(null); // Removed
        setTextToAppPrompt(null);
        setGeneratedRoadmap(null);
        initializeEditingStates(null);
    }
    setError(null); 
    // No auto-advance, user clicks "Next" or step nav
  };

  const handleGenerateProposal = async () => {
    if (!selectedIdea) {
       toast({ title: "Idea Not Selected", description: "Please select an idea from Step 1 first.", variant: "destructive" });
       setCurrentStep('ideas');
       return;
    }
    setIsLoadingProposal(true);
    setError(null);
    setProposal(null); 
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setPricingStrategy(null); // Added
    // setMockupImages(null); // Removed
    setTextToAppPrompt(null);
    setGeneratedRoadmap(null);
    initializeEditingStates(null);

    try {
      const input: GenerateDetailedProposalInput = { idea: selectedIdea.title + ": " + selectedIdea.description };
      const result: ProposalOutput = await generateDetailedProposal(input);
      setProposal(result);
      initializeEditingStates(result);
      // No auto-advance, user clicks "Next" or step nav
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
      return;
    }

    if (proposal.appName.trim() === '') {
      toast({
        title: "App Name Required",
        description: "Please provide an application name in the proposal (Step 2).",
        variant: "destructive",
      });
      setCurrentStep('proposal');
      return;
    }

    const hasIncompleteFeatures = proposal.coreFeatures.some(
      f => f.feature.trim() === '' || f.description.trim() === ''
    );
    if (hasIncompleteFeatures) {
      toast({
        title: "Incomplete Features",
        description: "Please ensure all core features have both a title and a description before generating market analysis.",
        variant: "destructive",
      });
      setCurrentStep('proposal');
      return;
    }

    setIsLoadingMarketAnalysis(true);
    setError(null);
    setMarketAnalysis(null);
    setPricingStrategy(null); // Market analysis might influence pricing

    try {
      const input: AnalyzeMarketInput = {
        appName: proposal.appName,
        appDescription: selectedIdea.title + ": " + selectedIdea.description,
        coreFeatures: proposal.coreFeatures,
        targetAudience: prompt, 
      };
      const result: AnalyzeMarketOutput = await analyzeMarket(input);
      setMarketAnalysis(result);
      toast({
        title: "Market Analysis Generated!",
        description: "AI has analyzed the market for your application concept.",
      });
       // No auto-advance
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
    setProposal(prev => { 
        if (!prev) return null;
        setMarketAnalysis(null);
        setPricingStrategy(null); // Added
        // setMockupImages(null); // Removed
        setTextToAppPrompt(null); 
        setGeneratedRoadmap(null);
        return prev ? { ...prev, appName: event.target.value } : null
    });
  };

  const handleCoreFeatureChange = (index: number, field: keyof CoreFeature, value: string) => {
    setProposal(prev => {
      if (!prev) return null;
      const updatedFeatures = [...prev.coreFeatures];
      updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
      setPrioritizedFeatures(null); 
      setPricingStrategy(null); // Added
      setTextToAppPrompt(null);
      setMarketAnalysis(null); 
      // setMockupImages(null); // Removed
      setGeneratedRoadmap(null);
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
    setPricingStrategy(null); // Added
    setTextToAppPrompt(null);
    setMarketAnalysis(null); 
    // setMockupImages(null); // Removed
    setGeneratedRoadmap(null);
  };

  const removeCoreFeature = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const originalLength = prevProposal.coreFeatures.length;
      const newProposal = { ...prevProposal, coreFeatures: prevProposal.coreFeatures.filter((_, i) => i !== index) };
      
      setEditingStates(prevEditing => ({
        ...prevEditing,
        coreFeatures: prevEditing.coreFeatures.filter((_, i) => i !== index)
      }));

      if (newProposal.coreFeatures.length !== originalLength) {
          setPrioritizedFeatures(null); 
          setPricingStrategy(null); // Added
          setTextToAppPrompt(null);
          setMarketAnalysis(null); 
          // setMockupImages(null); // Removed
          setGeneratedRoadmap(null);
      }
      return newProposal;
    });
  };

  const handleUiUxGuidelineChange = (index: number, field: keyof UiUxGuideline, value: string) => {
    setProposal(prev => {
      if (!prev) return null;
      const updatedGuidelines = [...prev.uiUxGuidelines];
      updatedGuidelines[index] = { ...updatedGuidelines[index], [field]: value };
      // setMockupImages(null); // Removed
      setPricingStrategy(null); // Added
      setTextToAppPrompt(null);
      setGeneratedRoadmap(null);
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
    // setMockupImages(null); // Removed
    setPricingStrategy(null); // Added
    setTextToAppPrompt(null);
    setGeneratedRoadmap(null);
  };

  const removeUiUxGuideline = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const originalLength = prevProposal.uiUxGuidelines.length;
      const newProposal = { ...prevProposal, uiUxGuidelines: prevProposal.uiUxGuidelines.filter((_, i) => i !== index) };

      setEditingStates(prevEditing => ({
        ...prevEditing,
        uiUxGuidelines: prevEditing.uiUxGuidelines.filter((_, i) => i !== index)
      }));

      if (newProposal.uiUxGuidelines.length !== originalLength) {
        // setMockupImages(null); // Removed
        setPricingStrategy(null); // Added
        setTextToAppPrompt(null);
        setGeneratedRoadmap(null);
      }
      return newProposal;
    });
  };

  // handleGenerateMockup and related logic removed

  const handleGenerateTextToAppPrompt = async () => {
    if (!proposal || !selectedIdea) {
      toast({ title: "Prerequisites Missing", description: "An idea (Step 1) and proposal (Step 2) are required.", variant: "destructive" });
      if (!selectedIdea) setCurrentStep('ideas');
      else if (!proposal) setCurrentStep('proposal');
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
            setPrioritizedFeatures(null); 
            setPricingStrategy(null); // Added
            setTextToAppPrompt(null);
            setMarketAnalysis(null);
            // setMockupImages(null); // Removed
            setGeneratedRoadmap(null);
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
      return;
    }
    setIsLoadingPrioritization(true);
    setError(null);
    setPrioritizedFeatures(null);
    setPricingStrategy(null); // Prioritization might affect pricing
    setGeneratedRoadmap(null); // Prioritization changes affect roadmap

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

  const handleGeneratePricingStrategy = async () => {
    if (!proposal || !selectedIdea) {
      toast({
        title: "Cannot Generate Pricing Strategy",
        description: "A proposal (Step 2) and selected idea (Step 1) are required.",
        variant: "destructive",
      });
      if (!selectedIdea) setCurrentStep('ideas');
      else if (!proposal) setCurrentStep('proposal');
      return;
    }
    setIsLoadingPricingStrategy(true);
    setError(null);
    setPricingStrategy(null);

    try {
      const input: GeneratePricingStrategyInput = {
        appName: proposal.appName,
        appDescription: selectedIdea.description,
        coreFeatures: proposal.coreFeatures,
        targetAudience: prompt, // Or a dedicated field if you add one
        marketAnalysisSummary: marketAnalysis ? { // Map relevant parts of marketAnalysis
            marketOverview: marketAnalysis.marketOverview,
            potentialCompetitors: marketAnalysis.potentialCompetitors.map(c => ({
                name: c.name,
                primaryOffering: c.primaryOffering,
                estimatedRevenuePotential: c.estimatedRevenuePotential,
            })),
            marketSizeAndGrowth: marketAnalysis.marketSizeAndGrowth ? {
                estimation: marketAnalysis.marketSizeAndGrowth.estimation,
                potential: marketAnalysis.marketSizeAndGrowth.potential,
                marketSaturation: marketAnalysis.marketSizeAndGrowth.marketSaturation,
            } : undefined,
            swotAnalysis: marketAnalysis.swotAnalysis ? {
                opportunities: marketAnalysis.swotAnalysis.opportunities,
                threats: marketAnalysis.swotAnalysis.threats,
            } : undefined,
            competitiveLandscapeSummary: marketAnalysis.competitiveLandscapeSummary,
        } : null,
        monetizationGoals: "Balanced growth and revenue", // Example, could be a user input
        uniqueSellingPoints: proposal.coreFeatures.filter(f => f.feature.toLowerCase().includes("unique") || f.description.toLowerCase().includes("unique")).map(f => f.feature) // Basic extraction
      };
      const result: GeneratePricingStrategyOutput = await generatePricingStrategy(input);
      setPricingStrategy(result);
      toast({
        title: "Pricing Strategy Generated!",
        description: "AI has provided pricing recommendations.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate pricing strategy: ${errorMessage}`);
      toast({
        title: "Error Generating Pricing Strategy",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPricingStrategy(false);
    }
  };


  const handleRemovePrioritizedFeature = (featureTitle: string) => {
    setPrioritizedFeatures(prev => {
      const updatedFeatures = prev ? prev.filter(f => f.feature !== featureTitle) : null;
      return updatedFeatures;
    });

    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const coreFeatureIndexToRemove = prevProposal.coreFeatures.findIndex(cf => cf.feature === featureTitle);
      
      if (coreFeatureIndexToRemove === -1) return prevProposal; 

      const updatedCoreFeatures = prevProposal.coreFeatures.filter(cf => cf.feature !== featureTitle);
      
      setEditingStates(prevEditing => {
        const updatedEditingCoreFeatures = [...prevEditing.coreFeatures];
        updatedEditingCoreFeatures.splice(coreFeatureIndexToRemove, 1);
        return {
          ...prevEditing,
          coreFeatures: updatedEditingCoreFeatures,
        };
      });
      
      setTextToAppPrompt(null); 
      setMarketAnalysis(null);
      setPricingStrategy(null); // Added
      // setMockupImages(null); // Removed
      setGeneratedRoadmap(null);

      return { ...prevProposal, coreFeatures: updatedCoreFeatures };
    });

    toast({
      title: "Feature Removed",
      description: `"${featureTitle}" has been removed from the prioritization list and proposal. Other dependent data like Market Analysis, Pricing Strategy, Mockups, and Roadmap have been cleared.`,
    });
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedProjectForRoadmap) {
      toast({ title: "No Project Selected", description: "Please select a saved project to generate a roadmap.", variant: "destructive" });
      return;
    }
    setIsLoadingRoadmap(true);
    setGeneratedRoadmap(null);
    setError(null);

    try {
      const featuresForRoadmap = selectedProjectForRoadmap.prioritizedFeatures
        ? selectedProjectForRoadmap.prioritizedFeatures.map(pf => ({
            feature: pf.feature,
            description: pf.description,
            priorityScore: pf.priorityScore,
            estimatedImpact: pf.estimatedImpact,
            estimatedEffort: pf.estimatedEffort,
            reasoning: pf.reasoning,
          }))
        : selectedProjectForRoadmap.coreFeatures.map(cf => ({
            feature: cf.feature,
            description: cf.description,
          }));

      const input: GenerateRoadmapInput = {
        appName: selectedProjectForRoadmap.appName,
        appDescription: selectedProjectForRoadmap.ideaDescription,
        features: featuresForRoadmap,
        targetAudience: selectedProjectForRoadmap.originalPrompt,
        marketAnalysisSummary: selectedProjectForRoadmap.marketAnalysis?.marketOverview || selectedProjectForRoadmap.marketAnalysis?.competitiveLandscapeSummary,
      };

      const result = await generateRoadmap(input);
      setGeneratedRoadmap(result);
      toast({ title: "Roadmap Generated!", description: `MVP roadmap for ${selectedProjectForRoadmap.appName} is ready.` });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate roadmap: ${errorMessage}`);
      toast({ title: "Error Generating Roadmap", description: `An error occurred: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsLoadingRoadmap(false);
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
      pricingStrategy: pricingStrategy || undefined, // Added
      // mockupImageUrls: mockupImages || undefined, // Removed
      textToAppPrompt: textToAppPrompt || undefined,
      // referenceImageDataUri: referenceImageDataUri || undefined, // Removed
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
      setPricingStrategy(project.pricingStrategy || null); // Added
      // setMockupImages(project.mockupImageUrls || null); // Removed
      setTextToAppPrompt(project.textToAppPrompt || null);
      // setReferenceImageDataUri(project.referenceImageDataUri || null); // Removed
      // if (project.referenceImageDataUri) { // Removed
      //   setReferenceImageFile(null); 
      // } else {
      //   resetReferenceImage();
      // }
      setCurrentProjectId(project.id);
      
      let resumeStep: AppStep = 'ideas';
      if (project.textToAppPrompt) resumeStep = 'save';
      else if (project.pricingStrategy) resumeStep = 'devPrompt'; // Updated order
      // else if (project.mockupImageUrls && project.mockupImageUrls.length > 0) resumeStep = 'devPrompt'; // Removed
      else if (project.prioritizedFeatures && project.prioritizedFeatures.length > 0) resumeStep = 'pricingStrategy'; // Updated order
      else if (project.marketAnalysis) resumeStep = 'prioritization';
      else if (loadedProposal.coreFeatures && loadedProposal.coreFeatures.length > 0) resumeStep = 'marketAnalysis';
      else if (selectedIdea) resumeStep = 'proposal';
      setCurrentStep(resumeStep);

      setCurrentView('app'); 
      
      toast({
        title: "Project Loaded",
        description: `${project.appName} has been loaded from your library. Resuming at ${resumeStep} step.`,
      });

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
    if (selectedProjectForRoadmap?.id === projectId) {
        setSelectedProjectForRoadmap(null);
        setGeneratedRoadmap(null);
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
     switch (level?.toLowerCase()) {
      case "high":
      case "rapid":
      case "large":
      case "growing":
      case "mature":
        return "default";
      case "medium":
      case "moderate":
      case "emerging":
        return "secondary";
      case "low":
      case "slow":
      case "niche":
      case "saturated":
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
  
  const isStepCompleted = (stepId: AppStep): boolean => {
    switch (stepId) {
      case 'ideas': return selectedIdea != null || (ideas.length > 0 && !isLoadingIdeas);
      case 'proposal': return proposal != null;
      case 'marketAnalysis': return marketAnalysis != null;
      case 'prioritization': return prioritizedFeatures != null && prioritizedFeatures.length > 0;
      case 'pricingStrategy': return pricingStrategy != null; // Added
      // case 'mockups': return mockupImages != null && mockupImages.length > 0; // Removed
      case 'devPrompt': return textToAppPrompt != null;
      case 'save': return currentProjectId != null;
      default: return false;
    }
  };

  const isStepAccessible = (stepId: AppStep): boolean => {
    return true;
  };

  const navigateToStep = (stepId: AppStep) => {
    if (isStepAccessible(stepId)) {
        setCurrentStep(stepId);
    } else {
         const currentStepIndex = stepsConfig.findIndex(s => s.id === currentStep);
         const targetStepIndex = stepsConfig.findIndex(s => s.id === stepId);
         let firstUncompletedPrerequisite = "";
         if (targetStepIndex > currentStepIndex) {
            for (let i = 0; i < targetStepIndex; i++) {
                if (!isStepCompleted(stepsConfig[i].id)) {
                    firstUncompletedPrerequisite = stepsConfig[i].title;
                    break;
                }
            }
         }
        toast({
            title: "Cannot Navigate",
            description: `Please complete previous steps first. ${firstUncompletedPrerequisite ? `"${firstUncompletedPrerequisite}" is not yet complete.` : 'Ensure all prior steps are done.'}`,
            variant: "destructive",
        });
    }
  };

  const handleNextStep = () => {
    const currentIndex = stepsConfig.findIndex(s => s.id === currentStep);
    if (currentIndex < stepsConfig.length - 1) {
      const nextStepId = stepsConfig[currentIndex + 1].id;
      if (isStepCompleted(currentStep) || (currentStep === 'ideas' && selectedIdea) || (currentStep === 'proposal' && proposal) ) { 
        setCurrentStep(nextStepId);
      } else {
         toast({
            title: "Cannot Proceed",
            description: `Please complete the "${stepsConfig[currentIndex].title}" step before moving to the next one. Make sure to generate content if required.`,
            variant: "destructive",
        });
      }
    }
  };
  

  const renderPrerequisiteMessage = (message: string, requiredStepAction?: () => void, buttonText?: string) => (
    <Card className="border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 p-4 my-4">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-amber-700 dark:text-amber-400 text-base flex items-center gap-2">
          <BadgeHelp className="h-5 w-5" /> Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <p className="text-sm text-amber-600 dark:text-amber-500">{message}</p>
        {requiredStepAction && buttonText && (
            <Button 
                variant="outline" 
                size="sm" 
                onClick={requiredStepAction}
                className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-800/50"
            >
                {buttonText} <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
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

  const currentStepDetails = stepsConfig.find(s => s.id === currentStep);

  const handleTabChange = (value: string) => {
    const newView = value as CurrentView;
    setCurrentView(newView);
    if (newView === 'app' && !currentStep) {
      setCurrentStep('ideas'); // Default to ideas step if app view is selected and no step is active
    }
    if (newView === 'roadmap') {
      setSelectedProjectForRoadmap(null); // Reset selected project when switching to roadmap tab
      setGeneratedRoadmap(null); // Clear previous roadmap
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthStatus('unauthenticated');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    // The useEffect for authStatus will handle the redirect to /login
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-muted-foreground">Loading Application...</p>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
     // Router push is handled by useEffect, this is a fallback or can show a message
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }


  return (
    <React.Fragment>
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">PromptForge</span>
            </h1>
          </Link>
          <div className="flex items-center gap-4"> {/* Increased gap for plan badge */}
            <Tabs value={currentView} onValueChange={handleTabChange} className="w-auto">
              <TabsList className="bg-transparent p-0 border-none">
                <TabsTrigger value="app" className="data-[state=active]:bg-muted data-[state=active]:shadow-none px-3 py-1.5 text-sm font-medium flex items-center gap-1.5">
                  <Wand2 className="h-4 w-4" /> App
                </TabsTrigger>
                <TabsTrigger value="roadmap" className="data-[state=active]:bg-muted data-[state=active]:shadow-none px-3 py-1.5 text-sm font-medium flex items-center gap-1.5">
                  <Milestone className="h-4 w-4" /> Roadmap
                </TabsTrigger>
                <TabsTrigger value="library" className="data-[state=active]:bg-muted data-[state=active]:shadow-none px-3 py-1.5 text-sm font-medium flex items-center gap-1.5">
                  <LibraryIcon className="h-4 w-4" /> My Library ({savedProjects.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
             <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 border border-border/50 px-2.5 py-1 rounded-md bg-muted/30 dark:bg-muted/10 shadow-sm">
                  {currentUserPlan === 'Free Explorer' ? <Zap className="h-4 w-4 text-primary" /> : <Award className="h-4 w-4 text-amber-500" />}
                  <Badge variant="outline" className="text-xs border-none p-0 bg-transparent shadow-none">
                      {currentUserPlan}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your current subscription plan.</p>
                 {currentUserPlan === 'Free Explorer' && <p className="text-xs text-muted-foreground">Limited generations per month.</p>}
                 {currentUserPlan === 'Premium Creator' && <p className="text-xs text-muted-foreground">Unlimited access and features.</p>}
              </TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
              <LogOut className="mr-1.5 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-7xl mt-4">
        {currentView === 'app' && (
          <>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Desktop Step Navigation */}
              <nav className="hidden md:block w-full md:w-64 lg:w-72 shrink-0">
                <div className="sticky top-20 space-y-2">
                    <Button onClick={() => resetAppState(true)} variant="outline" size="sm" className="w-full mb-4">
                        <RefreshCw className="mr-2 h-4 w-4" /> Start New Project
                    </Button>
                  {stepsConfig.map((step) => (
                    <Button
                      key={step.id}
                      variant={currentStep === step.id ? 'default' : 'ghost'}
                      className={cn(
                        "w-full justify-start text-left px-3 py-2 h-auto",
                        currentStep === step.id && "shadow-md",
                         !isStepAccessible(step.id) && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => navigateToStep(step.id)}
                      disabled={!isStepAccessible(step.id)}
                    >
                      <step.icon className={cn("mr-3 h-5 w-5", currentStep === step.id ? "text-primary-foreground" : "text-primary")} />
                      <div>
                        <span className="font-medium">{step.title}</span>
                        {isStepCompleted(step.id) && currentStep !== step.id && (
                            <CheckCircle2 className="ml-2 inline-block h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </nav>

              {/* Mobile Step Navigation */}
                <div className="md:hidden mb-6">
                     <Button onClick={() => resetAppState(true)} variant="outline" size="sm" className="w-full mb-4">
                        <RefreshCw className="mr-2 h-4 w-4" /> Start New Project
                    </Button>
                    <select 
                        value={currentStep} 
                        onChange={(e) => navigateToStep(e.target.value as AppStep)}
                        className="w-full p-3 border border-input rounded-md bg-background text-foreground shadow-sm"
                    >
                        {stepsConfig.map(step => (
                            <option key={step.id} value={step.id} disabled={!isStepAccessible(step.id)}>
                                {step.title} {isStepCompleted(step.id) ? '✔' : ''}
                            </option>
                        ))}
                    </select>
                </div>


              <div className="flex-1 min-w-0">
                <Card className="shadow-xl border rounded-xl overflow-hidden">
                    <CardHeader className="bg-muted/30 dark:bg-muted/10 border-b">
                        <div className="flex items-center gap-3">
                            {currentStepDetails?.icon && <currentStepDetails.icon className="h-7 w-7 text-primary" />}
                            <div>
                                <CardTitle className="text-2xl font-bold">{currentStepDetails?.title}</CardTitle>
                                <CardDescription className="text-sm">{currentStepDetails?.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Step 1: Idea Generation */}
                        {currentStep === 'ideas' && (
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
                                </div>
                            )}
                            </form>
                        )}

                        {/* Step 2: Detailed Proposal */}
                        {currentStep === 'proposal' && (
                            <>
                            {!selectedIdea && renderPrerequisiteMessage("Please select an idea from Step 1 to generate a proposal.", () => setCurrentStep('ideas'), "Go to Spark Idea Step")}
                            
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
                            </>
                            )}
                        </>
                        )}
                        
                        {/* Step 3: Market Analysis */}
                        {currentStep === 'marketAnalysis' && (
                             <>
                            {(!proposal || !selectedIdea) && renderPrerequisiteMessage("Please complete Steps 1 (Idea) and 2 (Proposal) first.", () => setCurrentStep(proposal ? 'proposal' : 'ideas'), `Go to ${proposal ? 'Proposal' : 'Idea'} Step`)}
                            
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
                                            <Accordion type="multiple" className="w-full space-y-2">
                                            {marketAnalysis.potentialCompetitors.map((competitor, idx) => (
                                                <AccordionItem key={idx} value={`competitor-${idx}`} className="border rounded-md overflow-hidden shadow-sm">
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
                                            ))}
                                            </Accordion>
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
                                </div>
                            )}
                            </>
                        )}

                        {/* Step 4: Feature Prioritization */}
                        {currentStep === 'prioritization' && (
                            <>
                            {(!proposal || !selectedIdea || (proposal && proposal.coreFeatures.length === 0)) && 
                            renderPrerequisiteMessage("Please ensure Step 1 (Idea) is complete and Step 2 (Proposal) has core features before prioritizing.", () => setCurrentStep(proposal && proposal.coreFeatures.length === 0 ? 'proposal' : 'ideas'), `Go to ${proposal && proposal.coreFeatures.length === 0 ? 'Proposal' : 'Idea'} Step`)}
                            
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
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getPriorityBadgeVariant(pFeature.priorityScore)} className="text-sm">
                                                    Priority: {pFeature.priorityScore}/10
                                                </Badge>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleRemovePrioritizedFeature(pFeature.feature)}
                                                            aria-label={`Remove ${pFeature.feature}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Remove Feature</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
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
                                </div>
                            )}
                            {prioritizedFeatures && prioritizedFeatures.length === 0 && !isLoadingPrioritization && proposal && proposal.coreFeatures.length > 0 && (
                                <p className="text-sm text-muted-foreground">All features from the proposal have been removed from prioritization. You can re-generate prioritization if you add features back in Step 2.</p>
                            )}
                             {proposal && proposal.coreFeatures.length === 0 && (
                                <p className="text-sm text-muted-foreground">No core features available to prioritize. Please add features in Step 2.</p>
                             )}
                            </>
                        )}

                        {/* Step 5: Pricing Strategy (New) */}
                        {currentStep === 'pricingStrategy' && (
                            <>
                            {(!proposal || !selectedIdea || !marketAnalysis) && renderPrerequisiteMessage("Please complete Idea, Proposal, and Market Analysis steps first.", () => setCurrentStep( !selectedIdea ? 'ideas' : !proposal ? 'proposal' : 'marketAnalysis'), `Go to ${!selectedIdea ? 'Idea' : !proposal ? 'Proposal' : 'Market Analysis'} Step`)}
                            
                            {proposal && selectedIdea && marketAnalysis && !pricingStrategy && !isLoadingPricingStrategy && (
                                <Button onClick={handleGeneratePricingStrategy} disabled={isLoadingPricingStrategy} className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">
                                {isLoadingPricingStrategy ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Tag className="mr-2 h-4 w-4" />
                                )}
                                Generate Pricing Strategy (AI)
                                </Button>
                            )}
                            {isLoadingPricingStrategy && (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="ml-4 text-muted-foreground">Generating pricing strategy...</p>
                                </div>
                            )}
                            {pricingStrategy && (
                                <div className="space-y-6">
                                     <Card className="shadow-sm">
                                        <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                            <CardTitle className="text-xl flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary"/>Overall Strategy Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{pricingStrategy.overallStrategySummary}</p></CardContent>
                                    </Card>

                                    <Accordion type="multiple" defaultValue={['model-0']} className="w-full space-y-3">
                                        {pricingStrategy.recommendedPricingModels.map((model, modelIdx) => (
                                            <AccordionItem key={modelIdx} value={`model-${modelIdx}`} className="border rounded-lg overflow-hidden shadow-md">
                                                <AccordionTrigger className="p-4 bg-muted/20 dark:bg-muted/10 hover:bg-muted/30 dark:hover:bg-muted/20 hover:no-underline text-lg rounded-t-md data-[state=closed]:rounded-b-md transition-colors">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-semibold text-foreground">{model.modelName}</span>
                                                        <Badge variant={model.suitabilityScore >= 4 ? "default" : model.suitabilityScore >=3 ? "secondary" : "outline"}>
                                                            Suitability: {model.suitabilityScore}/5
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 text-sm space-y-3 border-t bg-background">
                                                    <p className="text-xs text-primary/90 italic">{model.suitabilityReasoning}</p>
                                                    <p className="text-muted-foreground">{model.description}</p>
                                                    
                                                    <div>
                                                        <h6 className="font-medium text-sm mb-1 text-green-600 dark:text-green-500">Pros:</h6>
                                                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-4">
                                                            {model.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-medium text-sm mb-1 text-red-600 dark:text-red-500">Cons:</h6>
                                                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-4">
                                                            {model.cons.map((con, i) => <li key={i}>{con}</li>)}
                                                        </ul>
                                                    </div>

                                                    <h6 className="font-medium text-md pt-2 border-t mt-3 text-foreground">Suggested Tiers:</h6>
                                                    <div className="space-y-3">
                                                        {model.suggestedTiers.map((tier, tierIdx) => (
                                                            <Card key={tierIdx} className="p-3 bg-muted/10 dark:bg-muted/5 border shadow-xs">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <h6 className="font-semibold text-sm text-primary">{tier.tierName}</h6>
                                                                    <Badge variant="secondary" size="sm" className="text-xs">{tier.price}</Badge>
                                                                </div>
                                                                {tier.targetUser && <p className="text-xs text-muted-foreground mb-1">Target: {tier.targetUser}</p>}
                                                                <p className="text-xs font-medium mb-0.5">Features:</p>
                                                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-3 mb-1.5">
                                                                    {tier.featuresIncluded.map((feat, i) => <li key={i}>{feat}</li>)}
                                                                </ul>
                                                                <p className="text-xs text-muted-foreground/80 italic">Justification: {tier.justification}</p>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>

                                    {pricingStrategy.competitorPricingInsights && (
                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                                <CardTitle className="text-lg flex items-center gap-2"><Network className="h-4 w-4 text-primary"/>Competitor Pricing Insights</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{pricingStrategy.competitorPricingInsights}</p></CardContent>
                                        </Card>
                                    )}
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                            <CardTitle className="text-lg flex items-center gap-2"><Target className="h-4 w-4 text-primary"/>Value Proposition Focus</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{pricingStrategy.valuePropositionFocus}</p></CardContent>
                                    </Card>
                                    {pricingStrategy.dynamicPricingSuggestions && pricingStrategy.dynamicPricingSuggestions.length > 0 && (
                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/>Dynamic Pricing Suggestions</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                                                {pricingStrategy.dynamicPricingSuggestions.map((sugg, idx) => <li key={idx}>{sugg}</li>)}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                            </>
                        )}

                        {/* Step 6: AI Developer Prompt */}
                        {currentStep === 'devPrompt' && (
                            <>
                            {(!proposal || !selectedIdea) && renderPrerequisiteMessage("Please complete Steps 1 (Idea) and 2 (Proposal) first.", () => setCurrentStep(proposal ? 'proposal' : 'ideas'), `Go to ${proposal ? 'Proposal' : 'Idea'} Step`)}
                            
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
                                </div>
                            )}
                            </>
                        )}

                        {/* Step 7: Save to Library */}
                        {currentStep === 'save' && (
                             <>
                            {(!selectedIdea || !proposal) && renderPrerequisiteMessage("An idea (Step 1) and a proposal (Step 2) are needed to save.", () => setCurrentStep(proposal ? 'proposal' : 'ideas'), `Go to ${proposal ? 'Proposal' : 'Idea'} Step`)}
                            
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
                            </>
                        )}

                    </CardContent>
                    <CardFooter className="border-t p-4 bg-muted/50 dark:bg-muted/20">
                        <div className="flex justify-end w-full">
                            {currentStep !== 'ideas' && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        const currentIndex = stepsConfig.findIndex(s => s.id === currentStep);
                                        if (currentIndex > 0) {
                                            setCurrentStep(stepsConfig[currentIndex - 1].id);
                                        }
                                    }}
                                    className="mr-auto rounded-md shadow-sm hover:shadow-md transition-shadow"
                                >
                                    Previous Step
                                </Button>
                            )}
                            {currentStep !== 'save' && ( 
                                <Button 
                                    onClick={handleNextStep}
                                    disabled={!isStepCompleted(currentStep) && currentStep !== 'ideas' && currentStep !== 'proposal'} 
                                    className="rounded-md shadow-md hover:shadow-lg transition-shadow"
                                >
                                    Next: {stepsConfig[stepsConfig.findIndex(s => s.id === currentStep) + 1]?.title || 'Finish'} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
              </div>
            </div>
          </>
        )}

        {currentView === 'library' && (
          <section id="library-view-content" className="space-y-6">
            <Card className="shadow-xl border rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 dark:bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <LibraryIcon className="text-primary h-6 w-6" />
                  <span>My Project Library</span>
                </CardTitle>
                <CardDescription>View and manage your saved application projects. ({savedProjects.length} project(s))</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {savedProjects.length === 0 ? (
                  <div className="text-center py-10">
                    <LibraryIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground mb-2">Your library is empty.</p>
                    <p className="text-sm text-muted-foreground mb-6">Start a new project in the "App" tab to save your work here.</p>
                    <Button onClick={() => {setCurrentView('app'); resetAppState(true);}} variant="default">
                        <PlusCircle className="mr-2 h-4 w-4"/> Create New Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProjects.map((project) => (
                      <Card key={project.id} className={`flex flex-col border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${currentProjectId === project.id ? 'ring-2 ring-primary border-primary' : ''}`}>
                        <CardHeader className="pb-3 space-y-1">
                          <CardTitle className="text-xl line-clamp-1">{project.appName}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground line-clamp-2 h-8">
                            {project.ideaTitle}
                          </CardDescription>
                           <p className="text-[10px] text-muted-foreground/70 pt-1">Saved: {format(new Date(project.savedAt), "PPp")}</p>
                        </CardHeader>
                        <CardContent className="py-3 px-6 flex-grow space-y-3">
                           
                            {/* Removed mockup preview */}
                            <div className="relative aspect-[16/10] w-full rounded-md overflow-hidden border shadow-inner bg-muted/20 flex items-center justify-center">
                                 <Cpu className="h-12 w-12 text-muted-foreground/30" />
                            </div>

                            <div className="flex flex-wrap gap-1.5 items-center">
                                {project.marketAnalysis && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" size="sm" className="cursor-default">
                                        <BarChart3 className="h-3 w-3 mr-1" /> Market
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Market analysis available.</p></TooltipContent>
                                  </Tooltip>
                                )}
                                {project.prioritizedFeatures && project.prioritizedFeatures.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" size="sm" className="cursor-default">
                                        <TrendingUp className="h-3 w-3 mr-1" /> Prioritized
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Features are prioritized.</p></TooltipContent>
                                  </Tooltip>
                                )}
                                {project.pricingStrategy && ( // Added check for pricing strategy
                                   <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" size="sm" className="cursor-default bg-green-500/10 text-green-700 border-green-500/30 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/40">
                                        <Tag className="h-3 w-3 mr-1" /> Pricing
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Pricing strategy available.</p></TooltipContent>
                                  </Tooltip>
                                )}
                                 {project.textToAppPrompt && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" size="sm" className="cursor-default bg-primary/10 text-primary border-primary/30">
                                        <Terminal className="h-3 w-3 mr-1" /> Dev Prompt
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent><p>AI Developer prompt available.</p></TooltipContent>
                                  </Tooltip>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2 pt-3 p-4 border-t bg-muted/10 dark:bg-muted/5 rounded-b-lg">
                          <Button variant="default" size="sm" onClick={() => handleLoadFromLibrary(project.id)} className="flex-1 rounded-md text-xs shadow-sm hover:shadow">
                            <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> Load
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteFromLibrary(project.id)} className="rounded-md text-xs shadow-sm hover:shadow text-destructive hover:border-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Delete Project</span>
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

        {currentView === 'roadmap' && (
          <section id="roadmap-generator-content" className="space-y-6">
            <Card className="shadow-xl border rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 dark:bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Milestone className="text-primary h-6 w-6" />
                  <span>MVP Roadmap Generator</span>
                </CardTitle>
                <CardDescription>Select a saved project to generate an AI-powered MVP roadmap.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {savedProjects.length === 0 ? (
                   <div className="text-center py-10">
                    <LibraryIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground mb-2">No projects in library.</p>
                    <p className="text-sm text-muted-foreground mb-6">Please save a project first to generate a roadmap.</p>
                    <Button onClick={() => setCurrentView('app')} variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4 transform rotate-180"/> Go to App
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Select Project for Roadmap:</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedProjects.map(proj => (
                            <Card 
                                key={proj.id} 
                                onClick={() => {setSelectedProjectForRoadmap(proj); setGeneratedRoadmap(null);}}
                                className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg hover:ring-1 hover:ring-primary/50 rounded-lg p-4 ${selectedProjectForRoadmap?.id === proj.id ? 'ring-2 ring-primary shadow-lg border-primary' : 'border-border/50 shadow-sm'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <h5 className="font-semibold text-md line-clamp-1">{proj.appName}</h5>
                                    {selectedProjectForRoadmap?.id === proj.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{proj.ideaTitle}</p>
                                <p className="text-[10px] text-muted-foreground/70 mt-1">Saved: {format(new Date(proj.savedAt), "PP")}</p>
                            </Card>
                        ))}
                     </div>
                  </div>
                )}

                {selectedProjectForRoadmap && (
                  <div className="mt-6">
                    <Button 
                        onClick={handleGenerateRoadmap} 
                        disabled={isLoadingRoadmap}
                        className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow"
                    >
                      {isLoadingRoadmap ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                      Generate MVP Roadmap for "{selectedProjectForRoadmap.appName}"
                    </Button>
                  </div>
                )}

                {isLoadingRoadmap && (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="ml-4 text-lg text-muted-foreground">Generating roadmap...</p>
                  </div>
                )}

                {generatedRoadmap && (
                  <div className="mt-8 space-y-8">
                    <Card className="shadow-md border-primary/30">
                      <CardHeader className="bg-primary/5 dark:bg-primary/10">
                        <CardTitle className="text-2xl text-primary flex items-center gap-2">
                           <Milestone className="h-6 w-6"/> {generatedRoadmap.roadmapTitle}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">Overall MVP Timeline: <Badge variant="secondary">{generatedRoadmap.overallMvpTimeline}</Badge></CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Accordion type="multiple" defaultValue={['phase-0']} className="w-full">
                          {generatedRoadmap.mvpPhases.map((phase, idx) => (
                            <AccordionItem value={`phase-${idx}`} key={idx} className={idx === generatedRoadmap.mvpPhases.length -1 ? "border-b-0" : ""}>
                              <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/20 dark:hover:bg-muted/10 data-[state=open]:bg-muted/30 dark:data-[state=open]:bg-muted/15 transition-colors">
                                <div className="flex items-center gap-3">
                                  <Badge variant="default" className="h-7 w-7 p-0 items-center justify-center text-sm rounded-full shadow-sm">{phase.phaseNumber}</Badge>
                                  <span>{phase.phaseTitle}</span>
                                  <Badge variant="outline" className="text-xs ml-auto shadow-sm">{phase.estimatedDuration}</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 py-4 space-y-4 bg-background border-t">
                                <div className="p-3 bg-muted/20 dark:bg-muted/10 rounded-md border shadow-sm">
                                  <h5 className="font-semibold text-md mb-1 flex items-center gap-2"><Target className="h-4 w-4 text-primary/80"/>Phase Goal:</h5>
                                  <p className="text-sm text-muted-foreground">{phase.phaseGoal}</p>
                                </div>
                                
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-md mb-1 flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary/80"/>Features in this Phase:</h5>
                                  {phase.featuresInPhase.map((feat, fIdx) => (
                                    <Card key={fIdx} className="p-3 bg-background border shadow-xs">
                                      <h6 className="font-medium text-sm text-foreground">{feat.featureName}</h6>
                                      <p className="text-xs text-muted-foreground mt-0.5 mb-1">{feat.featureDescription}</p>
                                      <p className="text-xs text-primary/90 italic">Justification: {feat.justificationForPhase}</p>
                                    </Card>
                                  ))}
                                </div>

                                <div>
                                  <h5 className="font-semibold text-md mb-1.5 flex items-center gap-2"><ListOrdered className="h-4 w-4 text-primary/80"/>Key Deliverables:</h5>
                                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                                    {phase.keyDeliverables.map((del, dIdx) => <li key={dIdx}>{del}</li>)}
                                  </ul>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                            <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Key Success Metrics for MVP</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                            {generatedRoadmap.keySuccessMetricsForMvp.map((metric, idx) => <li key={idx}>{metric}</li>)}
                            </ul>
                        </CardContent>
                    </Card>

                    {generatedRoadmap.postMvpSuggestions && generatedRoadmap.postMvpSuggestions.length > 0 && (
                         <Card className="shadow-sm">
                            <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                                <CardTitle className="text-xl flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>Post-MVP Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                                {generatedRoadmap.postMvpSuggestions.map((suggestion, idx) => <li key={idx}>{suggestion}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
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
