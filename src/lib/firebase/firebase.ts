// src/lib/firebase/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmIJpR_r82kXyuOsSW4Ex3yjEGZUqOIbY",
  authDomain: "promptforge-anwjb.firebaseapp.com",
  projectId: "promptforge-anwjb",
  storageBucket: "promptforge-anwjb.firebasestorage.app",
  messagingSenderId: "1074512255399",
  appId: "1:1074512255399:web:3a86448c2379216a033e82"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') { // Ensure this runs only on the client
  if (!firebaseConfig.apiKey) {
    console.error(
      'Firebase Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing. ' +
      'Please ensure it is correctly set in your .env file and the server is restarted.'
    );
  }

  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error("Firebase client initialization error:", error);
      // Fallback to prevent app crash, but features needing Firebase will be broken
      // @ts-ignore
      app = app || {}; 
      // @ts-ignore
      auth = auth || {};
      // @ts-ignore
      db = db || {};
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} else {
  // Server-side or during build, provide dummy objects or handle appropriately
  // For now, let's ensure they are defined to avoid undefined errors during import if server code tries to use them
  // This part may not be strictly necessary if server code always uses firebase.server.ts
    // @ts-ignore
    app = app || {};
    // @ts-ignore
    auth = auth || {};
    // @ts-ignore
    db = db || {};
}


export { app, auth, db };
