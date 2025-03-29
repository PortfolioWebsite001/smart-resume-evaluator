
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, FileText, ArrowRight, Clock, BarChart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ResumeScan {
  id: string;
  file_name: string;
  score: number;
  scan_date: string;
}

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

const Dashboard = () => {
  const { user, loading, hasActiveSubscription, getRemainingFreeScans } = useAuth();
  const [scans, setScans] = useState<ResumeScan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [remainingScans, setRemainingScans] = useState<number>(0);
  const [pageLoading, setPageLoading] = useState(true);

  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user's resume scans
        const { data: scanData, error: scanError } = await supabase
          .from('resume_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('scan_date', { ascending: false });

        if (scanError) throw scanError;
        setScans(scanData || []);

        // Fetch user's active subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .gt('end_date', new Date().toISOString())
          .single();

        if (subError && subError.code !== 'PGRST116') {
          // PGRST116 means no rows returned
          throw subError;
        }
        
        setSubscription(subData);
        
        // Get remaining free scans
        const remainingFreeScans = await getRemainingFreeScans();
        setRemainingScans(remainingFreeScans);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || pageLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Subscription Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Subscription Status</CardTitle>
              <CardDescription>Current plan information</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                    <span>
                      Active until {new Date(subscription.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Premium
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-amber-500" />
                    <span>
                      {remainingScans > 0 
                        ? `${remainingScans} free ${remainingScans === 1 ? 'scan' : 'scans'} remaining` 
                        : 'Free scans used'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Free Tier
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!subscription && (
                <Button variant="outline" asChild className="w-full">
                  <Link to="/subscription">
                    Upgrade to Premium
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Recent Activity Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription>Your latest resume scans</CardDescription>
            </CardHeader>
            <CardContent>
              {scans.length === 0 ? (
                <p className="text-sm text-muted-foreground">No resumes scanned yet</p>
              ) : (
                <div className="space-y-3">
                  {scans.slice(0, 3).map((scan) => (
                    <div key={scan.id} className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{scan.file_name}</p>
                        <div className="flex items-center">
                          <BarChart className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Score: {scan.score}/100</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(scan.scan_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to="/">
                  Analyze a New Resume
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload a Resume
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/subscription">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* All Resume Scans */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Resume History</h2>
          
          {scans.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No resume scans yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload your first resume to get detailed analysis and feedback.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/">Analyze Resume</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scans.map((scan) => (
                <Card key={scan.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{scan.file_name}</CardTitle>
                    <CardDescription>
                      {new Date(scan.scan_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            scan.score >= 80 ? 'bg-green-500' : 
                            scan.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${scan.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{scan.score}/100</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/analysis?id=${scan.id}`}>
                        View Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
