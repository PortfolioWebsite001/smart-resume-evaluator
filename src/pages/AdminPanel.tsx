
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
  CheckCircle2,
  FileText,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentRecord {
  id: string;
  email: string;
  phone_number: string;
  payment_date: string;
  user_id: string;
  verified: boolean;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_status: 'active' | 'expired' | 'none';
  scans_count: number;
}

interface ResumeScan {
  id: string;
  file_name: string;
  score: number;
  scan_date: string;
  user_id: string;
}

const AdminPanel = () => {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentScans, setRecentScans] = useState<ResumeScan[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingScans, setLoadingScans] = useState(true);
  const { verifyPayment, user } = useAuth();
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error('Unauthorized access');
        navigate('/admin');
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // Load data
  useEffect(() => {
    fetchPayments();
    fetchRecentUsers();
    fetchRecentScans();
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
      setPayments(paymentData || []);
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
      // Get profiles directly instead of using auth.admin.listUsers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (profilesError) throw profilesError;

      const users: User[] = [];
      
      // For each profile, get subscription status and scan count
      for (const profile of (profilesData || [])) {
        try {
          // Get subscription status
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', profile.id)
            .eq('active', true)
            .single();

          // Get scan count
          const { count: scansCount } = await supabase
            .from('resume_scans')
            .select('*', { count: 'exact' })
            .eq('user_id', profile.id);

          users.push({
            id: profile.id,
            email: profile.full_name || 'No email', // Using full_name as email
            full_name: profile.full_name || 'Unknown',
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
  
  const fetchRecentScans = async () => {
    setLoadingScans(true);
    try {
      const { data: scanData, error: scanError } = await supabase
        .from('resume_scans')
        .select('*')
        .order('scan_date', { ascending: false })
        .limit(10);
        
      if (scanError) throw scanError;
      
      setRecentScans(scanData || []);
    } catch (error) {
      console.error('Error loading scans:', error);
      toast.error('Failed to load scan records');
    } finally {
      setLoadingScans(false);
    }
  };

  const handleVerify = async () => {
    if (!userEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    setLoading(true);
    setVerificationSuccess(false);
    setVerificationMessage('');
    
    try {
      await verifyPayment(userEmail);
      setUserEmail('');
      
      // Refresh data
      fetchPayments();
      fetchRecentUsers();
      
      setVerificationSuccess(true);
      setVerificationMessage(`Payment verified for ${userEmail}. User now has premium access with 15 scans!`);
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setVerificationSuccess(false);
      setVerificationMessage('');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchPayments();
    fetchRecentUsers();
    fetchRecentScans();
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
            
            {verificationSuccess && (
              <Alert className="mt-4 bg-green-50 dark:bg-green-950/30">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {verificationMessage}
                </AlertDescription>
              </Alert>
            )}
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
                Review and verify pending payments
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
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payment.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {payment.phone_number}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setUserEmail(payment.email || '');
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
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Resume Scans
            </CardTitle>
            <CardDescription>
              View recently analyzed resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingScans ? (
              <div className="text-center py-4">Loading scans...</div>
            ) : recentScans.length === 0 ? (
              <div className="text-center py-4">No scans found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell>
                        {new Date(scan.scan_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{scan.file_name}</TableCell>
                      <TableCell>
                        <Badge className={
                          scan.score >= 80 ? "bg-green-500" :
                          scan.score >= 60 ? "bg-amber-500" : "bg-red-500"
                        }>
                          {scan.score}/100
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/analysis?id=${scan.id}`)}
                        >
                          View Analysis
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
