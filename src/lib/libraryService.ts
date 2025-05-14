
'use client';

import type { SavedProject } from './libraryModels';
import { FREE_TIER_NAME, MAX_FREE_TIER_PROJECTS_IN_LIBRARY } from '@/config/plans';
// Firebase imports are removed

const LOCAL_STORAGE_LIBRARY_KEY = 'promptForgeLibrary_projects';

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

  const projectsJson = storage.getItem(LOCAL_STORAGE_LIBRARY_KEY);
  if (projectsJson) {
    try {
      const projects = JSON.parse(projectsJson) as SavedProject[];
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
    console.warn(`Free Tier: Library limit of ${MAX_FREE_TIER_PROJECTS_IN_LIBRARY} project(s) reached.`);
    return false; 
  }

  if (existingProjectIndex > -1) {
    projects[existingProjectIndex] = project; 
  } else {
    projects.unshift(project); 
  }
  
  storage.setItem(LOCAL_STORAGE_LIBRARY_KEY, JSON.stringify(projects));
  return true;
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
  storage.setItem(LOCAL_STORAGE_LIBRARY_KEY, JSON.stringify(projects));
};
