
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
import { CreditCard, Info, ChevronsRight, AlertCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const PaymentForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(true);
  const [emailLocked, setEmailLocked] = useState(false);
  const { user, submitPayment } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, pre-fill and lock the email
    if (user && user.email) {
      setEmail(user.email);
      setEmailLocked(true);
      setEmailExists(true);
    }
    
    // If user is not logged in, redirect to login
    if (!user) {
      toast.error('Please log in to make a payment');
      navigate('/login');
    }
  }, [user, navigate]);

  // Debounced email check
  useEffect(() => {
    if (!email || emailLocked) return;
    
    const timeoutId = setTimeout(async () => {
      if (email.length < 5 || !email.includes('@')) return;
      
      setCheckingEmail(true);
      try {
        // Check if the email matches the current user
        if (user && user.email && email.toLowerCase() === user.email.toLowerCase()) {
          setEmailExists(true);
          return;
        }
        
        // Check if email exists in profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', email)
          .single();
          
        setEmailExists(!!data && !error);
      } catch (error) {
        console.error('Error checking email:', error);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [email, user, emailLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required for account verification');
      return;
    }
    
    if (!emailExists) {
      toast.error('The email address you provided is not registered in our system');
      return;
    }
    
    // Ensure email matches the logged-in user's email
    if (user && user.email && email.toLowerCase() !== user.email.toLowerCase()) {
      toast.error('Please use the same email address that you registered with');
      return;
    }
    
    if (!fullName || !phoneNumber || !mpesaCode) {
      toast.error('All fields are required');
      return;
    }
    
    setLoading(true);
    
    try {
      await submitPayment(email, phoneNumber, mpesaCode);
      toast.success('Payment submitted successfully! Waiting for verification.');
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
                    Submit your M-Pesa payment details below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold">Payment Details</h3>
                    <p className="text-muted-foreground mt-1">
                      Complete your payment of <span className="font-medium">KSh 150</span> to activate your premium subscription
                    </p>
                  </div>
                  
                  {emailLocked && (
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        You must use the email address you registered with ({user?.email}).
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Must match the name on your M-Pesa account
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={emailLocked}
                            className={!emailExists && email.length > 0 ? "border-red-500" : ""}
                            required
                          />
                          {checkingEmail && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {!emailExists && email.length > 0 && (
                          <p className="text-sm text-red-500">
                            This email is not registered in our system
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground font-medium">
                          This email will be used to verify your payment and must match your account email
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
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mpesaCode">M-Pesa Transaction Code</Label>
                        <Input
                          id="mpesaCode"
                          placeholder="e.g., QWE1234XYZ"
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                          className="uppercase"
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter the confirmation code from your M-Pesa message
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !fullName || !email || !phoneNumber || !mpesaCode || !emailExists}
                    >
                      {loading ? 'Submitting...' : 'Submit Payment Details'}
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
                      <span className="font-bold text-lg">KES 150</span> for a one-week subscription
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">How to Pay:</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Go to M-Pesa on your phone</li>
                        <li>Select "Lipa na M-Pesa"</li>
                        <li>Select "Pay Bill"</li>
                        <li>Enter Business Number: <span className="font-mono font-bold">123456</span></li>
                        <li>Enter Account Number: <span className="font-mono font-bold">RESUME</span></li>
                        <li>Enter Amount: <span className="font-bold">KES 150</span></li>
                        <li>Enter your M-Pesa PIN and confirm</li>
                        <li>You will receive a confirmation SMS with a transaction code</li>
                        <li>Enter that code in the form</li>
                      </ol>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="font-medium mb-1">After Submission:</h3>
                      <p className="text-sm">
                        Once you submit, our admin will verify your payment and activate your premium access.
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
