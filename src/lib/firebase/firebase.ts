import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error("Firebase initialization error:", error);
      // Provide placeholder/stub objects to prevent further errors if initialization fails
      // This is a basic fallback; a more robust app might show a global error message.
      // @ts-ignore
      app = undefined;
      // @ts-ignore
      auth = undefined;
      // @ts-ignore
      db = undefined;
      // It's critical the user fixes their .env variables.
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} else {
  // This block is for server-side or non-browser environments,
  // which should ideally not be importing this client-side Firebase setup.
  // However, to prevent crashes during server-side rendering if imported accidentally:
  // @ts-ignore
  app = undefined;
  // @ts-ignore
  auth = undefined;
  // @ts-ignore
  db = undefined;
}

export { app, auth, db };
