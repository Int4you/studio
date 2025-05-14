
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
import { auth } from '@/lib/firebase/firebase'; // Firebase client SDK
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { signOutUserServerAction } from '@/app/actions/auth'; // Server action for sign out (optional server part)

export type CurrentView = 'app' | 'roadmap' | 'library';
const FREE_CREDITS_STORAGE_KEY = 'promptForgeFreeCreditsUsed';
const USER_PLAN_STORAGE_KEY = 'promptForgeUserPlan';

export default function AppViewWrapper() {
  const { toast } = useToast();
  const router = useRouter();

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentView, setCurrentView] = useState<CurrentView>('app');
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserPlan, setCurrentUserPlan] = useState<string>(FREE_TIER_NAME); 
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  
  const [projectToLoadInApp, setProjectToLoadInApp] = useState<SavedProject | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthStatus('authenticated');
        setSavedProjects(getProjectsFromLibrary()); // Load projects for the authenticated user context

        // Temporary: Set premium plan on login for demo purposes. In real app, fetch from DB.
        const storedPlan = localStorage.getItem(USER_PLAN_STORAGE_KEY);
        if (storedPlan === PREMIUM_CREATOR_NAME) {
            setCurrentUserPlan(PREMIUM_CREATOR_NAME);
            localStorage.removeItem(FREE_CREDITS_STORAGE_KEY); // Premium users don't use free credits
            setCreditsUsed(0);
        } else {
            // Default to Free Tier if no premium plan is stored or if it's an old/invalid value
            setCurrentUserPlan(FREE_TIER_NAME);
            const storedCredits = parseInt(localStorage.getItem(FREE_CREDITS_STORAGE_KEY) || '0', 10);
            setCreditsUsed(storedCredits);
        }
      } else {
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        // Reset to Free Tier defaults for UI consistency before redirect
        setCurrentUserPlan(FREE_TIER_NAME);
        setCreditsUsed(0); 
        setSavedProjects([]); // Clear projects when logged out
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleTabChange = (value: string) => {
    const newView = value as CurrentView;
    setCurrentView(newView);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase client SDK sign out
      await signOutUserServerAction(); // Optional: Call server action for any server-side cleanup

      localStorage.removeItem(USER_PLAN_STORAGE_KEY);
      localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
      // Auth state change will be handled by onAuthStateChanged, triggering redirect
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
       toast({ title: "Logout Failed", description: error.message || "Could not log out.", variant: "destructive" });
    }
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
    // Pass the current user's actual plan state for library limit checks
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
     // onAuthStateChanged already handles redirect to /login
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-6 text-xl text-muted-foreground">Redirecting to login...</p>
       </div>
     );
  }
  
  // User is authenticated
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
