
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  Users,
  CreditCard
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('payments');

  useEffect(() => {
    // Verify the user is an admin
    if (!user) {
      navigate('/login');
      return;
    }

    const adminEmails = ['admin@example.com', 'admin@test.com', 'admin@gmail.com'];
    if (!user.email || !adminEmails.includes(user.email)) {
      toast.error('You do not have admin access');
      navigate('/');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Note: Since all features are free now, this is just for display purposes
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_records')
        .select('*')
        .order('payment_date', { ascending: false });

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      const { data: scansData, error: scansError } = await supabase
        .from('resume_scans')
        .select('*')
        .order('scan_date', { ascending: false });

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
      } else {
        setPaymentRecords(payments || []);
      }

      if (usersError) {
        console.error('Error loading users:', usersError);
      } else {
        setUsers(usersData || []);
      }

      if (scansError) {
        console.error('Error loading scans:', scansError);
      } else {
        setScans(scansData || []);
      }
    } catch (error) {
      console.error('Error in admin panel:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (id: string) => {
    try {
      setProcessingId(id);
      
      // Note: This is now just for display purposes since all features are free
      const { error } = await supabase
        .from('payment_records')
        .update({ 
          verified: true,
          verified_at: new Date().toISOString(),
          verified_by: user?.email
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Reload the data
      await loadData();
      toast.success('Payment verified successfully! User now has premium access');
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{users.length}</CardTitle>
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground">
                  All registered users
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{scans.length}</CardTitle>
              <CardDescription>Total Scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground">
                  Resume analyses performed
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {paymentRecords.filter(p => p.verified).length}
              </CardTitle>
              <CardDescription>Verified Payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground">
                  Historical payment records
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Manage users, payments, and scans (Note: All features are now free for all users)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="payments">Payment Records</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="scans">Resume Scans</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payments">
                <Table>
                  <TableCaption>Payment records (historical data only - all features are now free)</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No payment records found</TableCell>
                      </TableRow>
                    ) : (
                      paymentRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>{record.phone_number}</TableCell>
                          <TableCell>{new Date(record.payment_date).toLocaleString()}</TableCell>
                          <TableCell>
                            {record.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-500 border-amber-500">
                                <XCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!record.verified ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleVerifyPayment(record.id)}
                                disabled={processingId === record.id}
                              >
                                {processingId === record.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Processing...
                                  </>
                                ) : (
                                  'Verify Payment'
                                )}
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Verified by: {record.verified_by}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="users">
                <Table>
                  <TableCaption>All registered users</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.phone_number || 'N/A'}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="scans">
                <Table>
                  <TableCaption>Recent resume scans</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No scans found</TableCell>
                      </TableRow>
                    ) : (
                      scans.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium">{scan.file_name}</TableCell>
                          <TableCell className="font-mono text-xs">{scan.user_id.substring(0, 8)}...</TableCell>
                          <TableCell>
                            <Badge variant={scan.score >= 90 ? "default" : "outline"} className={
                              scan.score >= 90 ? "bg-green-500" : 
                              scan.score >= 80 ? "bg-blue-500" : 
                              scan.score >= 70 ? "bg-amber-500" : "bg-red-500"
                            }>
                              {scan.score}%
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(scan.scan_date).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPanel;
