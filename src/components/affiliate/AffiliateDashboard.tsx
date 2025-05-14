
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label'; // Not used
import { Copy, BarChart2, Users, MousePointerClick, DollarSign, ExternalLink, Loader2, ShieldAlert, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { auth } from '@/lib/firebase/firebase'; // Firebase client SDK
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

const AFFILIATE_DETAILS_KEY = 'promptForgeAffiliateDetails';

interface StoredAffiliateDetails {
  id: string;
  name: string;
  email: string;
  website: string;
  promotionMethod: string;
  registeredAt: string;
  firebaseUserId?: string; // Optional: to link with Firebase User
}

interface AffiliateStats {
  clicks: number;
  signups: number;
  conversionRate: string;
  earningsMonth: string;
  earningsTotal: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, isLoading }) => (
  <Card className="shadow-sm border-border/20">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary my-1" />
      ) : (
        <div className="text-2xl font-bold text-foreground">{value}</div>
      )}
      {description && !isLoading && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
    </CardContent>
  </Card>
);

export default function AffiliateDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [affiliateDetails, setAffiliateDetails] = useState<StoredAffiliateDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        setIsLoading(false);
        return;
      }
      setFirebaseUser(user);

      const detailsString = localStorage.getItem(AFFILIATE_DETAILS_KEY);
      if (detailsString) {
        const parsedDetails = JSON.parse(detailsString) as StoredAffiliateDetails;
        // Ensure the affiliate details belong to the currently logged-in Firebase user
        if (parsedDetails.firebaseUserId === user.uid || parsedDetails.email === user.email) {
            setAffiliateDetails(parsedDetails);
            setReferralLink(`https://promptforge.example.com/?ref=${parsedDetails.id}`);
            setIsLoading(false); 

            setIsStatsLoading(true);
            setTimeout(() => { 
              const statsStorageKey = `promptForgeAffiliateStats_${parsedDetails.id}`;
              let loadedStats: AffiliateStats | null = null;
              const storedStatsString = localStorage.getItem(statsStorageKey);

              if (storedStatsString) {
                try {
                  loadedStats = JSON.parse(storedStatsString);
                } catch (e) {
                  console.error("Failed to parse stored affiliate stats:", e);
                  localStorage.removeItem(statsStorageKey);
                }
              }

              if (loadedStats) {
                setStats(loadedStats);
              } else {
                // Use a more deterministic seed for random generation if possible
                const seed = parsedDetails.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const baseClicks = (seed % 500) + 100 + Math.floor(Math.random() * 200) ; // e.g. 100-800 clicks
                const baseSignups = Math.floor(baseClicks * ( ( (seed % 30) / 1000) + 0.015) ); // ~1.5-4.5% conversion

                const newStatsData: AffiliateStats = {
                  clicks: baseClicks + Math.floor(Math.random() * (baseClicks * 0.2)), // Add some variance
                  signups: baseSignups + Math.floor(Math.random() * (baseSignups * 0.15)),
                  conversionRate: '', 
                  earningsMonth: `$${( (baseSignups + Math.floor(Math.random() * (baseSignups * 0.15))) * (( (seed % 5) /10) + 0.3) * 4.99 * 0.2).toFixed(2)}`, // Commission rate: 20%, price: $4.99
                  earningsTotal: `$${( (baseSignups + Math.floor(Math.random() * (baseSignups * 0.15))) * (( (seed % 15)/10) + 0.8) * 4.99 * 0.2 + (seed % 100)).toFixed(2)}`,
                };
                newStatsData.conversionRate = newStatsData.clicks > 0 ? ((newStatsData.signups / newStatsData.clicks) * 100).toFixed(2) + '%' : '0.00%';
                setStats(newStatsData);
                localStorage.setItem(statsStorageKey, JSON.stringify(newStatsData));
              }
              setIsStatsLoading(false);
            }, 700);
        } else {
            // Affiliate details in localStorage don't match current Firebase user
            router.push('/affiliate/register'); // Or '/affiliate' if they need to re-evaluate
            setIsLoading(false);
        }
      } else {
        // No affiliate details found for this user
        router.push('/affiliate/register'); 
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => toast({ title: "Referral Link Copied!", description: "Your unique link is now on your clipboard." }))
      .catch(err => toast({ title: "Copy Failed", description: "Could not copy the link.", variant: "destructive" }));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliateDetails) {
     return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="max-w-md mx-auto text-center shadow-lg border-destructive/50 bg-destructive/10">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-3" />
            <CardTitle className="text-xl font-semibold text-destructive">Affiliate Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You are not registered as an affiliate or your session is invalid.</p>
            <Button asChild>
              <Link href="/affiliate/register">Register for Affiliate Program</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
          Welcome, {affiliateDetails.name}!
        </h1>
        <p className="text-lg text-muted-foreground">Here's your affiliate dashboard.</p>
      </div>

      <Card className="mb-8 shadow-lg border-border/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <ExternalLink className="mr-2 h-5 w-5 text-primary" /> Your Unique Referral Link
          </CardTitle>
          <CardDescription>Share this link to earn commissions. Clicks and sign-ups will be tracked.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input type="text" value={referralLink} readOnly className="bg-muted/50 dark:bg-muted/20 text-base" />
            <Button onClick={handleCopyToClipboard} variant="outline" size="icon" className="shadow-sm hover:shadow">
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy link</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <Activity className="mr-2 h-6 w-6 text-primary"/> Performance Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Clicks" value={stats?.clicks ?? '...'} icon={<MousePointerClick className="h-5 w-5 text-green-500" />} description="Total clicks on your referral link." isLoading={isStatsLoading} />
            <StatCard title="Sign-ups" value={stats?.signups ?? '...'} icon={<Users className="h-5 w-5 text-blue-500" />} description="Users who signed up via your link." isLoading={isStatsLoading} />
            <StatCard title="Conversion Rate" value={stats?.conversionRate ?? '...'} icon={<BarChart2 className="h-5 w-5 text-purple-500" />} description="Clicks to sign-ups." isLoading={isStatsLoading}/>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
            <DollarSign className="mr-2 h-6 w-6 text-primary"/> Earnings
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
            <StatCard title="Earnings This Month" value={stats?.earningsMonth ?? '...'} icon={<DollarSign className="h-5 w-5 text-primary" />} description="Commissions earned this cycle." isLoading={isStatsLoading}/>
            <StatCard title="Total Earnings" value={stats?.earningsTotal ?? '...'} icon={<DollarSign className="h-5 w-5 text-primary" />} description="All-time commissions earned." isLoading={isStatsLoading}/>
        </div>
      </div>

      <Card className="shadow-md border-border/30">
        <CardHeader>
          <CardTitle className="text-xl">Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Payouts are processed via PayPal on the 15th of each month for balances over $50.
            (This is a simulation, no real payouts will occur).
            More details on payout schedules and methods can be found in our Affiliate Agreement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
