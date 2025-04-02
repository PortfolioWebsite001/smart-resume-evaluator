
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UploadZone from '@/components/UploadZone';
import { FileText, Award, FileCheck, Clock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatFileSize } from '@/utils/fileUtils';

export default function Dashboard() {
  const { user, scansUsed, hasRemainingScans } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [fetchingScans, setFetchingScans] = useState(false);
  const navigate = useNavigate();
  
  // Fetch recent scans when the component mounts
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchRecentScans = async () => {
      setFetchingScans(true);
      try {
        const { data, error } = await supabase
          .from('resume_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('scan_date', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        setRecentScans(data || []);
      } catch (error) {
        console.error('Error fetching recent scans:', error);
        toast.error('Failed to load recent scans');
      } finally {
        setFetchingScans(false);
        setLoading(false);
      }
    };
    
    fetchRecentScans();
  }, [user, navigate]);

  const handleScanClick = (scanId: string) => {
    navigate(`/analysis?id=${scanId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-10">
          <p className="text-center">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Scan Limit</AlertTitle>
            <AlertDescription>
              You have used {scansUsed} out of 1 resume scans.
              {!hasRemainingScans && " You have reached your scan limit."}
            </AlertDescription>
          </Alert>
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Upload Resume</CardTitle>
                  <CardDescription>Upload your resume for AI analysis</CardDescription>
                </div>
                <Badge variant="outline" className={hasRemainingScans ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {hasRemainingScans ? "Scans available: 1" : "No scans left"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <UploadZone onFileUpload={(file) => console.log('File uploaded:', file.name)} />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <p className="text-sm text-muted-foreground">
                {hasRemainingScans 
                  ? "Upload your resume to get detailed AI analysis." 
                  : "You have used all your available scans."}
              </p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Recent Scans
              </CardTitle>
              <CardDescription>View your previously analyzed resumes</CardDescription>
            </CardHeader>
            <CardContent>
              {fetchingScans ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : recentScans.length > 0 ? (
                <div className="grid gap-4">
                  {recentScans.map((scan) => (
                    <div 
                      key={scan.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleScanClick(scan.id)}
                    >
                      <div className="flex items-center">
                        <FileCheck className="h-6 w-6 text-primary mr-3" />
                        <div>
                          <p className="font-medium">{scan.file_name || 'Resume scan'}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(scan.scan_date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {scan.file_size && (
                          <span className="text-muted-foreground">{formatFileSize(scan.file_size)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  Your recently scanned resumes will appear here
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
