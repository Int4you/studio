// src/lib/firebase/firebase.server.ts
import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

if (!serviceAccountKey) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.');
}

const parsedServiceAccount = JSON.parse(serviceAccountKey);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
      // databaseURL: `https://${parsedServiceAccount.project_id}.firebaseio.com` // If using Realtime Database
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const 특징Auth = admin.auth();
export const 특징Db = admin.firestore();
