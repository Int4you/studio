
'use server';

import { adminAuth } from '@/lib/firebase/firebase.server';

export interface AuthResponse {
  success: boolean;
  userId?: string;
  error?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  if (!adminAuth || typeof adminAuth.createUser !== 'function') {
    console.error("Firebase Admin Auth is not initialized. Cannot sign up user.");
    return { success: false, error: "Server authentication service is unavailable." };
  }

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password should be at least 6 characters." };
  }

  try {
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      // You can add more properties like displayName here if needed
    });
    return { success: true, userId: userRecord.uid, message: "Account created successfully. Please sign in." };
  } catch (error: any) {
    console.error("Firebase Admin sign up error:", error);
    let errorMessage = "Failed to create account.";
    if (error.code === 'auth/email-already-exists') {
      errorMessage = "This email address is already in use.";
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = "Password should be at least 6 characters.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function signOutUserServerAction(): Promise<{ success: boolean; error?: string }> {
  // Server-side sign-out actions (like revoking refresh tokens) could go here if needed.
  // For client-side SDK, sign-out is primarily handled on the client.
  console.log("Server Action: signOutUserServerAction called (typically client handles sign-out)");
  return { success: true };
}
