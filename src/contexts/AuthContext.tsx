
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { calculateRemainingFreeScans, getSubscriptionEndDate } from '@/utils/authUtils';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getRemainingScans: () => Promise<number>;
  getSubscriptionEndDate: () => Promise<string | null>;
  hasActiveSubscription: () => Promise<boolean>;
  verifyAdminPin: (pin: string) => Promise<boolean>;
  submitPayment: (email: string, phoneNumber: string) => Promise<void>;
  verifyPayment: (userEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    );

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

  async function getRemainingScans() {
    if (!user) return 0;
    return calculateRemainingFreeScans(user.id, supabase);
  }

  async function getSubscriptionEndDateForUser() {
    if (!user) return null;
    return getSubscriptionEndDate(user.id, supabase);
  }

  async function hasActiveSubscription() {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();
        
      if (error) return false;
      return !!data;
    } catch (error) {
      console.error("Error checking subscription:", error);
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

  async function submitPayment(email: string, phoneNumber: string) {
    if (!user) {
      toast.error('You must be logged in to submit a payment');
      return;
    }
    
    try {
      // Store the payment record
      const { error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          user_id: user.id,
          mpesa_code: 'MANUAL_VERIFICATION',
          email: email,
          phone_number: phoneNumber
        });
        
      if (paymentError) throw paymentError;
      
      toast.success('Payment information submitted successfully! Waiting for verification.');
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Failed to submit payment');
      throw error;
    }
  }

  async function verifyPayment(userEmail: string) {
    try {
      // Find user by email from auth service
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
      
      let userId;
      
      // If user not found by email in auth service, try to find by payment record email
      if (userError || !userData || !userData.user) {
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_records')
          .select('user_id')
          .eq('email', userEmail)
          .eq('verified', false)
          .single();
      
        if (paymentError || !paymentData) {
          toast.error('No pending payment found for this email address.');
          throw new Error('User not found with this email.');
        }
        
        // Use the user ID from the payment record
        userId = paymentData.user_id;
      } else {
        userId = userData.user.id;
      }
      
      // Get current admin user
      const currentUser = await supabase.auth.getUser();
      const adminEmail = currentUser.data.user?.email || 'Unknown Admin';
      
      // Mark payment as verified
      await supabase
        .from('payment_records')
        .update({
          verified: true,
          verified_by: adminEmail,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('verified', false);
      
      // Calculate end date (7 days from now)
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      
      // Check if a subscription already exists for this user
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();

      if (existingSubscription) {
        // Update existing subscription
        await supabase
          .from('subscriptions')
          .update({
            end_date: oneWeekFromNow.toISOString(),
            active: true
          })
          .eq('id', existingSubscription.id);
      } else {
        // Create new subscription
        await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            start_date: new Date().toISOString(),
            end_date: oneWeekFromNow.toISOString(),
            active: true
          });
      }
      
      // Log the admin action
      await supabase
        .from('admin_logs')
        .insert({
          action: 'payment_verification',
          admin_email: adminEmail,
          target_user_email: userEmail,
          details: {
            verified_at: new Date().toISOString()
          }
        });
      
      toast.success('Payment verified and subscription activated successfully! The user now has access to 15 scans.');
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error('An error occurred while verifying payment: ' + error.message);
      throw error;
    }
  }

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getRemainingScans,
    getSubscriptionEndDate: getSubscriptionEndDateForUser,
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
