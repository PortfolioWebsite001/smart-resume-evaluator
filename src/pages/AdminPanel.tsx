
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
  CardFooter,
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
  AlertCircle,
  Search,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface PaymentRecord {
  id: string;
  mpesa_code: string;
  payment_date: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  verified: boolean;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_status: 'active' | 'expired' | 'none';
  scans_count: number;
}

const AdminPanel = () => {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
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
    fetchPayments();
    fetchRecentUsers();
  }, []);

  const fetchPayments = async () => {
    setLoadingPayments(true);
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

  const fetchRecentUsers = async () => {
    setLoadingUsers(true);
    try {
      // Get recent users along with their profiles
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 10,
      });

      if (authError) throw authError;

      const users: User[] = [];
      
      // For each user, get profile, subscription status and scan count
      for (const authUser of (authUsers?.users || [])) {
        try {
          // Get profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          // Get subscription status
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', authUser.id)
            .eq('active', true)
            .gt('end_date', new Date().toISOString())
            .single();

          // Get scan count
          const { count: scansCount } = await supabase
            .from('resume_scans')
            .select('*', { count: 'exact' })
            .eq('user_id', authUser.id);

          users.push({
            id: authUser.id,
            email: authUser.email || 'No email',
            full_name: profileData?.full_name || 'Unknown',
            subscription_status: subscriptionData ? 'active' : 'none',
            scans_count: scansCount || 0
          });
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }

      setRecentUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load user records');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleVerify = async () => {
    if (!userEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    setLoading(true);
    try {
      await verifyPayment(userEmail);
      setUserEmail('');
      
      // Refresh data
      fetchPayments();
      fetchRecentUsers();
      
      toast.success(`Payment verified for ${userEmail}`);
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchPayments();
    fetchRecentUsers();
    toast.success('Data refreshed');
  };

  return (
    <Layout>
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Main Site
            </Button>
          </div>
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
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="User Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                onClick={handleVerify} 
                disabled={loading || !userEmail}
              >
                {loading ? 'Verifying...' : 'Authorize User'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
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
                            <CheckCircle2 className="h-4 w-4 mr-1" />
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                View recently registered users and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-4">Loading users...</div>
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-4">No users found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Scans</TableHead>
                      <TableHead>Subscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.scans_count}</TableCell>
                        <TableCell>
                          {user.subscription_status === 'active' ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="outline">None</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Showing {recentUsers.length} most recent users
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
