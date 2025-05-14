
'use client';

import type { SavedProject } from './libraryModels';
import { FREE_TIER_NAME, MAX_FREE_TIER_PROJECTS_IN_LIBRARY } from '@/config/plans';
// import { auth, db } from './firebase/firebase'; // Import for future Firebase integration
// import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';
// import { onAuthStateChanged, type User } from 'firebase/auth';

const LOCAL_STORAGE_LIBRARY_KEY = 'promptForgeLibrary_projects'; // Key per user might be complex with pure localStorage

// let currentFirebaseUser: User | null = null;

// // Listen to auth state changes to get the current user for DB operations
// // This is a basic setup; a more robust solution might use a context or state management
// if (typeof window !== 'undefined') {
//   onAuthStateChanged(auth, (user) => {
//     currentFirebaseUser = user;
//   });
// }

// Helper to ensure localStorage is only accessed on the client
const getLocalStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

// ===== localStorage Implementation (Current) =====

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
  if (!storage) return false; // Cannot save if localStorage is not available

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


// ===== Firestore Implementation (Future - commented out) =====
/*
const getUserProjectsCollection = () => {
  if (!currentFirebaseUser) {
    // This should ideally not happen if UI ensures user is logged in for these operations
    console.error("No authenticated user found for Firestore operation.");
    throw new Error("User not authenticated.");
  }
  return collection(db, `users/${currentFirebaseUser.uid}/projects`);
};

export const getProjectsFromLibraryDB = async (): Promise<SavedProject[]> => {
  if (!currentFirebaseUser) return [];
  const projectsCol = getUserProjectsCollection();
  const q = query(projectsCol, orderBy("savedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedProject));
};

export const saveProjectToLibraryDB = async (project: SavedProject, currentUserPlan: string): Promise<boolean> => {
  if (!currentFirebaseUser) return false;
  const projectsCol = getUserProjectsCollection();

  if (currentUserPlan === FREE_TIER_NAME) {
    const q = query(projectsCol, limit(MAX_FREE_TIER_PROJECTS_IN_LIBRARY + 1)); // Check if limit is reached or will be exceeded
    const snapshot = await getDocs(q);
    const existingProject = snapshot.docs.find(doc => doc.id === project.id);
    if (!existingProject && snapshot.size >= MAX_FREE_TIER_PROJECTS_IN_LIBRARY) {
      console.warn(`Free Tier: Library limit of ${MAX_FREE_TIER_PROJECTS_IN_LIBRARY} project(s) reached for DB.`);
      return false;
    }
  }

  try {
    const projectDocRef = doc(projectsCol, project.id); // Use project.id for doc ID
    // Check if document exists to decide between addDoc (new) or updateDoc (existing)
    // For simplicity, if using project.id as doc ID, use setDoc with merge true or check existence first.
    // Or, if project.id is only for client-side, then always addDoc and Firestore generates ID.
    // Assuming project.id might be pre-existing from localStorage or a new client-generated one.
    
    // This simplified version will overwrite or create. A more robust one would check.
    // await setDoc(projectDocRef, project, { merge: true }); // Creates or overwrites
    
    // Alternative: Check if exists, then update or add
    const existingDoc = (await getDocs(query(projectsCol, where("id", "==", project.id), limit(1)))).docs[0];

    if (existingDoc) {
      await updateDoc(doc(projectsCol, existingDoc.id), project);
    } else {
      await addDoc(projectsCol, project); // Firestore will generate an ID, or use setDoc(doc(projectsCol, project.id), project)
    }
    return true;
  } catch (error) {
    console.error("Error saving project to Firestore:", error);
    return false;
  }
};

export const getProjectByIdDB = async (id: string): Promise<SavedProject | undefined> => {
  if (!currentFirebaseUser) return undefined;
  // This requires knowing the Firestore document ID. If project.id is not the Firestore doc ID,
  // you'd query by the 'id' field.
  // const projectDoc = doc(getUserProjectsCollection(), id);
  // const docSnap = await getDoc(projectDoc);
  // if (docSnap.exists()) {
  //   return { id: docSnap.id, ...docSnap.data() } as SavedProject;
  // }
  // Querying by a field:
  const q = query(getUserProjectsCollection(), where("id", "==", id), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as SavedProject;
  }
  return undefined;
};

export const deleteProjectFromLibraryDB = async (id: string): Promise<void> => {
  if (!currentFirebaseUser) return;
  // This requires knowing the Firestore document ID if `id` is not it.
  // For simplicity, assuming `id` is the document ID or you query to find it.
  try {
    // If `id` is not the Firestore doc ID, you'd query first:
    const q = query(getUserProjectsCollection(), where("id", "==", id), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(getUserProjectsCollection(), snapshot.docs[0].id));
    }
  } catch (error) {
    console.error("Error deleting project from Firestore:", error);
  }
};
*/

// For now, the app continues to use localStorage.
// To switch to Firestore:
// 1. Uncomment Firestore imports and functions.
// 2. Comment out localStorage functions.
// 3. Update calling components (e.g., AppViewWrapper) to use the async DB functions.
// 4. Implement robust user authentication and ensure `currentFirebaseUser` is correctly managed.
// 5. Set up Firestore rules for security.
