
"use client";

import React, { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2, Mail, User, Globe, Edit3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
// Firebase related imports are removed

const AFFILIATE_DETAILS_KEY = 'promptForgeAffiliateDetails';
const MOCK_USER_SESSION_KEY = 'promptForgeMockUserSession'; // For checking mock auth state

export default function AffiliateRegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAlreadyAffiliate, setIsAlreadyAffiliate] = useState(false);
  // Mock user state, no longer FirebaseUser
  const [mockUser, setMockUser] = useState<{ email: string; uid: string; displayName?: string } | null>(null);


  const [formData, setFormData] = useState({
    fullName: '',
    email: '', 
    website: '',
    promotionMethod: '',
  });

  useEffect(() => {
    // Simulate checking auth status from localStorage
    const sessionData = localStorage.getItem(MOCK_USER_SESSION_KEY);
    let user: { email: string; uid: string; displayName?: string } | null = null;
    if (sessionData) {
      try {
        user = JSON.parse(sessionData);
        setMockUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse mock session for affiliate registration:", e);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    
    const affiliateDetailsString = localStorage.getItem(AFFILIATE_DETAILS_KEY);
    if (affiliateDetailsString) {
        const storedAffiliateDetails = JSON.parse(affiliateDetailsString);
        // Check if the stored affiliate email matches the current mock user's email
        if (user && storedAffiliateDetails.email === user.email) {
          setIsAlreadyAffiliate(true);
          router.push('/affiliate/dashboard'); 
        } else {
          setIsAlreadyAffiliate(false);
        }
    } else {
      setIsAlreadyAffiliate(false);
    }
    
    if (user && user.email && formData.email === '') {
      setFormData(prev => ({ ...prev, email: user!.email! }));
    }
    if (user && user.displayName && formData.fullName === '') {
       setFormData(prev => ({ ...prev, fullName: user!.displayName! }));
    }

    setIsCheckingAuth(false);
  }, [router, formData.email, formData.fullName]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated || !mockUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to your PromptForge account to register as an affiliate.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const affiliateData = {
        // Use mockUser.uid if available, otherwise generate a simpler ID
        id: `aff_${mockUser.uid ? mockUser.uid.substring(0,8) : 'local'}_${Date.now().toString(36)}`, 
        name: formData.fullName || mockUser.displayName || 'Affiliate User',
        email: formData.email || mockUser.email!, 
        website: formData.website,
        promotionMethod: formData.promotionMethod,
        registeredAt: new Date().toISOString(),
        // firebaseUserId is no longer relevant, can be removed or kept as optional if needed for other non-Firebase context
      };
      localStorage.setItem(AFFILIATE_DETAILS_KEY, JSON.stringify(affiliateData));
      
      toast({
        title: "Affiliate Registration Successful!",
        description: "Welcome to the PromptForge Affiliate Program. Redirecting to your dashboard...",
      });
      router.push('/affiliate/dashboard');
    }, 1500);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking affiliate status...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isCheckingAuth) {
     return (
      <Card className="w-full max-w-md shadow-2xl border-border/20 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
           <ShieldCheck className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            You need to be logged into your PromptForge account to register for the affiliate program.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Login to Your Account</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-lg shadow-2xl border-border/20 bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mx-auto mb-4 border border-primary/20 shadow-sm w-16 h-16">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Become a PromptForge Affiliate</CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-2">
          Fill out the form below to join our partner program.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-6 md:px-8">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center text-xs font-medium text-muted-foreground">
              <User className="mr-1.5 h-3.5 w-3.5" /> Full Name
            </Label>
            <Input 
              id="fullName" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder={mockUser?.displayName || "John Doe"} 
              required 
              className="rounded-md shadow-sm text-base" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center text-xs font-medium text-muted-foreground">
              <Mail className="mr-1.5 h-3.5 w-3.5" /> Email Address
            </Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder={mockUser?.email || "you@example.com"} 
              required 
              readOnly={!!mockUser?.email} 
              className="rounded-md shadow-sm text-base" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center text-xs font-medium text-muted-foreground">
              <Globe className="mr-1.5 h-3.5 w-3.5" /> Website or Social Media URL
            </Label>
            <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourblog.com or https://twitter.com/yourprofile" required className="rounded-md shadow-sm text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promotionMethod" className="flex items-center text-xs font-medium text-muted-foreground">
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> How do you plan to promote PromptForge?
            </Label>
            <Textarea
              id="promotionMethod"
              name="promotionMethod"
              value={formData.promotionMethod}
              onChange={handleChange}
              placeholder="e.g., Blog posts, YouTube videos, social media shares, email newsletters..."
              required
              rows={4}
              className="rounded-md shadow-sm text-base"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-6 md:px-8 pb-6">
          <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow text-base py-3" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {isLoading ? "Submitting Application..." : "Apply to Join"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By applying, you agree to our Affiliate <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
