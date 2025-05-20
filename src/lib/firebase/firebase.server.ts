// src/lib/firebase/firebase.server.ts
import * as admin from 'firebase-admin';

const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;

// This log helps to see if the variable is being picked up by the Node.js process at all.
console.log('[Firebase Server] Checking for FIREBASE_SERVICE_ACCOUNT_KEY_JSON...');

if (!admin.apps.length) {
  if (!serviceAccountKeyJson) {
    console.warn(
      '[Firebase Server Setup WARN] FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is NOT SET. ' +
      'Server-side Firebase features (like user creation via server actions) will NOT be available.'
    );
    // Provide dummy objects to prevent crashes if features are called
    // @ts-ignore
    adminApp = {};
    // @ts-ignore
    adminAuth = {};
    // @ts-ignore
    adminDb = {};
  } else if (serviceAccountKeyJson.trim() === "") {
    console.warn(
      '[Firebase Server Setup WARN] FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable IS EMPTY. ' +
      'Server-side Firebase features will NOT be available.'
    );
    // @ts-ignore
    adminApp = {};
    // @ts-ignore
    adminAuth = {};
    // @ts-ignore
    adminDb = {};
  }
  else {
    console.log('[Firebase Server] FIREBASE_SERVICE_ACCOUNT_KEY_JSON found. Length:', serviceAccountKeyJson.length);
    // Log a very small, non-sensitive part to confirm it's not just an empty string or whitespace
    console.log('[Firebase Server] Key Snippet (first 20 & last 20 chars):', serviceAccountKeyJson.substring(0, 20) + "..." + serviceAccountKeyJson.substring(serviceAccountKeyJson.length - 20));
    try {
      const parsedServiceAccount = JSON.parse(serviceAccountKeyJson);
      console.log('[Firebase Server] Successfully parsed FIREBASE_SERVICE_ACCOUNT_KEY_JSON.');
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(parsedServiceAccount),
      });
      adminAuth = admin.auth(adminApp);
      adminDb = admin.firestore(adminApp);
      console.log('[Firebase Server] Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('[Firebase Server Setup ERROR] Error initializing Firebase Admin SDK. This is critical for server-side auth.');
      console.error('[Firebase Server Setup ERROR] Ensure FIREBASE_SERVICE_ACCOUNT_KEY_JSON in your .env.local (root directory) is a valid JSON string from your Firebase project.');
      if (error.message.includes('JSON.parse')) {
        console.error('[Firebase Server Setup ERROR] Specific Error: Failed to parse the service account JSON. Please check for typos or formatting issues in the JSON string within your .env.local file.');
      } else if (error.message.includes('Must be a valid credential')) {
         console.error('[Firebase Server Setup ERROR] Specific Error: The parsed JSON was not a valid Firebase credential. Ensure you copied the entire service account key JSON correctly.');
      } else {
        console.error('[Firebase Server Setup ERROR] Specific Error:', error.message);
      }
      // Fallback to dummy objects
      // @ts-ignore
      adminApp = {};
      // @ts-ignore
      adminAuth = {};
      // @ts-ignore
      adminDb = {};
    }
  }
} else {
  adminApp = admin.app();
  adminAuth = admin.auth(adminApp);
  adminDb = admin.firestore(adminApp);
  console.log('[Firebase Server] Firebase Admin SDK already initialized.');
}

export { adminApp, adminAuth, adminDb };
