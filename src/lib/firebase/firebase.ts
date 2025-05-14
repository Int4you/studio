
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
      if (!firebaseConfig.apiKey) {
        console.error(
          'Firebase Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing. ' +
          'Please ensure it is correctly set in your .env file and the server is restarted.'
        );
      }
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error(
        'Firebase client-side initialization error. ' +
        'PLEASE CHECK YOUR .env FILE (or .env.local) and ensure all NEXT_PUBLIC_FIREBASE_... variables (especially NEXT_PUBLIC_FIREBASE_API_KEY) are correctly set. ' +
        'You may need to restart your Next.js development server after changes.',
        error
      );
      // Provide placeholder/stub objects to prevent further errors if initialization fails
      // @ts-ignore
      app = undefined;
      // @ts-ignore
      auth = undefined;
      // @ts-ignore
      db = undefined;
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
