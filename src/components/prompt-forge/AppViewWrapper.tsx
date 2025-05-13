
"use client";

import React, { useState, useEffect } from 'react';
import AppView from '@/components/prompt-forge/AppView';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary as saveProjectToLibraryService, deleteProjectFromLibrary as deleteProjectFromLibraryService, getProjectById as getProjectByIdService } from '@/lib/libraryService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wand2, Library as LibraryIcon, Milestone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/prompt-forge/layout'; // Updated import

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
            description: `Your library can hold ${MAX_FREE_CREDITS} project(s) on the Free Tier. Please upgrade or delete an existing project.`,
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
         <button onClick={() => router.push('/login')} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">Go to Login</button>
       </div>
     );
  }

  return (
    <>
      <AppHeader
        currentView={currentView}
        onTabChange={handleTabChange}
        currentUserPlan={currentUserPlan}
        creditsUsed={creditsUsed}
        maxFreeCredits={MAX_FREE_CREDITS}
        onLogout={handleLogout}
        savedProjectsCount={savedProjects.length}
      />

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
    </>
  );
}
