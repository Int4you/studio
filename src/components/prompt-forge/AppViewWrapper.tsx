
"use client";

import React, { useState, useEffect } from 'react';
import AppView from '@/components/prompt-forge/AppView';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary as saveProjectToLibraryService, deleteProjectFromLibrary as deleteProjectFromLibraryService, getProjectById as getProjectByIdService } from '@/lib/libraryService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Cpu, Wand2, Library as LibraryIcon, Milestone, LogOut, Zap, Crown, CheckCircle2, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button'; 
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"; // Keep this for UpgradeModal
import { CardHeader, CardTitle } from '@/components/ui/card'; // Added for Popover content

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
  const [currentUserPlan, setCurrentUserPlan] = useState<string>(PREMIUM_CREATOR_NAME); 
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  
  const [projectToLoadInApp, setProjectToLoadInApp] = useState<SavedProject | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedProjects(getProjectsFromLibrary());
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        setAuthStatus('authenticated');
        
        const storedPlan = localStorage.getItem('promptForgeUserPlan');
        if (storedPlan === PREMIUM_CREATOR_NAME) {
            setCurrentUserPlan(PREMIUM_CREATOR_NAME);
            localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
            setCreditsUsed(0);
        } else {
            // Default to Free Tier if no premium plan is stored or if it's an old value
            setCurrentUserPlan(FREE_TIER_NAME);
            const storedCredits = parseInt(localStorage.getItem(FREE_CREDITS_STORAGE_KEY) || '0', 10);
            setCreditsUsed(storedCredits);
        }

      } else {
        setAuthStatus('unauthenticated');
         // If unauthenticated, reset to Free Tier defaults for UI consistency before redirect
        setCurrentUserPlan(FREE_TIER_NAME);
        setCreditsUsed(0);
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
    localStorage.removeItem(FREE_CREDITS_STORAGE_KEY); 
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
            title: "Library Full (Free Tier)",
            description: `Your library can hold ${MAX_FREE_TIER_PROJECTS_IN_LIBRARY} project(s) on the Free Tier. Please upgrade or delete an existing project.`,
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


  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Cpu className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl font-bold tracking-tight">
              Prompt<span className="text-primary">Forge</span>
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
                     <Button variant="outline" size="sm" className="flex items-center gap-1.5 border border-border/50 px-2.5 py-1 rounded-md bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 shadow-sm cursor-pointer h-9">
                      {isPremium ? <Crown className="h-4 w-4 text-amber-500 fill-amber-500" /> : <Zap className="h-4 w-4 text-primary" />}
                      <span className={`text-xs font-medium ${isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{currentUserPlan}</span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to see plan details.</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-80 p-0 shadow-xl rounded-xl border-border/30 bg-card overflow-hidden max-w-xs sm:max-w-sm">
                <CardHeader className="items-center text-center p-4 border-b bg-muted/20 dark:bg-muted/10">
                  <div className="p-2.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm mb-1.5 inline-block">
                     {isPremium ? <Crown className="h-7 w-7 text-amber-500 fill-amber-500" /> : <Zap className="h-7 w-7 text-primary" />}
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Your Current Plan
                  </CardTitle>
                </CardHeader>
                
                <div className="p-4 space-y-3">
                  <div className={`p-4 rounded-lg border ${isPremium ? 'border-amber-400/80 bg-amber-50/70 dark:bg-amber-900/25' : 'border-border/30 bg-muted/30 dark:bg-muted/20'} shadow-md`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isPremium ? <Crown className="h-6 w-6 text-amber-500 fill-amber-500" /> : <Zap className="h-6 w-6 text-primary" />}
                      <h5 className={`text-lg font-bold ${isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`}>{currentUserPlan}</h5>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground pl-1">
                      {(isPremium ? premiumPlanUIDetails.features : freePlanUIDetails.features).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className={`h-4 w-4 mr-2 mt-0.5 shrink-0 ${isPremium ? 'text-amber-500' : 'text-green-500'}`} />
                          <span className="text-xs">{feature.startsWith("Access to all core AI features") && isPremium ? "Access to all AI features (incl. premium)" : feature}</span>
                        </li>
                      ))}
                    </ul>
                    {!isPremium && (
                        <p className="text-xs text-muted-foreground mt-2.5">
                            Credits Used: {creditsUsed} / {MAX_FREE_CREDITS}
                        </p>
                    )}
                  </div>

                  {!isPremium && (
                    <div className="pt-3 border-t mt-3">
                      <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
                        <Link href="/pricing">Upgrade to {PREMIUM_CREATOR_NAME} ({premiumPlanUIDetails.price}{premiumPlanUIDetails.frequency})</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {currentUserPlan === FREE_TIER_NAME && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={(MAX_FREE_CREDITS - creditsUsed) > 0 ? "secondary" : "destructive"} className="text-xs cursor-default h-9 px-2.5">
                            {(MAX_FREE_CREDITS - creditsUsed) > 0 ? `${MAX_FREE_CREDITS - creditsUsed} Credits Left` : "No Credits Left"}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{(MAX_FREE_CREDITS - creditsUsed) > 0 ? `You have ${MAX_FREE_CREDITS - creditsUsed} project credits remaining on the ${FREE_TIER_NAME}.` : `You have used all project credits on the ${FREE_TIER_NAME}. Upgrade for unlimited.`}</p>
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

