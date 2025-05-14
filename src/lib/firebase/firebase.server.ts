// src/lib/firebase/firebase.server.ts
import * as admin from 'firebase-admin';

let 특징Auth: admin.auth.Auth;
let 특징Db: admin.firestore.Firestore;

const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

if (!admin.apps.length) {
  if (serviceAccountKeyJson) {
    try {
      const parsedServiceAccount = JSON.parse(serviceAccountKeyJson);
      admin.initializeApp({
        credential: admin.credential.cert(parsedServiceAccount),
      });
      특징Auth = admin.auth();
      특징Db = admin.firestore();
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error('Firebase Admin Initialization Error:', error);
      console.warn(
        'Firebase Admin SDK failed to initialize. Server-side Firebase features will not be available.'
      );
      // Provide stub implementations or throw if used
      // @ts-ignore
      특징Auth = { createUser: () => Promise.reject(new Error("Firebase Admin not initialized")) };
      // @ts-ignore
      특징Db = { collection: () => { throw new Error("Firebase Admin not initialized") } };
    }
  } else {
    console.warn(
      'WARNING: FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.' +
      ' Firebase Admin SDK will not be initialized. Server-side Firebase features (e.g., user creation via server actions) will not work.' +
      ' Please set this variable in your .env file with your Firebase service account key JSON.'
    );
    // Provide stub implementations or throw if used
    // @ts-ignore
    특징Auth = { createUser: () => Promise.reject(new Error("Firebase Admin not initialized. FIREBASE_SERVICE_ACCOUNT_KEY_JSON is missing.")) };
    // @ts-ignore
    특징Db = { collection: () => { throw new Error("Firebase Admin not initialized. FIREBASE_SERVICE_ACCOUNT_KEY_JSON is missing.") } };
  }
} else {
  // App already initialized
  특징Auth = admin.auth();
  특징Db = admin.firestore();
}

export { 특징Auth, 특징Db };
