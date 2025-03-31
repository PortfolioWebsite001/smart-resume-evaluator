import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadZone } from '@/components/UploadZone';
import { FileText, Award, AlertTriangle, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { user, getRemainingScans, hasActiveSubscription, getSubscriptionEndDate } = useAuth();
  const [remainingScans, setRemainingScans] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const [scansRemaining, hasSubscription, endDate] = await Promise.all([
          getRemainingScans(),
          hasActiveSubscription(),
          getSubscriptionEndDate()
        ]);
        
        setRemainingScans(scansRemaining);
        setIsSubscribed(hasSubscription);
        setSubscriptionEndDate(endDate);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, navigate, getRemainingScans, hasActiveSubscription, getSubscriptionEndDate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-10">
          <p className="text-center">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          {isSubscribed && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-950/30 border-green-200">
              <Award className="h-4 w-4 text-green-500" />
              <AlertTitle>Premium Account</AlertTitle>
              <AlertDescription>
                You have premium access with up to 15 scans!
                {subscriptionEndDate && (
                  <div className="mt-1">
                    Your premium access expires on: <strong>{subscriptionEndDate}</strong>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {!isSubscribed && remainingScans !== null && remainingScans <= 1 && (
            <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle>Running Low</AlertTitle>
              <AlertDescription>
                You have {remainingScans} {remainingScans === 1 ? 'scan' : 'scans'} remaining. Consider upgrading to Premium for 15 scans.
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Upload Resume</CardTitle>
                  <CardDescription>Upload your resume for AI analysis</CardDescription>
                </div>
                <Badge variant={isSubscribed ? "default" : "outline"} className="ml-2">
                  {remainingScans !== null ? `${remainingScans} scans remaining` : 'Loading...'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <UploadZone />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'Premium users get 15 resume scans' 
                  : 'Free users get 3 resume scans. Upgrade for more!'}
              </p>
              {!isSubscribed && (
                <Button variant="outline" size="sm" onClick={() => navigate('/subscription')}>
                  Upgrade
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Recent Scans
              </CardTitle>
              <CardDescription>View your previously analyzed resumes</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Recent scans would go here */}
              <p className="text-center py-6 text-muted-foreground">
                Your recently scanned resumes will appear here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
