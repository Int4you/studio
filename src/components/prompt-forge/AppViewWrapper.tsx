
"use client";

import React, { useState, useEffect } from 'react';
import AppView from '@/components/prompt-forge/AppView';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary as saveProjectToLibraryService, deleteProjectFromLibrary as deleteProjectFromLibraryService, getProjectById as getProjectByIdService } from '@/lib/libraryService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Cpu, Wand2, Library as LibraryIcon, Milestone, LogOut, Zap, Crown, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button'; 

import RoadmapView from './RoadmapView';
import LibraryView from './LibraryView';
import { FREE_TIER_NAME, PREMIUM_CREATOR_NAME, MAX_FREE_CREDITS, freePlanUIDetails, premiumPlanUIDetails } from '@/config/plans';

export type CurrentView = 'app' | 'roadmap' | 'library';
const AUTH_TOKEN_KEY = 'promptForgeAuthToken';
const FREE_CREDITS_STORAGE_KEY = 'promptForgeFreeCreditsUsed';

export default function AppViewWrapper() {
  const { toast } = useToast();
  const router = useRouter();

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentView, setCurrentView] = useState<CurrentView>('app');
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [currentUserPlan, setCurrentUserPlan] = useState<string>(FREE_TIER_NAME);
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  
  const [projectToLoadInApp, setProjectToLoadInApp] = useState<SavedProject | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedProjects(getProjectsFromLibrary());
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        setAuthStatus('authenticated');
        setCurrentUserPlan(localStorage.getItem('promptForgeUserPlan') || FREE_TIER_NAME); 
        const storedCredits = localStorage.getItem(FREE_CREDITS_STORAGE_KEY);
        if (storedCredits) {
          setCreditsUsed(parseInt(storedCredits, 10));
        }
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

  const handleTabChange = (value: string) => {
    const newView = value as CurrentView;
    setCurrentView(newView);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('promptForgeUserPlan');
    localStorage.removeItem(FREE_CREDITS_STORAGE_KEY); // Clear credits on logout
    setAuthStatus('unauthenticated');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const loadProjectFromLibrary = (projectId: string) => {
    const project = getProjectByIdService(projectId);
    if (project) {
      setProjectToLoadInApp(project); 
      setCurrentView('app'); 
      toast({
        title: "Project Loaded",
        description: `${project.appName} is ready to be viewed/edited in the App tab.`,
      });
    } else {
      toast({
        title: "Error Loading Project",
        description: "Could not find the selected project in your library.",
        variant: "destructive",
      });
    }
  };
  
  const deleteProjectFromLibrary = (projectId: string) => {
    deleteProjectFromLibraryService(projectId);
    const updatedProjects = getProjectsFromLibrary();
    setSavedProjects(updatedProjects);
    if (projectToLoadInApp?.id === projectId) {
        setProjectToLoadInApp(null);
    }
    toast({
      title: "Project Deleted",
      description: "The project has been removed from your library.",
      variant: "destructive"
    });
  };

  const saveProjectToLibrary = (project: SavedProject): boolean => {
    const success = saveProjectToLibraryService(project, currentUserPlan);
    if (success) {
        const updatedProjects = getProjectsFromLibrary();
        setSavedProjects(updatedProjects);
        if (projectToLoadInApp?.id === project.id) {
        setProjectToLoadInApp(project); 
        }
        toast({
        title: projectToLoadInApp?.id === project.id ? "Project Updated" : "Project Saved",
        description: `${project.appName} has been ${projectToLoadInApp?.id === project.id ? 'updated in' : 'saved to'} your library.`,
        });
    } else {
         toast({
            title: "Library Full for Free Tier",
            description: `Free Tier allows saving ${MAX_FREE_CREDITS} project. Please upgrade or delete an existing project.`,
            variant: "destructive",
        });
    }
    return success;
  };

  const incrementCreditUsed = () => {
    if (currentUserPlan === FREE_TIER_NAME) {
      setCreditsUsed(prev => {
        const newCount = prev + 1;
        localStorage.setItem(FREE_CREDITS_STORAGE_KEY, newCount.toString());
        return newCount;
      });
    }
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
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-6 text-xl text-muted-foreground">Redirecting to login...</p>
         <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
       </div>
     );
  }

  const isPremium = currentUserPlan === PREMIUM_CREATOR_NAME;
  const creditsLeft = MAX_FREE_CREDITS - creditsUsed;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">PromptForge</span>
            </h1>
          </Link>
          
          <Tabs value={currentView} onValueChange={handleTabChange} className="hidden sm:block mx-auto">
            <TabsList className="bg-muted/30 dark:bg-muted/20 p-1 rounded-lg shadow-inner">
              <TabsTrigger value="app" className="px-4 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md">
                <Wand2 className="mr-1.5 h-4 w-4" /> App
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="px-4 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md">
                <Milestone className="mr-1.5 h-4 w-4" /> Roadmap
              </TabsTrigger>
              <TabsTrigger value="library" className="px-4 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md">
                <LibraryIcon className="mr-1.5 h-4 w-4" /> My Library ({savedProjects.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 md:gap-3">
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-border/50 px-2.5 py-1 rounded-md bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 shadow-sm cursor-pointer h-9">
                      {isPremium ? <Crown className="h-4 w-4 text-amber-500" /> : <Zap className="h-4 w-4 text-primary" />}
                      <span className={`text-xs font-medium ${isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{currentUserPlan}</span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to see plan details.</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-80 p-0 shadow-xl rounded-lg border-border/30 bg-card overflow-hidden">
                <div className="p-4 bg-muted/20 dark:bg-muted/10 border-b">
                  <h4 className="font-semibold text-md text-foreground text-center">Your Current Plan</h4>
                </div>
                <div className="p-4 space-y-3">
                  {/* Current Plan Display */}
                  <div className={`p-3 rounded-md border ${isPremium ? 'border-amber-400/80 bg-amber-50/70 dark:bg-amber-900/25' : 'border-border/30 bg-muted/30 dark:bg-muted/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isPremium ? <Crown className="h-5 w-5 text-amber-500" /> : <Zap className="h-5 w-5 text-primary" />}
                      <h5 className={`font-bold ${isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`}>{isPremium ? PREMIUM_CREATOR_NAME : FREE_TIER_NAME}</h5>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground pl-1">
                      {(isPremium ? premiumPlanUIDetails.features : freePlanUIDetails.features).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className={`h-3.5 w-3.5 mr-1.5 mt-0.5 shrink-0 ${isPremium ? 'text-amber-500' : 'text-green-500'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Upgrade Prompt if Free */}
                  {!isPremium && (
                    <div className="pt-3 border-t mt-3">
                       <div className="p-3 rounded-md border border-amber-400/80 bg-amber-50/70 dark:bg-amber-900/25 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Crown className="h-5 w-5 text-amber-500" />
                            <h5 className="font-bold text-amber-600 dark:text-amber-400">{PREMIUM_CREATOR_NAME}</h5>
                          </div>
                           <p className="text-xs text-amber-700/90 dark:text-amber-400/90 mb-2">{premiumPlanUIDetails.description}</p>
                          <ul className="space-y-1.5 text-xs text-amber-700/80 dark:text-amber-500/80 pl-1">
                            {premiumPlanUIDetails.features.slice(0,3).map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 mr-1.5 mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                             <li className="flex items-start"><CheckCircle2 className="h-3.5 w-3.5 text-amber-500 mr-1.5 mt-0.5 shrink-0" /><span>And many more...</span></li>
                          </ul>
                       </div>
                      <Button asChild size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-amber-50 shadow-md hover:shadow-lg transition-shadow">
                        <Link href="/pricing">Upgrade to Premium ({premiumPlanUIDetails.price}{premiumPlanUIDetails.frequency})</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {currentUserPlan === FREE_TIER_NAME && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={creditsLeft > 0 ? "secondary" : "destructive"} className="text-xs cursor-default h-9 px-2.5">
                            {creditsLeft > 0 ? `${creditsLeft} / ${MAX_FREE_CREDITS} Credits Left` : "No Credits Left"}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{creditsLeft > 0 ? `You have ${creditsLeft} project credits remaining on the ${FREE_TIER_NAME}.` : `You have used all project credits on the ${FREE_TIER_NAME}. Upgrade for unlimited.`}</p>
                    </TooltipContent>
                </Tooltip>
            )}

            <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-1 h-9 w-9 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
         <div className="sm:hidden border-t">
            <Tabs value={currentView} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border-none rounded-none">
                    <TabsTrigger value="app" className="data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none py-2.5 text-xs font-medium flex flex-col items-center gap-1 h-auto">
                    <Wand2 className="h-4 w-4" /> App
                    </TabsTrigger>
                    <TabsTrigger value="roadmap" className="data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none py-2.5 text-xs font-medium flex flex-col items-center gap-1 h-auto">
                    <Milestone className="h-4 w-4" /> Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="library" className="data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none py-2.5 text-xs font-medium flex flex-col items-center gap-1 h-auto">
                    <LibraryIcon className="h-4 w-4" /> Library ({savedProjects.length})
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-7xl mt-4">
        {currentView === 'app' && (
          <AppView 
            initialProject={projectToLoadInApp}
            onProjectSave={saveProjectToLibrary}
            clearInitialProject={() => setProjectToLoadInApp(null)}
            currentUserPlan={currentUserPlan}
            creditsUsed={creditsUsed}
            maxFreeCredits={MAX_FREE_CREDITS}
            onCreditUsed={incrementCreditUsed}
          />
        )}
        {currentView === 'roadmap' && (
          <RoadmapView 
            savedProjects={savedProjects} 
          />
        )}
        {currentView === 'library' && (
          <LibraryView 
            savedProjects={savedProjects} 
            onLoadProject={loadProjectFromLibrary}
            onDeleteProject={deleteProjectFromLibrary}
            onStartNewProject={() => {
                setProjectToLoadInApp(null); 
                setCurrentView('app');
            }}
          />
        )}
      </main>
    </TooltipProvider>
  );
}

