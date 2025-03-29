
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

const Subscription = () => {
  const { user, loading, hasActiveSubscription, getRemainingFreeScans } = useAuth();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [remainingScans, setRemainingScans] = useState<number>(0);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  useState(() => {
    const checkStatus = async () => {
      if (!user) return;
      
      const remaining = await getRemainingFreeScans();
      setRemainingScans(remaining);
      
      const hasActive = await hasActiveSubscription();
      setHasSubscription(hasActive);
    };
    
    checkStatus();
  });

  const handleSubscribe = async () => {
    if (!user) return;
    
    setIsSubscribing(true);
    
    try {
      // In a real app, this would integrate with a payment provider like Stripe
      // For now, we'll simulate the payment and create a subscription directly
      
      // Calculate subscription end date (7 days from now)
      const endDate = addDays(new Date(), 7);
      
      // Create subscription in database
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          end_date: endDate.toISOString(),
        });
        
      if (error) throw error;
      
      toast.success('Subscription activated successfully!');
      setHasSubscription(true);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Layout>
      <div className="page-container max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Upgrade Your Experience</h1>
          <p className="text-muted-foreground mt-2">
            Get unlimited resume analyses and premium features
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Free Tier */}
          <Card className={`border-2 ${remainingScans > 0 && !hasSubscription ? 'border-primary' : 'border-transparent'}`}>
            <CardHeader>
              <CardTitle className="text-xl">Free Trial</CardTitle>
              <CardDescription>Limited access to resume analysis</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">Free</div>
                <div className="text-sm text-muted-foreground">3 resume scans total</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>3 resume analyses</span>
                </div>
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Basic ATS compatibility check</span>
                </div>
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Standard feedback and recommendations</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                {remainingScans > 0 ? (
                  <div className="text-center text-sm text-muted-foreground">
                    You have {remainingScans} free {remainingScans === 1 ? 'scan' : 'scans'} remaining
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    Your free trial has been used
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
          
          {/* Premium Tier */}
          <Card className={`border-2 ${hasSubscription ? 'border-primary' : 'border-transparent'}`}>
            <CardHeader>
              <CardTitle className="text-xl">Premium</CardTitle>
              <CardDescription>Full access to all features</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">$150</div>
                <div className="text-sm text-muted-foreground">for one week</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Unlimited resume analyses</span>
                </div>
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Advanced ATS compatibility scoring</span>
                </div>
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Detailed section-by-section feedback</span>
                </div>
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Keyword optimization suggestions</span>
                </div>
                <div className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={isSubscribing || hasSubscription}
                onClick={handleSubscribe}
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : hasSubscription ? (
                  'Currently Subscribed'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-12 bg-muted/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Why Upgrade to Premium?</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Detailed Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Get comprehensive section-by-section analysis with actionable suggestions.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">ATS Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Ensure your resume passes through Applicant Tracking Systems with our advanced compatibility checks.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Keyword Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Identify missing keywords and optimize your resume for specific job descriptions.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Unlimited Scans</h3>
              <p className="text-sm text-muted-foreground">
                Test different versions of your resume to find the most effective format.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
