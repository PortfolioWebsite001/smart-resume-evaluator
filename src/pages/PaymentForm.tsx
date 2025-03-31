
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
  const { user, submitPayment } = useAuth();
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
      await submitPayment(email, phoneNumber);
      toast.success('Payment information submitted successfully! Waiting for verification.');
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
            Complete Your Payment
          </h1>
          
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Submit your payment details below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold">Payment Details</h3>
                    <p className="text-muted-foreground mt-1">
                      Complete your payment of <span className="font-medium">KSh 150</span> to activate your premium subscription with 15 scans
                    </p>
                  </div>
                  
                  {user && user.email && (
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Please make your payment first, then submit your details for verification.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={user && user.email ? true : false}
                            required
                          />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          This email will be used to verify your payment
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          placeholder="e.g., 07XX XXX XXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          The phone number you used for payment
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !email || !phoneNumber}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Payment Details'
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                  Your payment will be verified by an administrator shortly.
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Subscription Price</AlertTitle>
                    <AlertDescription>
                      <span className="font-bold text-lg">KES 150</span> for a one-week subscription with 15 scans
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">How to Pay:</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Go to M-Pesa on your phone</li>
                        <li>Select "Lipa na M-Pesa"</li>
                        <li>Select "Buy Goods and Services"</li>
                        <li>Enter Till Number: <span className="font-mono font-bold">4097548</span></li>
                        <li>Enter Amount: <span className="font-bold">KES 150</span></li>
                        <li>Enter your M-Pesa PIN and confirm</li>
                        <li>After payment, submit your email and phone number in this form</li>
                      </ol>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="font-medium mb-1">After Submission:</h3>
                      <p className="text-sm">
                        Our admin will verify your payment and activate your premium access with 15 scans.
                        You'll receive a notification with your subscription end date.
                      </p>
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
};

export default PaymentForm;
