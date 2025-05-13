
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent, useCallback } from 'react';
import type { GenerateApplicationIdeasInput, GenerateApplicationIdeasOutput, Idea } from '@/ai/flows/generate-application-ideas';
import { generateApplicationIdeas } from '@/ai/flows/generate-application-ideas';
import type { GenerateDetailedProposalInput, GenerateDetailedProposalOutput as ProposalOutput, CoreFeature, UiUxGuideline } from '@/ai/flows/generate-detailed-proposal';
import { generateDetailedProposal } from '@/ai/flows/generate-detailed-proposal';
import type { GenerateTextToAppPromptInput, GenerateTextToAppPromptOutput } from '@/ai/flows/generate-text-to-app-prompt';
import { generateTextToAppPrompt } from '@/ai/flows/generate-text-to-app-prompt';
import type { GenerateMoreFeaturesInput, GenerateMoreFeaturesOutput } from '@/ai/flows/generate-more-features';
import { generateMoreFeatures } from '@/ai/flows/generate-more-features';
import type { GenerateFeaturePrioritizationInput, GenerateFeaturePrioritizationOutput, PrioritizedFeature } from '@/ai/flows/generate-feature-prioritization';
import { generateFeaturePrioritization } from '@/ai/flows/generate-feature-prioritization';
import type { AnalyzeMarketInput, AnalyzeMarketOutput } from '@/ai/flows/analyze-market-flow';
import { analyzeMarket } from '@/ai/flows/analyze-market-flow';
import type { GeneratePricingStrategyInput, GeneratePricingStrategyOutput } from '@/ai/flows/generate-pricing-strategy-flow';
import { generatePricingStrategy } from '@/ai/flows/generate-pricing-strategy-flow';

import type { SavedProject } from '@/lib/libraryModels';
import { useToast } from '@/hooks/use-toast';
import type { AppStepId, EditingStates } from '@/components/prompt-forge/appWorkflowTypes';
import { stepsConfig } from '@/components/prompt-forge/appWorkflowTypes';
import { FREE_TIER_NAME, PREMIUM_STEP_IDS } from '@/config/plans';

interface UseAppWorkflowProps {
  initialProject: SavedProject | null;
  onProjectSave: (project: SavedProject, plan: string) => boolean;
  clearInitialProject: () => void;
  currentUserPlan: string;
  creditsUsed: number;
  maxFreeCredits: number;
  onCreditUsed: () => void;
}

export function useAppWorkflow({ 
    initialProject, 
    onProjectSave, 
    clearInitialProject,
    currentUserPlan,
    creditsUsed,
    maxFreeCredits,
    onCreditUsed
}: UseAppWorkflowProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<AnalyzeMarketOutput | null>(null);
  const [textToAppPrompt, setTextToAppPrompt] = useState<string | null>(null);
  const [prioritizedFeatures, setPrioritizedFeatures] = useState<PrioritizedFeature[] | null>(null);
  const [pricingStrategy, setPricingStrategy] = useState<GeneratePricingStrategyOutput | null>(null);
  
  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [isLoadingProposal, setIsLoadingProposal] = useState<boolean>(false);
  const [isLoadingMarketAnalysis, setIsLoadingMarketAnalysis] = useState<boolean>(false);
  const [isLoadingTextToAppPrompt, setIsLoadingTextToAppPrompt] = useState<boolean>(false);
  const [isLoadingMoreFeatures, setIsLoadingMoreFeatures] = useState<boolean>(false);
  const [isLoadingPrioritization, setIsLoadingPrioritization] = useState<boolean>(false);
  const [isLoadingPricingStrategy, setIsLoadingPricingStrategy] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStepId>('ideas');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);


  const [editingStates, setEditingStates] = useState<EditingStates>({
    appName: false,
    coreFeatures: [],
    uiUxGuidelines: [],
  });
  
  const initializeEditingStates = useCallback((currentProposal: ProposalOutput | null) => {
    setEditingStates({
      appName: false,
      coreFeatures: currentProposal ? new Array(currentProposal.coreFeatures.length).fill(false) : [],
      uiUxGuidelines: currentProposal ? new Array(currentProposal.uiUxGuidelines.length).fill(false) : [],
    });
  }, []); 

  // Effect to load data from initialProject
  useEffect(() => {
    if (initialProject) {
      setPrompt(initialProject.originalPrompt || initialProject.ideaTitle);
      setSelectedIdea({ title: initialProject.ideaTitle, description: initialProject.ideaDescription });
      const loadedProposalData = {
        appName: initialProject.appName,
        coreFeatures: initialProject.coreFeatures,
        uiUxGuidelines: initialProject.uiUxGuidelines
      };
      setProposal(loadedProposalData);
      initializeEditingStates(loadedProposalData); 
      setMarketAnalysis(initialProject.marketAnalysis || null);
      setPrioritizedFeatures(initialProject.prioritizedFeatures || null);
      setPricingStrategy(initialProject.pricingStrategy || null);
      setTextToAppPrompt(initialProject.textToAppPrompt || null);
      setCurrentProjectId(initialProject.id);
    }
  }, [initialProject, initializeEditingStates]);

  const isStepCompleted = useCallback((stepId: AppStepId): boolean => {
    switch (stepId) {
      case 'ideas': return selectedIdea != null || (ideas.length > 0 && !isLoadingIdeas);
      case 'proposal': return proposal != null && proposal.appName.trim() !== '';
      case 'prioritization': return prioritizedFeatures != null && (prioritizedFeatures.length > 0 || (proposal?.coreFeatures.length === 0 && !isLoadingPrioritization));
      case 'marketAnalysis': return marketAnalysis != null;
      case 'pricingStrategy': return pricingStrategy != null;
      case 'devPrompt': return textToAppPrompt != null;
      case 'save': return currentProjectId != null; // "Save" step is complete if a project ID exists (meaning it has been saved at least once)
      default: return false;
    }
  }, [selectedIdea, ideas.length, isLoadingIdeas, proposal, marketAnalysis, prioritizedFeatures, pricingStrategy, textToAppPrompt, currentProjectId, isLoadingPrioritization]);

  // Effect to set the current step after data is loaded or when relevant states change
  useEffect(() => {
    if (initialProject && currentProjectId === initialProject.id) {
      // Data is loaded from an initial project
      let resumeStep: AppStepId = 'ideas';
      if (isStepCompleted('save')) resumeStep = 'save';
      else if (isStepCompleted('devPrompt')) resumeStep = 'save'; 
      else if (isStepCompleted('pricingStrategy')) resumeStep = 'devPrompt';
      else if (isStepCompleted('marketAnalysis')) resumeStep = 'pricingStrategy';
      else if (isStepCompleted('prioritization')) resumeStep = 'marketAnalysis';
      else if (isStepCompleted('proposal')) resumeStep = 'prioritization';
      else if (isStepCompleted('ideas')) resumeStep = 'proposal';

      if (PREMIUM_STEP_IDS.includes(resumeStep) && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(resumeStep)) {
        const lastNonPremiumCompletedStep = stepsConfig
          .slice()
          .reverse()
          .find(step => !PREMIUM_STEP_IDS.includes(step.id) && isStepCompleted(step.id));
        resumeStep = lastNonPremiumCompletedStep ? lastNonPremiumCompletedStep.id : 'ideas';
      }
      setCurrentStep(resumeStep);
    } else if (!initialProject) {
      // This case is handled by resetAppCreationState setting currentStep to 'ideas'
    }
  }, [initialProject, currentProjectId, currentUserPlan, isStepCompleted]);


  const resetAppCreationState = useCallback((clearPromptField = false) => {
    if (clearPromptField) setPrompt('');
    setIdeas([]);
    setSelectedIdea(null);
    setProposal(null);
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setPricingStrategy(null); 
    setTextToAppPrompt(null);
    setCurrentProjectId(null); 
    setError(null);
    initializeEditingStates(null);
    setCurrentStep('ideas');
    clearInitialProject();
  }, [initializeEditingStates, clearInitialProject]);
  

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleGenerateIdeas = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate ideas.');
      toast({ title: "Prompt Required", description: "Please enter a prompt to generate ideas.", variant: "destructive"});
      return;
    }

    const isStartingNewProjectFromScratch = !selectedIdea && !currentProjectId;

    if (isStartingNewProjectFromScratch && currentUserPlan === FREE_TIER_NAME && creditsUsed >= maxFreeCredits) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoadingIdeas(true);
    setIdeas([]); 
    setSelectedIdea(null); 
    setProposal(null);
    setMarketAnalysis(null);
    setPrioritizedFeatures(null);
    setPricingStrategy(null); 
    setTextToAppPrompt(null);
    setCurrentProjectId(null); 
    initializeEditingStates(null);
    setCurrentStep('ideas'); // Reset step to ideas when generating new ideas

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
         if (isStartingNewProjectFromScratch && currentUserPlan === FREE_TIER_NAME) {
          onCreditUsed();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate ideas: ${errorMessage}`);
      toast({ title: "Error Generating Ideas", description: `An error occurred: ${errorMessage}`, variant: "destructive" });
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
        setPricingStrategy(null); 
        setTextToAppPrompt(null);
        initializeEditingStates(null);
    }
    setError(null); 
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
    setPricingStrategy(null); 
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
      toast({ title: "Error Generating Proposal", description: `An error occurred: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsLoadingProposal(false);
    }
  };

  const handleAppNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProposal(prev => { 
        if (!prev) return null;
        setMarketAnalysis(null);
        setPricingStrategy(null); 
        setTextToAppPrompt(null); 
        return prev ? { ...prev, appName: event.target.value } : null
    });
  };

  const handleCoreFeatureChange = (index: number, field: keyof CoreFeature, value: string) => {
    setProposal(prev => {
      if (!prev) return null;
      const updatedFeatures = [...prev.coreFeatures];
      updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
      setPrioritizedFeatures(null); 
      setPricingStrategy(null); 
      setTextToAppPrompt(null);
      setMarketAnalysis(null); 
      return { ...prev, coreFeatures: updatedFeatures };
    });
  };

  const addCoreFeature = () => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, coreFeatures: [...prevProposal.coreFeatures, { feature: '', description: '' }] };
      setEditingStates(prevEditing => ({ ...prevEditing, coreFeatures: [...prevEditing.coreFeatures, ...new Array(newProposal.coreFeatures.length - prevProposal.coreFeatures.length).fill(true)] }));
      return newProposal;
    });
    setPrioritizedFeatures(null); 
    setPricingStrategy(null); 
    setTextToAppPrompt(null);
    setMarketAnalysis(null); 
  };

  const removeCoreFeature = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const originalLength = prevProposal.coreFeatures.length;
      const newProposal = { ...prevProposal, coreFeatures: prevProposal.coreFeatures.filter((_, i) => i !== index) };
      setEditingStates(prevEditing => ({ ...prevEditing, coreFeatures: prevEditing.coreFeatures.filter((_, i) => i !== index) }));
      if (newProposal.coreFeatures.length !== originalLength) {
          setPrioritizedFeatures(null); setPricingStrategy(null); setTextToAppPrompt(null); setMarketAnalysis(null); 
      }
      return newProposal;
    });
  };
  
  const handleUiUxGuidelineChange = (index: number, field: keyof UiUxGuideline, value: string) => {
    setProposal(prev => {
      if (!prev) return null;
      const updatedGuidelines = [...prev.uiUxGuidelines];
      updatedGuidelines[index] = { ...updatedGuidelines[index], [field]: value };
      setPricingStrategy(null); 
      setTextToAppPrompt(null);
      return { ...prev, uiUxGuidelines: updatedGuidelines };
    });
  };

  const addUiUxGuideline = () => {
     setProposal(prevProposal => {
      if (!prevProposal) return null;
      const newProposal = { ...prevProposal, uiUxGuidelines: [...prevProposal.uiUxGuidelines, { category: '', guideline: '' }] };
      setEditingStates(prevEditing => ({ ...prevEditing, uiUxGuidelines: [...prevEditing.uiUxGuidelines, ...new Array(newProposal.uiUxGuidelines.length - prevProposal.uiUxGuidelines.length).fill(true)] }));
      return newProposal;
    });
    setPricingStrategy(null); 
    setTextToAppPrompt(null);
  };

  const removeUiUxGuideline = (index: number) => {
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const originalLength = prevProposal.uiUxGuidelines.length;
      const newProposal = { ...prevProposal, uiUxGuidelines: prevProposal.uiUxGuidelines.filter((_, i) => i !== index) };
      setEditingStates(prevEditing => ({ ...prevEditing, uiUxGuidelines: prevEditing.uiUxGuidelines.filter((_, i) => i !== index) }));
      if (newProposal.uiUxGuidelines.length !== originalLength) {
        setPricingStrategy(null); setTextToAppPrompt(null);
      }
      return newProposal;
    });
  };

  const handleGenerateMoreFeatures = async () => {
    if (!proposal || !selectedIdea) {
      toast({ title: "Cannot Generate Features", description: "A proposal (Step 2) and selected idea (Step 1) are required.", variant: "destructive" });
      return;
    }
    setIsLoadingMoreFeatures(true); setError(null);
    try {
      const input: GenerateMoreFeaturesInput = { appName: proposal.appName, appDescription: selectedIdea.description, existingFeatures: proposal.coreFeatures };
      const result: GenerateMoreFeaturesOutput = await generateMoreFeatures(input);
      if (result.newFeatures && result.newFeatures.length > 0) {
        setProposal(prev => {
          if (!prev) return null;
          const existingTitles = prev.coreFeatures.map(f => f.feature.trim().toLowerCase());
          const newUnique = result.newFeatures.filter(nf => !existingTitles.includes(nf.feature.trim().toLowerCase()));
          setEditingStates(st => ({ ...st, coreFeatures: [...st.coreFeatures, ...new Array(newUnique.length).fill(true)] }));
          if (newUnique.length > 0) {
            toast({ title: "More Features Generated!", description: `${newUnique.length} new feature ideas added.` });
            setPrioritizedFeatures(null); setPricingStrategy(null); setTextToAppPrompt(null); setMarketAnalysis(null);
          } else {
            toast({ title: "No New Features Added", description: "AI generated features are similar to existing ones.", variant: "default" });
          }
          return { ...prev, coreFeatures: [...prev.coreFeatures, ...newUnique] };
        });
      } else {
        toast({ title: "No New Features Generated", description: "AI couldn't find additional distinct features.", variant: "default" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to generate more features: ${msg}`);
      toast({ title: "Error Generating More Features", description: `An error occurred: ${msg}`, variant: "destructive" });
    } finally {
      setIsLoadingMoreFeatures(false);
    }
  };
  
  const handleGenerateMarketAnalysis = async () => {
    if (currentUserPlan === FREE_TIER_NAME && !isStepCompleted('marketAnalysis')) {
      setShowUpgradeModal(true);
      return;
    }
    if (!proposal || !selectedIdea) {
      toast({ title: "Cannot Analyze Market", description: "Idea (Step 1) and proposal (Step 2) are required.", variant: "destructive" }); return;
    }
    if (proposal.appName.trim() === '') { toast({ title: "App Name Required", description: "Provide an app name in Step 2.", variant: "destructive" }); return; }
    if (proposal.coreFeatures.some(f => f.feature.trim() === '' || f.description.trim() === '')) { toast({ title: "Incomplete Features", description: "Ensure all features have title and description.", variant: "destructive" }); return; }
    setIsLoadingMarketAnalysis(true); setError(null); setMarketAnalysis(null); setPricingStrategy(null);
    try {
      // Extract potential USPs from core features if not explicitly provided (example logic)
      const potentialUSPs = proposal.coreFeatures
        .filter(f => f.description.toLowerCase().includes("unique") || f.description.toLowerCase().includes("innovative") || f.feature.toLowerCase().includes("ai"))
        .map(f => f.feature);
      
      const input: AnalyzeMarketInput = { 
        appName: proposal.appName, 
        appDescription: selectedIdea.title + ": " + selectedIdea.description, 
        coreFeatures: proposal.coreFeatures, 
        targetAudience: prompt,
        uniqueSellingPointsInput: potentialUSPs.length > 0 ? potentialUSPs : undefined // Pass USPs to the flow
      };
      const result = await analyzeMarket(input);
      setMarketAnalysis(result);
      toast({ title: "Market Analysis Generated!", description: "AI analyzed the market for your concept." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to generate market analysis: ${msg}`);
      toast({ title: "Error Generating Market Analysis", description: `An error occurred: ${msg}`, variant: "destructive" });
    } finally {
      setIsLoadingMarketAnalysis(false);
    }
  };

  const handleGenerateFeaturePrioritization = async () => {
    if (!proposal || !selectedIdea || proposal.coreFeatures.length === 0) {
      toast({ title: "Cannot Prioritize Features", description: "Proposal (Step 2) with features and idea (Step 1) are required.", variant: "destructive" }); return;
    }
    setIsLoadingPrioritization(true); setError(null); setPrioritizedFeatures(null); setPricingStrategy(null);
    try {
      const input: GenerateFeaturePrioritizationInput = { appName: proposal.appName, appDescription: selectedIdea.description, coreFeatures: proposal.coreFeatures, targetAudience: prompt };
      const result = await generateFeaturePrioritization(input);
      setPrioritizedFeatures(result.prioritizedFeatures || []);
      if (!result.prioritizedFeatures || result.prioritizedFeatures.length === 0) {
        toast({ title: "Feature Prioritization Complete", description: "No specific prioritization determined.", variant: "default" });
      } else {
        toast({ title: "Features Prioritized!", description: "AI has prioritized your core features." });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to prioritize features: ${msg}`);
      toast({ title: "Error Prioritizing Features", description: `An error occurred: ${msg}`, variant: "destructive" });
    } finally {
      setIsLoadingPrioritization(false);
    }
  };

  const handleGeneratePricingStrategy = async () => {
    if (currentUserPlan === FREE_TIER_NAME && !isStepCompleted('pricingStrategy')) {
      setShowUpgradeModal(true);
      return;
    }
    if (!proposal || !selectedIdea) {
      toast({ title: "Cannot Generate Pricing Strategy", description: "Proposal (Step 2) and idea (Step 1) are required.", variant: "destructive" }); return;
    }
    setIsLoadingPricingStrategy(true); setError(null); setPricingStrategy(null);
    try {
      const potentialUSPs = proposal.coreFeatures
        .filter(f => f.description.toLowerCase().includes("unique") || f.description.toLowerCase().includes("innovative") || f.feature.toLowerCase().includes("ai"))
        .map(f => f.feature);

      const input: GeneratePricingStrategyInput = {
        appName: proposal.appName,
        appDescription: selectedIdea.description,
        coreFeatures: proposal.coreFeatures,
        targetAudience: prompt,
        marketAnalysisSummary: marketAnalysis ? {
          marketOverview: marketAnalysis.marketOverview,
          potentialCompetitors: marketAnalysis.potentialCompetitors.map(c => ({ name: c.name, primaryOffering: c.primaryOffering, estimatedRevenuePotential: c.estimatedRevenuePotential })),
          marketSizeAndGrowth: marketAnalysis.marketSizeAndGrowth ? { estimation: marketAnalysis.marketSizeAndGrowth.estimation, potential: marketAnalysis.marketSizeAndGrowth.potential, marketSaturation: marketAnalysis.marketSizeAndGrowth.marketSaturation } : undefined,
          swotAnalysis: marketAnalysis.swotAnalysis ? { opportunities: marketAnalysis.swotAnalysis.opportunities, threats: marketAnalysis.swotAnalysis.threats } : undefined,
          competitiveLandscapeSummary: marketAnalysis.competitiveLandscapeSummary,
        } : null,
        monetizationGoals: "Balanced growth and revenue",
        uniqueSellingPoints: potentialUSPs.length > 0 ? potentialUSPs : undefined,
      };
      const result = await generatePricingStrategy(input);
      setPricingStrategy(result);
      toast({ title: "Pricing Strategy Generated!", description: "AI has provided pricing recommendations." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to generate pricing strategy: ${msg}`);
      toast({ title: "Error Generating Pricing Strategy", description: `An error occurred: ${msg}`, variant: "destructive" });
    } finally {
      setIsLoadingPricingStrategy(false);
    }
  };
  
  const handleGenerateTextToAppPrompt = async () => {
    if (currentUserPlan === FREE_TIER_NAME && !isStepCompleted('devPrompt')) {
      setShowUpgradeModal(true);
      return;
    }
    if (!proposal || !selectedIdea) {
      toast({ title: "Prerequisites Missing", description: "Idea (Step 1) and proposal (Step 2) are required.", variant: "destructive" }); return;
    }
    setIsLoadingTextToAppPrompt(true); setError(null); setTextToAppPrompt(null);
    try {
      const input: GenerateTextToAppPromptInput = { appName: proposal.appName, appIdeaDescription: selectedIdea.description, coreFeatures: proposal.coreFeatures, uiUxGuidelines: proposal.uiUxGuidelines };
      const result = await generateTextToAppPrompt(input);
      setTextToAppPrompt(result.detailedPrompt);
      toast({ title: "AI Developer Prompt Generated!", description: "Detailed prompt for Text-to-App tools is ready." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to generate Text-to-App prompt: ${msg}`);
      toast({ title: "Error Generating AI Developer Prompt", description: `An error occurred: ${msg}`, variant: "destructive" });
    } finally {
      setIsLoadingTextToAppPrompt(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!selectedIdea || !proposal || !proposal.appName || proposal.appName.trim() === "") {
      toast({
        title: "Cannot Save Project",
        description: "An idea (from Step 1) and an application name (in Step 2) are required to save your project.",
        variant: "destructive",
      });
      return;
    }

    const projectToSave: SavedProject = {
      id: currentProjectId || `proj-${Date.now()}`,
      appName: proposal.appName,
      ideaTitle: selectedIdea.title,
      ideaDescription: selectedIdea.description,
      coreFeatures: proposal.coreFeatures || [],
      uiUxGuidelines: proposal.uiUxGuidelines || [],
      marketAnalysis: marketAnalysis || undefined,
      prioritizedFeatures: prioritizedFeatures || undefined,
      pricingStrategy: pricingStrategy || undefined,
      textToAppPrompt: textToAppPrompt || undefined,
      savedAt: new Date().toISOString(),
      originalPrompt: prompt,
    };

    const success = onProjectSave(projectToSave, currentUserPlan);
    if (success) {
      setCurrentProjectId(projectToSave.id);
      // Toast is handled by AppViewWrapper to show "Project Saved" or "Project Updated"
    }
    // If not successful, onProjectSave in AppViewWrapper already shows a toast.
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

  const handleRemovePrioritizedFeature = (featureTitle: string) => {
    setPrioritizedFeatures(prev => prev ? prev.filter(f => f.feature !== featureTitle) : null);
    setProposal(prevProposal => {
      if (!prevProposal) return null;
      const coreFeatureIndex = prevProposal.coreFeatures.findIndex(cf => cf.feature === featureTitle);
      if (coreFeatureIndex === -1) return prevProposal;
      const updatedCoreFeatures = prevProposal.coreFeatures.filter(cf => cf.feature !== featureTitle);
      setEditingStates(prevEditing => {
        const updatedEditingCore = [...prevEditing.coreFeatures];
        updatedEditingCore.splice(coreFeatureIndex, 1);
        return { ...prevEditing, coreFeatures: updatedEditingCore };
      });
      setTextToAppPrompt(null); setMarketAnalysis(null); setPricingStrategy(null);
      return { ...prevProposal, coreFeatures: updatedCoreFeatures };
    });
    toast({ title: "Feature Removed", description: `"${featureTitle}" removed. Dependent data cleared.` });
  };

  const navigateToStep = (stepId: AppStepId) => {
    if (PREMIUM_STEP_IDS.includes(stepId) && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(stepId)) {
      setShowUpgradeModal(true);
      return;
    }
    setCurrentStep(stepId);
  };
  
  const handleNextStep = () => {
    const currentIndex = stepsConfig.findIndex(s => s.id === currentStep);
    if (currentIndex < stepsConfig.length - 1) {
      const nextStepId = stepsConfig[currentIndex + 1].id;
       if (PREMIUM_STEP_IDS.includes(nextStepId) && currentUserPlan === FREE_TIER_NAME && !isStepCompleted(nextStepId)) {
        setShowUpgradeModal(true);
        return;
      }
      setCurrentStep(nextStepId);
    }
  };
  
  return {
    prompt, setPrompt,
    ideas,
    selectedIdea,
    proposal,
    marketAnalysis,
    textToAppPrompt,
    prioritizedFeatures,
    pricingStrategy,
    isLoadingIdeas,
    isLoadingProposal,
    isLoadingMarketAnalysis,
    isLoadingTextToAppPrompt,
    isLoadingMoreFeatures,
    isLoadingPrioritization,
    isLoadingPricingStrategy,
    error,
    currentProjectId,
    currentStep, setCurrentStep,
    showUpgradeModal, setShowUpgradeModal,
    editingStates, setEditingStates,
    handlePromptChange,
    handleGenerateIdeas,
    handleSelectIdea,
    handleGenerateProposal,
    handleAppNameChange,
    handleCoreFeatureChange,
    addCoreFeature,
    removeCoreFeature,
    handleUiUxGuidelineChange,
    addUiUxGuideline,
    removeUiUxGuideline,
    handleGenerateMoreFeatures,
    handleGenerateMarketAnalysis,
    handleGenerateFeaturePrioritization,
    handleGeneratePricingStrategy,
    handleGenerateTextToAppPrompt,
    handleSaveToLibrary,
    toggleEditState,
    handleRemovePrioritizedFeature,
    isStepCompleted,
    navigateToStep,
    handleNextStep,
    resetAppCreationState,
  };
}
