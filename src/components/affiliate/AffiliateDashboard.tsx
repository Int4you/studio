
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input }="src/components/affiliate/AffiliateDashboard.tsx"
import { Label } from '@/components/ui/label';
import { Copy, BarChart2, Users, MousePointerClick, DollarSign, ExternalLink, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const AUTH_TOKEN_KEY = 'promptForgeAuthToken';
const AFFILIATE_DETAILS_KEY = 'promptForgeAffiliateDetails';

interface AffiliateDetails {
  id: string;
  name: string;
  email: string;
  website: string;
  promotionMethod: string;
  registeredAt: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card className="shadow-sm border-border/20">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
    </CardContent>
  </Card>
);

export default function AffiliateDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [affiliateDetails, setAffiliateDetails] = useState<AffiliateDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        router.push('/login');
        return;
      }

      const detailsString = localStorage.getItem(AFFILIATE_DETAILS_KEY);
      if (detailsString) {
        const parsedDetails = JSON.parse(detailsString) as AffiliateDetails;
        setAffiliateDetails(parsedDetails);
        setReferralLink(`https://promptforge.example.com/?ref=${parsedDetails.id}`);
      } else {
        // Not an affiliate, redirect to registration or affiliate info page
        router.push('/affiliate');
        return;
      }
      setIsLoading(false);
    }
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
    // This case should ideally be handled by the redirect, but as a fallback:
     return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="max-w-md mx-auto text-center shadow-lg border-destructive/50 bg-destructive/10">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-3" />
            <CardTitle className="text-xl font-semibold text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You are not registered as an affiliate or not logged in.</p>
            <Button asChild>
              <Link href="/affiliate">Learn about Affiliate Program</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simulated stats
  const stats = {
    clicks: Math.floor(Math.random() * 1000) + 50,
    signups: Math.floor(Math.random() * 50) + 5,
    conversionRate: (( (Math.floor(Math.random() * 50) + 5) / (Math.floor(Math.random() * 1000) + 50)) * 100).toFixed(2) + '%',
    earningsMonth: `$${(Math.random() * 200).toFixed(2)}`,
    earningsTotal: `$${(Math.random() * 1000 + 200).toFixed(2)}`,
  };

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard title="Clicks" value={stats.clicks} icon={<MousePointerClick className="h-5 w-5 text-green-500" />} description="Total clicks on your referral link." />
        <StatCard title="Sign-ups" value={stats.signups} icon={<Users className="h-5 w-5 text-blue-500" />} description="Users who signed up via your link." />
        <StatCard title="Conversion Rate" value={stats.conversionRate} icon={<BarChart2 className="h-5 w-5 text-purple-500" />} description="Percentage of clicks that resulted in sign-ups."/>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-8">
         <StatCard title="Earnings This Month" value={stats.earningsMonth} icon={<DollarSign className="h-5 w-5 text-primary" />} description="Commissions earned in the current cycle."/>
        <StatCard title="Total Earnings" value={stats.earningsTotal} icon={<DollarSign className="h-5 w-5 text-primary" />} description="All-time commissions earned."/>
      </div>

      <Card className="shadow-md border-border/30">
        <CardHeader>
          <CardTitle className="text-xl">Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Payouts are processed via PayPal on the 15th of each month for balances over $50.
            Please ensure your PayPal email is up-to-date in your (simulated) settings.
            More details on payout schedules and methods can be found in our Affiliate Agreement.
          </p>
          {/* In a real app, there would be a link to update payment details or view payout history */}
        </CardContent>
      </Card>
      
      {/* Placeholder for future sections like "Marketing Materials" or "Detailed Reports" */}
      {/*
      <Card className="mt-8">
        <CardHeader><CardTitle>Marketing Resources</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Find banners, logos, and swipe copy here. (Coming Soon)</p></CardContent>
      </Card>
      */}
    </div>
  );
}
