'use server';
import { 특징Auth } from '@/lib/firebase/firebase.server'; // Using server-initialized auth
import { FirebaseError } from 'firebase/app';

export interface AuthResponse {
  success: boolean;
  userId?: string;
  error?: string;
  message?: string;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const userRecord = await 특징Auth.createUser({
      email: email,
      password: password,
      emailVerified: false, // You might want to handle email verification separately
    });
    return { success: true, userId: userRecord.uid, message: "User created successfully. Please sign in." };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return { success: false, error: error.message };
    }
    const firebaseError = error as { code?: string; message?: string }; // More generic Firebase error type
    if (firebaseError.code === 'auth/email-already-exists' || firebaseError.code === 'auth/email-already-in-use') {
      return { success: false, error: 'The email address is already in use by another account.' };
    }
    return { success: false, error: firebaseError.message || 'An unknown error occurred during sign up.' };
  }
}

// Note: Firebase Admin SDK (used in firebase.server.ts) doesn't have client-side signInWithEmailAndPassword.
// Client-side sign-in will be handled directly in AuthForm.tsx using the client Firebase SDK.
// This file is for server-side actions. If signIn needs to be a server action (e.g. custom token generation),
// it would be implemented differently. For standard email/password sign-in, client SDK is typical.

// We keep signOutUser as a server action for consistency, though it can also be client-side.
export async function signOutUserServerAction(): Promise<{ success: boolean; error?: string }> {
  // Firebase Admin SDK does not directly handle client-side session sign-out.
  // Sign-out is primarily a client-side SDK operation that clears the client's session state.
  // This server action might be used to revoke refresh tokens if you implement custom session management,
  // but for standard Firebase Auth, the client handles sign-out.
  // For this example, we'll assume this action might perform some server-side cleanup if needed.
  // If no server-side action is truly needed for sign-out, this can be removed.
  console.log("SignOutUser server action called - typically client handles actual sign out with Firebase Client SDK.");
  return { success: true }; // Placeholder, actual sign out happens client-side.
}
