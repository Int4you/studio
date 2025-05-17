
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AppView from '@/components/prompt-forge/AppView';
import type { SavedProject } from '@/lib/libraryModels';
import { getProjectsFromLibrary, saveProjectToLibrary as saveProjectToLibraryService, deleteProjectFromLibrary as deleteProjectFromLibraryService, getProjectById as getProjectByIdService } from '@/lib/libraryService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Award, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/prompt-forge/layout'; 
import RoadmapView from './RoadmapView';
import LibraryView from './LibraryView';
import { FREE_TIER_NAME, PREMIUM_CREATOR_NAME, MAX_FREE_CREDITS, freePlanUIDetails, premiumPlanUIDetails } from '@/config/plans';
import { Button } from '@/components/ui/button'; 
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; 
import { CardHeader, CardTitle } from '@/components/ui/card'; 
import { Zap, Crown, CheckCircle2 } from 'lucide-react'; 
import { Badge } from '@/components/ui/badge'; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; 
import Link from 'next/link'; 
import { auth } from '@/lib/firebase/firebase'; // Import Firebase auth
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";

export type CurrentView = 'app' | 'roadmap' | 'library';
const FREE_CREDITS_STORAGE_KEY_PREFIX = 'promptForgeFreeCreditsUsed_'; // Add prefix
const USER_PLAN_STORAGE_KEY_PREFIX = 'promptForgeUserPlan_'; // Add prefix


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

  // Define user specific storage keys
  const getUserSpecificStorageKey = useCallback((baseKey: string) => {
    return currentUser ? `${baseKey}${currentUser.uid}` : null;
  }, [currentUser]);


  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth is not initialized in AppViewWrapper.");
      setAuthStatus('unauthenticated'); // Or 'loading' if you want to show a loader briefly
      router.push('/login');
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthStatus('authenticated');
        
        const planStorageKey = `${USER_PLAN_STORAGE_KEY_PREFIX}${user.uid}`;
        const creditsStorageKey = `${FREE_CREDITS_STORAGE_KEY_PREFIX}${user.uid}`;

        const storedPlan = localStorage.getItem(planStorageKey);
        if (storedPlan === PREMIUM_CREATOR_NAME || user.email === "user@example.com") { // Keep hardcoded premium logic for now
            setCurrentUserPlan(PREMIUM_CREATOR_NAME);
            localStorage.removeItem(creditsStorageKey); // Premium users don't use credits
            setCreditsUsed(0);
        } else {
            setCurrentUserPlan(FREE_TIER_NAME);
            const storedCredits = parseInt(localStorage.getItem(creditsStorageKey) || '0', 10);
            setCreditsUsed(storedCredits);
        }
        // Load projects after user is confirmed
        setSavedProjects(await getProjectsFromLibrary(user.uid));

      } else {
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        setCurrentUserPlan(FREE_TIER_NAME);
        setCreditsUsed(0); 
        setSavedProjects([]);
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
    if (!auth) {
      toast({ title: "Logout Error", description: "Auth service not ready.", variant: "destructive"});
      return;
    }
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will handle state updates (user to null, redirect, etc.)
      // Clear user-specific localStorage if any was directly managed here (plan/credits are now keyed by UID)
      const planStorageKey = getUserSpecificStorageKey(USER_PLAN_STORAGE_KEY_PREFIX.slice(0, -1)); // remove trailing _
      const creditsStorageKey = getUserSpecificStorageKey(FREE_CREDITS_STORAGE_KEY_PREFIX.slice(0, -1));
      if (planStorageKey) localStorage.removeItem(planStorageKey);
      if (creditsStorageKey) localStorage.removeItem(creditsStorageKey);
      
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      // router.push('/login') is handled by onAuthStateChanged
    } catch (error) {
      console.error("Firebase sign out error", error);
      toast({ title: "Logout Failed", description: "Could not log you out.", variant: "destructive"});
    }
  };

  const loadProjectFromLibrary = async (projectId: string) => {
    if (!currentUser) return;
    const project = await getProjectByIdService(currentUser.uid, projectId);
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
  
  const deleteProjectFromLibrary = async (projectId: string) => {
    if (!currentUser) return;
    await deleteProjectFromLibraryService(currentUser.uid, projectId);
    const updatedProjects = await getProjectsFromLibrary(currentUser.uid);
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

  const saveProjectToLibrary = async (project: SavedProject): Promise<boolean> => {
    if (!currentUser) {
      toast({ title: "Not Authenticated", description: "Please log in to save projects.", variant: "destructive"});
      return false;
    }
    const success = await saveProjectToLibraryService(currentUser.uid, project, currentUserPlan); 
    if (success) {
        const updatedProjects = await getProjectsFromLibrary(currentUser.uid);
        setSavedProjects(updatedProjects);
        if (projectToLoadInApp?.id === project.id) { // If updating the currently loaded project
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
    if (currentUserPlan === FREE_TIER_NAME && currentUser) {
      setCreditsUsed(prev => {
        const newCount = prev + 1;
        const creditsStorageKey = `${FREE_CREDITS_STORAGE_KEY_PREFIX}${currentUser.uid}`;
        localStorage.setItem(creditsStorageKey, newCount.toString());
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

  if (authStatus === 'unauthenticated' || !currentUser) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-6 text-xl text-muted-foreground">Redirecting to login...</p>
       </div>
     );
  }
  
  const isPremium = currentUserPlan === PREMIUM_CREATOR_NAME;
  
  return (
    <TooltipProvider>
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
    </TooltipProvider>
  );
}
