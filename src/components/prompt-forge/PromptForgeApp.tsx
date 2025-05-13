/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary as saveProjectToLibraryService, deleteProjectFromLibrary as deleteProjectFromLibraryService, getProjectById as getProjectByIdService } from '@/lib/libraryService';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Cpu, Wand2, Library as LibraryIcon, Milestone, LogOut, Zap, Award, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2 } from 'lucide-react';

import AppView from './AppView';
import RoadmapView from './RoadmapView';
import LibraryView from './LibraryView';

export type CurrentView = 'app' | 'roadmap' | 'library';
const AUTH_TOKEN_KEY = 'promptForgeAuthToken';

const freePlanDetails = {
  name: 'Free Explorer',
  features: [
    '3 Project Generations per month',
    'Access to all core AI features',
    'Standard support',
    'Save up to 1 project in library',
  ],
};

export default function PromptForgeApp() {
  const { toast } = useToast();
  const router = useRouter();

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentView, setCurrentView] = useState<CurrentView>('app');
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('Free Explorer');
  
  // State to pass a loaded project to AppView
  const [projectToLoadInApp, setProjectToLoadInApp] = useState<SavedProject | null>(null);


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

  const handleTabChange = (value: string) => {
    const newView = value as CurrentView;
    setCurrentView(newView);
    if (newView === 'app' && projectToLoadInApp) {
        // If switching to app view and a project was meant to be loaded, clear it
        // as AppView will handle its own state or receive it.
        // This helps if user navigates away before AppView processes it.
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthStatus('unauthenticated');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const loadProjectFromLibrary = (projectId: string) => {
    const project = getProjectByIdService(projectId);
    if (project) {
      setProjectToLoadInApp(project); // Set project to load
      setCurrentView('app'); // Switch to app view
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
    // If the deleted project was the one intended to be loaded into AppView, clear it
    if (projectToLoadInApp?.id === projectId) {
        setProjectToLoadInApp(null);
    }
    toast({
      title: "Project Deleted",
      description: "The project has been removed from your library.",
      variant: "destructive"
    });
  };

  const saveProjectToLibrary = (project: SavedProject) => {
    saveProjectToLibraryService(project);
    const updatedProjects = getProjectsFromLibrary();
    setSavedProjects(updatedProjects);
    // If projectToLoadInApp matches the one being saved, update it or clear it
    // to ensure AppView gets fresh data if it reloads, or relies on its own state.
    if (projectToLoadInApp?.id === project.id) {
      setProjectToLoadInApp(project); 
    }
    toast({
      title: projectToLoadInApp?.id === project.id ? "Project Updated" : "Project Saved",
      description: `${project.appName} has been ${projectToLoadInApp?.id === project.id ? 'updated in' : 'saved to'} your library.`,
    });
  };


  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-muted-foreground">Loading Application...</p>
      </div>
    );
  }

  // This useEffect will run after router.push, so the redirect should happen first.
  // If still unauthenticated after router.push (e.g., if navigation is slow or prevented),
  // this fallback can show a message or a minimal UI.
  if (authStatus === 'unauthenticated') {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-6 text-xl text-muted-foreground">Redirecting to login...</p>
         <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
       </div>
     );
  }

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
          <div className="flex items-center gap-4">
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
            <Popover>
              <PopoverTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 border border-border/50 px-2.5 py-1 rounded-md bg-muted/30 dark:bg-muted/10 shadow-sm cursor-pointer">
                      {currentUserPlan === 'Free Explorer' ? <Zap className="h-4 w-4 text-primary" /> : <Award className="h-4 w-4 text-amber-500" />}
                      <Badge variant="outline" className="text-xs border-none p-0 bg-transparent shadow-none">
                          {currentUserPlan}
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to see plan details.</p>
                    {currentUserPlan === 'Free Explorer' && <p className="text-xs text-muted-foreground">Limited generations per month.</p>}
                    {currentUserPlan === 'Premium Creator' && <p className="text-xs text-muted-foreground">Unlimited access and features.</p>}
                  </TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 shadow-xl rounded-lg border-border/30">
                <div className="space-y-3">
                  <h4 className="font-semibold text-md text-foreground">{freePlanDetails.name}</h4>
                   <ul className="space-y-2 text-sm text-muted-foreground">
                    {freePlanDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {currentUserPlan === 'Free Explorer' && (
                    <Button asChild size="sm" className="w-full mt-3">
                      <Link href="/pricing">Upgrade to Premium</Link>
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
              <LogOut className="mr-1.5 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-7xl mt-4">
        {currentView === 'app' && (
          <AppView 
            initialProject={projectToLoadInApp}
            onProjectSave={saveProjectToLibrary}
            clearInitialProject={() => setProjectToLoadInApp(null)}
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
                setProjectToLoadInApp(null); // Ensure no project is pre-loaded
                setCurrentView('app');
            }}
          />
        )}
      </main>
    </TooltipProvider>
  );
}
