// src/lib/firebase/firebase.server.ts
import * as admin from 'firebase-admin';

const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;

if (!admin.apps.length) {
  if (!serviceAccountKeyJson) {
    console.warn(
      'Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set. ' +
      'Server-side Firebase features will not be available.'
    );
    // Provide dummy objects to prevent crashes if features are called
    // @ts-ignore
    adminApp = {};
    // @ts-ignore
    adminAuth = {};
    // @ts-ignore
    adminDb = {};

  } else {
    try {
      const parsedServiceAccount = JSON.parse(serviceAccountKeyJson);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(parsedServiceAccount),
      });
      adminAuth = admin.auth(adminApp);
      adminDb = admin.firestore(adminApp);
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
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
}

export { adminApp, adminAuth, adminDb };
