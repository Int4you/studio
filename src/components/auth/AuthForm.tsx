
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
import { PREMIUM_CREATOR_NAME } from '@/config/plans';
import { signUpWithEmail as signUpServerAction } from '@/app/actions/auth';

const FREE_CREDITS_STORAGE_KEY = 'promptForgeFreeCreditsUsed';
const USER_PLAN_STORAGE_KEY = 'promptForgeUserPlan';
const MOCK_USER_SESSION_KEY = 'promptForgeMockUserSession';
const MOCK_REGISTERED_USERS_KEY = 'promptForgeMockRegisteredUsers';

interface MockRegisteredUser {
  email: string;
  passwordHash: string; // Store a "hash" or just the password for mock purposes
}

// Simple "hashing" for mock purposes - in a real app, never store passwords like this.
const mockHashPassword = async (password: string): Promise<string> => {
  // In a real app, use bcrypt or Argon2. For mock, just returning the password.
  // Or a very simple transformation if you want to avoid storing plain text even in mock.
  // For this example, to keep it simple and allow easy checking, we'll just use it as is.
  // A slightly better mock would be: `return 'hashed_' + password;`
  return password;
};

const mockVerifyPassword = async (submittedPassword: string, storedHash: string): Promise<boolean> => {
  // Correspondingly simple verification
  return submittedPassword === storedHash;
};


export default function AuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');


  useEffect(() => {
    const mockSession = localStorage.getItem(MOCK_USER_SESSION_KEY);
    if (mockSession) {
      router.push('/dashboard');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // 1. Check registered mock users from localStorage
    const storedRegisteredUsers = localStorage.getItem(MOCK_REGISTERED_USERS_KEY);
    if (storedRegisteredUsers) {
      try {
        const registeredUsers: MockRegisteredUser[] = JSON.parse(storedRegisteredUsers);
        const foundUser = registeredUsers.find(user => user.email === loginEmail);
        
        if (foundUser) {
          const passwordMatches = await mockVerifyPassword(loginPassword, foundUser.passwordHash);
          if (passwordMatches) {
            localStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify({ email: loginEmail, uid: `mock_uid_registered_${Date.now()}` }));
            localStorage.removeItem(USER_PLAN_STORAGE_KEY); // New signups are free tier by default
            localStorage.removeItem(FREE_CREDITS_STORAGE_KEY); // Reset credits for new login
            toast({
              title: "Login Successful",
              description: "Welcome back! Redirecting...",
            });
            router.push('/dashboard');
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error reading mock registered users:", e);
      }
    }

    // 2. Fallback to hardcoded admin/free users
    if (loginEmail === "user@example.com" && loginPassword === "password") {
      localStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify({ email: loginEmail, uid: `mock_uid_${Date.now()}` }));
      localStorage.setItem(USER_PLAN_STORAGE_KEY, PREMIUM_CREATOR_NAME); 
      localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
      toast({
        title: "Login Successful",
        description: "You are now logged in. Redirecting...",
      });
      router.push('/dashboard');
    } else if (loginEmail === "free@example.com" && loginPassword === "password") {
      localStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify({ email: loginEmail, uid: `mock_uid_free_${Date.now()}` }));
      localStorage.removeItem(USER_PLAN_STORAGE_KEY); 
      localStorage.removeItem(FREE_CREDITS_STORAGE_KEY);
      toast({
        title: "Login Successful (Free Tier)",
        description: "You are now logged in. Redirecting...",
      });
      router.push('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again or sign up.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSignUpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Sign Up Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const response = await signUpServerAction(signupEmail, signupPassword); 
    if (response.success) {
      // Store mock user in localStorage
      try {
        const existingUsersString = localStorage.getItem(MOCK_REGISTERED_USERS_KEY);
        let users: MockRegisteredUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];
        
        const userExists = users.some(user => user.email === signupEmail);
        if (!userExists) {
          const hashedPassword = await mockHashPassword(signupPassword); // Use the simple mock hash
          users.push({ email: signupEmail, passwordHash: hashedPassword });
          localStorage.setItem(MOCK_REGISTERED_USERS_KEY, JSON.stringify(users));
        }
      } catch (e) {
        console.error("Error saving mock user to localStorage:", e);
      }

      toast({
        title: "Sign Up Successful",
        description: response.message || "Account created. Please sign in.",
      });
      
      // Redirect to login tab
      const loginTabTrigger = document.querySelector('button[data-radix-collection-item][value="login"]') as HTMLButtonElement | null;
      loginTabTrigger?.click();
      setLoginEmail(signupEmail); 
      setLoginPassword(''); 
      // Clear signup form
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
                        href="#"
                        className="ml-auto inline-block text-xs underline text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => { e.preventDefault(); toast({ title: "Forgot Password", description: "Password reset is not yet implemented for this mock."}) }}
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
              {/* Social login buttons removed */}
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
