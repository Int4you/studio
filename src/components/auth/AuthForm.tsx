
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
import { LogIn, UserPlus, KeyRound, Mail as MailIcon, User, CheckCircle } from "lucide-react";
import { useState, type FormEvent } from 'react';

export default function AuthForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    // Placeholder for login logic
    setTimeout(() => {
      toast({
        title: "Login Attempted",
        description: "Login functionality is not implemented in this demo.",
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSignUpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    // Placeholder for sign up logic
    setTimeout(() => {
      toast({
        title: "Sign Up Attempted",
        description: "Sign up functionality is not implemented in this demo.",
      });
      setIsLoading(false);
    }, 1000);
  };


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
                <Input id="login-email" type="email" placeholder="m@example.com" required className="rounded-md shadow-sm text-base" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="flex items-center text-xs font-medium text-muted-foreground">
                        <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Password
                    </Label>
                    <Link
                        href="#"
                        className="ml-auto inline-block text-xs underline text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => { e.preventDefault(); toast({ title: "Forgot Password", description: "This feature is not yet implemented."}) }}
                    >
                        Forgot your password?
                    </Link>
                </div>
                <Input id="login-password" type="password" required className="rounded-md shadow-sm text-base" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-6 pb-6">
              <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow text-base py-3" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Or login with
              </p>
              <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full rounded-md shadow-sm hover:shadow transition-shadow text-sm" onClick={() => toast({ title: "Social Login", description: "Google login not implemented."})} type="button" disabled={isLoading}>
                    <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"></path></svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full rounded-md shadow-sm hover:shadow transition-shadow text-sm" onClick={() => toast({ title: "Social Login", description: "GitHub login not implemented."})} type="button" disabled={isLoading}>
                     <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
                    GitHub
                  </Button>
              </div>
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
                <Input id="signup-name" placeholder="Your Name" className="rounded-md shadow-sm text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center text-xs font-medium text-muted-foreground">
                    <MailIcon className="mr-1.5 h-3.5 w-3.5" /> Email
                </Label>
                <Input id="signup-email" type="email" placeholder="m@example.com" required className="rounded-md shadow-sm text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center text-xs font-medium text-muted-foreground">
                    <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Password
                </Label>
                <Input id="signup-password" type="password" required className="rounded-md shadow-sm text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="flex items-center text-xs font-medium text-muted-foreground">
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Confirm Password
                </Label>
                <Input id="signup-confirm-password" type="password" required className="rounded-md shadow-sm text-base" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-6 pb-6">
              <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow text-base py-3" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
               <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our <Link href="#" className="underline hover:text-primary" onClick={(e) => e.preventDefault()}>Terms of Service</Link>.
              </p>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
