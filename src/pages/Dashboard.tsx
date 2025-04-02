
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UploadZone from '@/components/UploadZone';
import { FileText, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

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
          
          <Alert className="mb-6 bg-green-50 dark:bg-green-950/30 border-green-200">
            <Award className="h-4 w-4 text-green-500" />
            <AlertTitle>Free Resume Analysis</AlertTitle>
            <AlertDescription>
              You now have unlimited access to our resume analysis tools!
            </AlertDescription>
          </Alert>
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Upload Resume</CardTitle>
                  <CardDescription>Upload your resume for AI analysis</CardDescription>
                </div>
                <Badge variant="outline" className="ml-2">
                  Unlimited scans
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <UploadZone onFileUpload={(file) => console.log('File uploaded:', file.name)} />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Scan as many resumes as you need to perfect your applications!
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
              {/* Recent scans would go here */}
              <p className="text-center py-6 text-muted-foreground">
                Your recently scanned resumes will appear here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
