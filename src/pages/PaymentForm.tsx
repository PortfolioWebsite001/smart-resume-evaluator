
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { toast } from 'sonner';
import { CreditCard, Info, AlertCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

const PaymentForm = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, pre-fill the email
    if (user && user.email) {
      setEmail(user.email);
    }
    
    // If user is not logged in, redirect to login
    if (!user) {
      toast.error('Please log in to make a payment');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required for account verification');
      return;
    }
    
    if (!phoneNumber) {
      toast.error('Phone number is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // This function was removed since we're making the service free
      // await submitPayment(email, phoneNumber);
      toast.success('All features are now free! Redirecting to dashboard.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <CreditCard className="mr-2 h-7 w-7 text-primary" />
            Free Access
          </h1>
          
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Notice</CardTitle>
                  <CardDescription>
                    All features are now completely free!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold">Good News!</h3>
                    <p className="text-muted-foreground mt-1">
                      We've made all premium features completely free for everyone
                    </p>
                  </div>
                  
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Free Access</AlertTitle>
                    <AlertDescription>
                      All users now have unlimited access to premium features.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Features Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Unlimited Resume Analysis</AlertTitle>
                    <AlertDescription>
                      Analyze as many resumes as you want with our AI tool
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">What's Included:</h3>
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Unlimited resume scans</li>
                        <li>AI-powered feedback</li>
                        <li>ATS compatibility checks</li>
                        <li>Keyword optimization</li>
                        <li>Detailed section analysis</li>
                        <li>Downloadable reports</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PaymentForm;
