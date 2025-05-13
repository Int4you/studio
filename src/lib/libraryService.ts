
'use client';

import type { SavedProject } from './libraryModels';
import { FREE_TIER_NAME, MAX_FREE_TIER_PROJECTS_IN_LIBRARY } from '@/config/plans';

const LIBRARY_STORAGE_KEY = 'promptForgeLibrary';

// Helper to ensure localStorage is only accessed on the client
const getLocalStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

export const getProjectsFromLibrary = (): SavedProject[] => {
  const storage = getLocalStorage();
  if (!storage) return [];

  const projectsJson = storage.getItem(LIBRARY_STORAGE_KEY);
  if (projectsJson) {
    try {
      const projects = JSON.parse(projectsJson) as SavedProject[];
      // Sort by savedAt date, newest first
      return projects.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    } catch (error) {
      console.error("Error parsing projects from localStorage:", error);
      return [];
    }
  }
  return [];
};

export const saveProjectToLibrary = (project: SavedProject, currentUserPlan: string): boolean => {
  const storage = getLocalStorage();
  if (!storage) return false;

  const projects = getProjectsFromLibrary();
  const existingProjectIndex = projects.findIndex(p => p.id === project.id);

  if (currentUserPlan === FREE_TIER_NAME && existingProjectIndex === -1 && projects.length >= MAX_FREE_TIER_PROJECTS_IN_LIBRARY) {
    // User is on Free Tier, trying to save a NEW project, and already at their project limit.
    // We allow updating an existing project even if it's the only one.
    console.warn(`Free Tier: Library limit of ${MAX_FREE_TIER_PROJECTS_IN_LIBRARY} project(s) reached. Cannot save new project.`);
    return false; // Indicate save failed due to limit
  }

  if (existingProjectIndex > -1) {
    projects[existingProjectIndex] = project; // Update existing project
  } else {
    projects.unshift(project); // Add new project to the beginning
  }
  
  storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(projects));
  return true; // Indicate save succeeded
};

export const getProjectById = (id: string): SavedProject | undefined => {
  const projects = getProjectsFromLibrary();
  return projects.find(project => project.id === id);
};

export const deleteProjectFromLibrary = (id: string): void => {
  const storage = getLocalStorage();
  if (!storage) return;

  let projects = getProjectsFromLibrary();
  projects = projects.filter(project => project.id !== id);
  storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(projects));
};
