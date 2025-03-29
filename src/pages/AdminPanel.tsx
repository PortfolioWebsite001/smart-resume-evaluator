
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ClipboardCheck, 
  CheckCircle, 
  Shield, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentRecord {
  id: string;
  mpesa_code: string;
  payment_date: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  verified: boolean;
}

const AdminPanel = () => {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const { verifyPayment, user } = useAuth();
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    const checkAdminAccess = async () => {
      // In a real app, we would check if the user has admin rights
      // For now, we'll just check if they got here through the PIN verification
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error('Unauthorized access');
        navigate('/admin');
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // Load unverified payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Get unverified payments
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_records')
          .select('*')
          .eq('verified', false)
          .order('payment_date', { ascending: false });

        if (paymentError) throw paymentError;

        // Fetch user details for each payment
        const paymentsWithUserInfo = await Promise.all(
          (paymentData || []).map(async (payment) => {
            // Get user profile
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payment.user_id)
              .single();

            if (userError) {
              console.error('Error fetching user data:', userError);
              return {
                ...payment,
                user_name: 'Unknown',
                user_email: 'Unknown',
              };
            }

            // Get user email from profiles (we're storing email in full_name field)
            const userEmail = userData?.full_name || 'Unknown';
            
            return {
              ...payment,
              user_name: userEmail,
              user_email: userEmail,
            };
          })
        );

        setPayments(paymentsWithUserInfo);
      } catch (error) {
        console.error('Error loading payments:', error);
        toast.error('Failed to load payment records');
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, []);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyPayment(userEmail);
      setUserEmail('');
      
      // Refresh payment list
      window.location.reload();
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Main Site
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Verify Payment
            </CardTitle>
            <CardDescription>
              Enter user's email to verify their payment and grant subscription access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="User Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="max-w-md"
              />
              <Button 
                onClick={handleVerify} 
                disabled={loading || !userEmail}
              >
                {loading ? 'Verifying...' : 'Authorize User'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5" />
              Pending Payments
            </CardTitle>
            <CardDescription>
              Review and verify pending M-Pesa payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <div className="text-center py-4">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-4 flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p>No pending payments to verify</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>M-Pesa Code</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.user_email}</TableCell>
                      <TableCell className="font-mono">
                        {payment.mpesa_code}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setUserEmail(payment.user_email || '');
                          }}
                        >
                          Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPanel;
