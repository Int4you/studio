
"use client";

import React, { useState, useEffect } from 'react';
import AppView from '@/components/prompt-forge/AppView';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary as saveProjectToLibraryService, deleteProjectFromLibrary as deleteProjectFromLibraryService, getProjectById as getProjectByIdService } from '@/lib/libraryService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Cpu, Wand2, Library as LibraryIcon, Milestone, LogOut, Zap, Award, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button'; 

import RoadmapView from './RoadmapView';
import LibraryView from './LibraryView';
import { FREE_TIER_NAME, PREMIUM_CREATOR_NAME, MAX_FREE_GENERATIONS, freePlanUIDetails, premiumPlanUIDetails } from '@/config/plans';

export type CurrentView = 'app' | 'roadmap' | 'library';
const AUTH_TOKEN_KEY = 'promptForgeAuthToken';
const FREE_GENERATIONS_STORAGE_KEY = 'promptForgeFreeGenerationsUsed';

export default function AppViewWrapper() {
  const { toast } = useToast();
  const router = useRouter();

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentView, setCurrentView] = useState<CurrentView>('app');
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [currentUserPlan, setCurrentUserPlan] = useState<string>(FREE_TIER_NAME);
  const [generationsUsed, setGenerationsUsed] = useState<number>(0);
  
  const [projectToLoadInApp, setProjectToLoadInApp] = useState<SavedProject | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedProjects(getProjectsFromLibrary());
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        setAuthStatus('authenticated');
        // In a real app, plan would be fetched from backend
        // For demo, assuming all authenticated users start on Free Tier unless manually changed/mocked
        setCurrentUserPlan(FREE_TIER_NAME); 
        const storedGenerations = localStorage.getItem(FREE_GENERATIONS_STORAGE_KEY);
        if (storedGenerations) {
          setGenerationsUsed(parseInt(storedGenerations, 10));
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
    // Optionally, clear generations used if it's tied to login session for demo
    // localStorage.removeItem(FREE_GENERATIONS_STORAGE_KEY); 
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
            description: `Free Tier allows saving ${MAX_FREE_GENERATIONS} project. Please upgrade or delete an existing project.`,
            variant: "destructive",
        });
    }
    return success;
  };

  const incrementGenerationUsed = () => {
    if (currentUserPlan === FREE_TIER_NAME) {
      setGenerationsUsed(prev => {
        const newCount = prev + 1;
        localStorage.setItem(FREE_GENERATIONS_STORAGE_KEY, newCount.toString());
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

  const planDetailsToDisplay = currentUserPlan === FREE_TIER_NAME ? freePlanUIDetails : premiumPlanUIDetails;
  const generationsLeft = MAX_FREE_GENERATIONS - generationsUsed;

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
          <div className="flex items-center gap-2 md:gap-4">
            <Tabs value={currentView} onValueChange={handleTabChange} className="w-auto hidden sm:block">
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
            
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-border/50 px-2.5 py-1 rounded-md bg-muted/30 dark:bg-muted/10 shadow-sm cursor-pointer">
                      {currentUserPlan === FREE_TIER_NAME ? <Zap className="h-4 w-4 text-primary" /> : <Award className="h-4 w-4 text-amber-500" />}
                      <span className="text-xs font-medium">{currentUserPlan}</span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to see plan details.</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-72 p-4 shadow-xl rounded-lg border-border/30">
                <div className="space-y-3">
                  <h4 className="font-semibold text-md text-foreground">{planDetailsToDisplay.name}</h4>
                   <ul className="space-y-2 text-sm text-muted-foreground">
                    {planDetailsToDisplay.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {currentUserPlan === FREE_TIER_NAME && (
                    <Button asChild size="sm" className="w-full mt-3">
                      <Link href="/pricing">Upgrade to Premium</Link>
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {currentUserPlan === FREE_TIER_NAME && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={generationsLeft > 0 ? "secondary" : "destructive"} className="text-xs cursor-default h-7 px-2.5">
                            {generationsLeft > 0 ? `${generationsLeft} / ${MAX_FREE_GENERATIONS} Gens Left` : "No Gens Left"}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{generationsLeft > 0 ? `You have ${generationsLeft} project generations remaining on the ${FREE_TIER_NAME}.` : `You have used all project generations on the ${FREE_TIER_NAME}. Upgrade for unlimited.`}</p>
                    </TooltipContent>
                </Tooltip>
            )}

            <Button variant="outline" size="icon" onClick={handleLogout} className="ml-1 h-7 w-7">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
         <div className="sm:hidden border-t">
            <Tabs value={currentView} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border-none rounded-none">
                    <TabsTrigger value="app" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none py-2.5 text-xs font-medium flex flex-col items-center gap-1 h-auto">
                    <Wand2 className="h-4 w-4" /> App
                    </TabsTrigger>
                    <TabsTrigger value="roadmap" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none py-2.5 text-xs font-medium flex flex-col items-center gap-1 h-auto">
                    <Milestone className="h-4 w-4" /> Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="library" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none py-2.5 text-xs font-medium flex flex-col items-center gap-1 h-auto">
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
            generationsUsed={generationsUsed}
            maxFreeGenerations={MAX_FREE_GENERATIONS}
            onGenerationUsed={incrementGenerationUsed}
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
