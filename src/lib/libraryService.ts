
'use client';

import type { SavedProject } from './libraryModels';
import { FREE_TIER_NAME, MAX_FREE_TIER_PROJECTS_IN_LIBRARY } from '@/config/plans';
import { db } from './firebase/firebase'; // Import Firestore instance
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  limit,
  where,
  serverTimestamp, // For setting savedAt with server time
  Timestamp
} from "firebase/firestore";

// Helper to ensure db is available (client-side)
const getDb = (): typeof db | null => {
  if (typeof window !== 'undefined' && db) {
    return db;
  }
  console.warn("Firestore client (db) is not available.");
  return null;
};

export const getProjectsFromLibrary = async (userId: string): Promise<SavedProject[]> => {
  const firestoreDb = getDb();
  if (!firestoreDb || !userId) return [];

  try {
    const projectsCol = collection(firestoreDb, `users/${userId}/projects`);
    const q = query(projectsCol, orderBy("savedAt", "desc"));
    const projectSnapshot = await getDocs(q);
    const projectsList = projectSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { 
            ...data, 
            id: docSnap.id,
            savedAt: (data.savedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() // Convert Firestore Timestamp
        } as SavedProject;
    });
    return projectsList;
  } catch (error) {
    console.error("Error fetching projects from Firestore:", error);
    return [];
  }
};

export const saveProjectToLibrary = async (userId: string, project: SavedProject, currentUserPlan: string): Promise<boolean> => {
  const firestoreDb = getDb();
  if (!firestoreDb || !userId) return false;

  const projectRef = doc(firestoreDb, `users/${userId}/projects`, project.id);

  if (currentUserPlan === FREE_TIER_NAME) {
    const projectExists = (await getDoc(projectRef)).exists();
    if (!projectExists) { // Only check limit if it's a new project for free tier
      const projectsCol = collection(firestoreDb, `users/${userId}/projects`);
      const q = query(projectsCol, limit(MAX_FREE_TIER_PROJECTS_IN_LIBRARY + 1)); // Check if limit is already reached or exceeded
      const snapshot = await getDocs(q);
      if (snapshot.docs.length >= MAX_FREE_TIER_PROJECTS_IN_LIBRARY) {
        console.warn(`Free Tier: Library limit of ${MAX_FREE_TIER_PROJECTS_IN_LIBRARY} project(s) reached.`);
        return false;
      }
    }
  }
  
  try {
    // Use serverTimestamp for savedAt on initial save, or keep existing if updating
    // For simplicity, we'll overwrite savedAt with current ISO string, but serverTimestamp is better for accuracy.
    // To use serverTimestamp, the field type in Firestore should be Timestamp.
    const projectDataToSave = {
        ...project,
        savedAt: new Date().toISOString() // Or use serverTimestamp() for Firestore native timestamp
        // userId: userId, // Store userId within the document as well if needed for broader queries (ensure rules cover this)
    };
    await setDoc(projectRef, projectDataToSave, { merge: true }); // merge: true allows updates
    return true;
  } catch (error) {
    console.error("Error saving project to Firestore:", error);
    return false;
  }
};

export const getProjectById = async (userId: string, id: string): Promise<SavedProject | undefined> => {
  const firestoreDb = getDb();
  if (!firestoreDb || !userId) return undefined;

  try {
    const projectRef = doc(firestoreDb, `users/${userId}/projects`, id);
    const docSnap = await getDoc(projectRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
          ...data, 
          id: docSnap.id,
          savedAt: (data.savedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      } as SavedProject;
    }
    return undefined;
  } catch (error) {
    console.error("Error getting project by ID from Firestore:", error);
    return undefined;
  }
};

export const deleteProjectFromLibrary = async (userId: string, id: string): Promise<void> => {
  const firestoreDb = getDb();
  if (!firestoreDb || !userId) return;

  try {
    const projectRef = doc(firestoreDb, `users/${userId}/projects`, id);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error("Error deleting project from Firestore:", error);
  }
};
