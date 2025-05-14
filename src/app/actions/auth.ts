
'use server';
// Firebase Admin SDK related imports and logic have been removed.

export interface AuthResponse {
  success: boolean;
  userId?: string;
  error?: string;
  message?: string;
}

// Basic email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  console.warn("Mock Auth: signUpWithEmail called. Basic password security (min length 6) and email format will be checked.");
  
  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (!EMAIL_REGEX.test(email)) {
    console.log("Mock Auth: Email format check failed for email:", email);
    return { success: false, error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    console.log("Mock Auth: Password length check failed for email:", email);
    return { success: false, error: "Password should be at least 6 characters." };
  }
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real non-Firebase setup, you'd interact with your chosen auth provider here.
  return { success: true, userId: `mock_user_${Date.now()}`, message: "Mock user created successfully. Please sign in." };
}

// Client-side sign-in will be handled by the AuthForm component, which also needs to be updated
// if Firebase is removed. This server action for sign-in is no longer relevant without Firebase Admin.

export async function signOutUserServerAction(): Promise<{ success: boolean; error?: string }> {
  console.warn("Mock Auth: signOutUserServerAction called.");
  // Server-side cleanup for sign-out if any (not Firebase-specific anymore)
  return { success: true };
}

