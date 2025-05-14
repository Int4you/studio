
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AppView from '@/components/prompt-forge/AppView';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary as saveProjectToLibraryService, deleteProjectFromLibrary as deleteProjectFromLibraryService, getProjectById as getProjectByIdService } from '@/lib/libraryService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/prompt-forge/layout'; 
import RoadmapView from './RoadmapView';
import LibraryView from './LibraryView';
import { FREE_TIER_NAME, PREMIUM_CREATOR_NAME, MAX_FREE_CREDITS } from '@/config/plans';
// Firebase related imports are removed

export type CurrentView = 'app' | 'roadmap' | 'library';
const FREE_CREDITS_STORAGE_KEY = 'promptForgeFreeCreditsUsed';
const USER_PLAN_STORAGE_KEY = 'promptForgeUserPlan';
const MOCK_USER_SESSION_KEY = 'promptForgeMockUserSession';


export default function AppViewWrapper() {
  const { toast } = useToast();
  const router = useRouter();

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentView, setCurrentView] = useState<CurrentView>('app');
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  // currentUser state is no longer FirebaseUser, can be a simple object or null
  const [currentUser, setCurrentUser] = useState<{ email: string; uid: string } | null>(null); 
  const [currentUserPlan, setCurrentUserPlan] = useState<string>(FREE_TIER_NAME); 
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  
  const [projectToLoadInApp, setProjectToLoadInApp] = useState<SavedProject | null>(null);

  useEffect(() => {
    // Simulate checking auth status (e.g., from localStorage)
    const mockSession = localStorage.getItem(MOCK_USER_SESSION_KEY);
    if (mockSession) {
      try {
        const user = JSON.parse(mockSession);
        setCurrentUser(user);
        setAuthStatus('authenticated');
        setSavedProjects(getProjectsFromLibrary());

        const storedPlan = localStorage.getItem(USER_PLAN_STORAGE_KEY);
        if (storedPlan === PREMIUM_CREATOR_NAME) {
            setCurrentUserPlan(PREMIUM_CREATOR_NAME);
            localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
            setCreditsUsed(0);
        } else {
            setCurrentUserPlan(FREE_TIER_NAME);
            const storedCredits = parseInt(localStorage.getItem(FREE_CREDITS_STORAGE_KEY) || '0', 10);
            setCreditsUsed(storedCredits);
        }
      } catch (e) {
        // Invalid session data, treat as unauthenticated
        localStorage.removeItem(MOCK_USER_SESSION_KEY);
        setAuthStatus('unauthenticated');
        router.push('/login');
      }
    } else {
      setAuthStatus('unauthenticated');
      setCurrentUserPlan(FREE_TIER_NAME);
      setCreditsUsed(0); 
      setSavedProjects([]);
      router.push('/login');
    }
  }, [router]);

  const handleTabChange = (value: string) => {
    const newView = value as CurrentView;
    setCurrentView(newView);
  };

  const handleLogout = async () => {
    // Mock logout
    localStorage.removeItem(MOCK_USER_SESSION_KEY);
    localStorage.removeItem(USER_PLAN_STORAGE_KEY);
    localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
    setCurrentUser(null);
    setAuthStatus('unauthenticated');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login'); // Redirect to login after "logging out"
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

      <main className="container mx-auto p-2 sm:p-4 md:p-6 lg:p-8 max-w-7xl mt-2 sm:mt-4 flex-grow overflow-y-auto">
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
