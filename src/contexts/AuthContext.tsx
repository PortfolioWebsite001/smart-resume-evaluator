
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getRemainingFreeScans: () => Promise<number>;
  hasActiveSubscription: () => Promise<boolean>;
  verifyAdminPin: (pin: string) => Promise<boolean>;
  submitPayment: (phoneNumber: string, mpesaCode: string) => Promise<void>;
  verifyPayment: (userEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    );

    // Get the current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(fullName: string, email: string, password: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }
      
      toast.success('Account created successfully! Please check your email for verification.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid login credentials');
      throw error;
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
    }
  }

  async function getRemainingFreeScans() {
    if (!user) return 0;
    
    try {
      // Count how many scans the user has made
      const { data, error, count } = await supabase
        .from('resume_scans')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Return remaining free scans (3 - used scans)
      return Math.max(0, 3 - (count || 0));
    } catch (error) {
      console.error('Error checking free scans:', error);
      return 0;
    }
  }

  async function hasActiveSubscription() {
    if (!user) return false;
    
    try {
      // Check if user has any active subscriptions
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .gt('end_date', new Date().toISOString())
        .single();
        
      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is expected if no subscription
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  async function verifyAdminPin(pin: string) {
    try {
      const { data, error } = await supabase
        .from('admin_pins')
        .select('pin')
        .single();
        
      if (error) throw error;
      
      return data.pin === pin;
    } catch (error) {
      console.error('Error verifying admin PIN:', error);
      return false;
    }
  }

  async function submitPayment(phoneNumber: string, mpesaCode: string) {
    if (!user) {
      toast.error('You must be logged in to submit a payment');
      return;
    }
    
    try {
      // Update user profile with phone number
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          user_id: user.id,
          mpesa_code: mpesaCode,
        });
        
      if (paymentError) throw paymentError;
      
      toast.success('Payment submitted successfully! Waiting for verification.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Failed to submit payment');
    }
  }

  async function verifyPayment(userEmail: string) {
    if (!user) {
      toast.error('You must be logged in as admin to verify payments');
      return;
    }
    
    try {
      // Get user details by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', 
          supabase.auth.getUserById(
            (await supabase.auth.admin.getUserByEmail(userEmail)).data.user?.id || ''
          )
        )
        .single();
        
      if (userError) throw userError;
      
      const userId = userData.id;
      
      // Get the latest unverified payment for this user
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_records')
        .select('id')
        .eq('user_id', userId)
        .eq('verified', false)
        .order('payment_date', { ascending: false })
        .limit(1)
        .single();
        
      if (paymentError) throw paymentError;
      
      // Mark payment as verified
      const { error: updateError } = await supabase
        .from('payment_records')
        .update({
          verified: true,
          verified_by: user.email,
          verified_at: new Date().toISOString()
        })
        .eq('id', paymentData.id);
        
      if (updateError) throw updateError;
      
      // Create subscription for 1 week
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Add 7 days
      
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
        
      if (subscriptionError) throw subscriptionError;
      
      // Log admin action
      const { error: logError } = await supabase
        .from('admin_logs')
        .insert({
          action: 'verify_payment',
          admin_email: user.email || '',
          target_user_email: userEmail,
          details: { payment_id: paymentData.id }
        });
        
      if (logError) throw logError;
      
      toast.success('Payment verified and subscription created successfully!');
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Failed to verify payment');
    }
  }

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getRemainingFreeScans,
    hasActiveSubscription,
    verifyAdminPin,
    submitPayment,
    verifyPayment,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
