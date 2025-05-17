
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { LogIn, UserPlus, KeyRound, Mail as MailIcon, User, CheckCircle, Loader2 } from "lucide-react";
import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail as signUpServerAction } from '@/app/actions/auth';
import { auth } from '@/lib/firebase/firebase'; // Import Firebase auth
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { PREMIUM_CREATOR_NAME } from '@/config/plans';

const USER_PLAN_STORAGE_KEY = 'promptForgeUserPlan';
const FREE_CREDITS_STORAGE_KEY = 'promptForgeFreeCreditsUsed';


export default function AuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState(''); // Retained for potential future use
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');


  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth is not initialized in AuthForm.");
      setIsCheckingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if (!auth) {
      toast({ title: "Authentication Error", description: "Auth service not ready.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      // Handle successful login
      // You might want to differentiate between mock admin/free users and regular users if still needed
      if (loginEmail === "user@example.com") { // Example: hardcoded premium user
         localStorage.setItem(USER_PLAN_STORAGE_KEY, PREMIUM_CREATOR_NAME);
         localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
      } else { // Default to free tier for other users
         localStorage.removeItem(USER_PLAN_STORAGE_KEY);
         localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting...",
      });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = "Invalid credentials. Please try again or sign up.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Incorrect email or password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      console.error("Firebase login error:", error);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSignUpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast({ title: "Sign Up Failed", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!auth) {
      toast({ title: "Authentication Error", description: "Auth service not ready.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Use server action for actual user creation to keep admin privileges server-side
    const response = await signUpServerAction(signupEmail, signupPassword); 
    
    if (response.success) {
      toast({
        title: "Sign Up Successful",
        description: response.message || "Account created. Please sign in.",
      });
      const loginTabTrigger = document.querySelector('button[data-radix-collection-item][value="login"]') as HTMLButtonElement | null;
      loginTabTrigger?.click();
      setLoginEmail(signupEmail); 
      setLoginPassword(''); 
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    } else {
      toast({
        title: "Sign Up Failed",
        description: response.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/20 bg-card/90 backdrop-blur-sm">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader className="pb-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 dark:bg-muted/20">
            <TabsTrigger value="login" className="text-sm py-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-sm py-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="login">
          <form onSubmit={handleLoginSubmit}>
            <CardContent className="space-y-6 pt-2 pb-6 px-6">
              <CardTitle className="text-2xl font-bold text-center text-primary">Welcome Back!</CardTitle>
              <CardDescription className="text-center text-sm text-muted-foreground">
                Enter your credentials to access your PromptForge account.
              </CardDescription>
              <div className="space-y-2">
                <Label htmlFor="login-email" className="flex items-center text-xs font-medium text-muted-foreground">
                  <MailIcon className="mr-1.5 h-3.5 w-3.5" /> Email
                </Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  autoComplete="email"
                  className="rounded-md shadow-sm text-base"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="flex items-center text-xs font-medium text-muted-foreground">
                        <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Password
                    </Label>
                    <Link
                        href="#" // Placeholder, implement password reset if needed
                        className="ml-auto inline-block text-xs underline text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => { 
                            e.preventDefault(); 
                            toast({ title: "Forgot Password", description: "Password reset functionality is not yet implemented for Firebase auth."}) 
                        }}
                    >
                        Forgot your password?
                    </Link>
                </div>
                <Input 
                  id="login-password" 
                  type="password" 
                  required 
                  autoComplete="current-password"
                  className="rounded-md shadow-sm text-base"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-6 pb-6">
              <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow text-base py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUpSubmit}>
            <CardContent className="space-y-6 pt-2 pb-6 px-6">
               <CardTitle className="text-2xl font-bold text-center text-primary">Create an Account</CardTitle>
              <CardDescription className="text-center text-sm text-muted-foreground">
                Join PromptForge and start turning your ideas into reality.
              </CardDescription>
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="flex items-center text-xs font-medium text-muted-foreground">
                    <User className="mr-1.5 h-3.5 w-3.5" /> Full Name (Optional)
                </Label>
                <Input 
                  id="signup-name" 
                  placeholder="Your Name" 
                  autoComplete="name"
                  className="rounded-md shadow-sm text-base"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center text-xs font-medium text-muted-foreground">
                    <MailIcon className="mr-1.5 h-3.5 w-3.5" /> Email
                </Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  autoComplete="email"
                  className="rounded-md shadow-sm text-base"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center text-xs font-medium text-muted-foreground">
                    <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Password
                </Label>
                <Input 
                  id="signup-password" 
                  type="password" 
                  required 
                  autoComplete="new-password"
                  className="rounded-md shadow-sm text-base"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="flex items-center text-xs font-medium text-muted-foreground">
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Confirm Password
                </Label>
                <Input 
                  id="signup-confirm-password" 
                  type="password" 
                  required 
                  autoComplete="new-password"
                  className="rounded-md shadow-sm text-base"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-6 pb-6">
              <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow text-base py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
               <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
              </p>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
