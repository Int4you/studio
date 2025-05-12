'use client';

import type { SavedProject } from './libraryModels';

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

export const saveProjectToLibrary = (project: SavedProject): void => {
  const storage = getLocalStorage();
  if (!storage) return;

  const projects = getProjectsFromLibrary();
  const existingProjectIndex = projects.findIndex(p => p.id === project.id);

  if (existingProjectIndex > -1) {
    projects[existingProjectIndex] = project; // Update existing project
  } else {
    projects.unshift(project); // Add new project to the beginning
  }
  
  storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(projects));
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
