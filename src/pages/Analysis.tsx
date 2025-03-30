
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ResumeAnalysis from "@/components/ResumeAnalysis";
import DownloadableReport from "@/components/DownloadableReport";
import ResumePreview from "@/components/ResumePreview";
import SectionProgress from "@/components/SectionProgress";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { ResumeAnalysisResult } from "@/utils/geminiAPI";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Analysis = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for analysis data
  const [analysisData, setAnalysisData] = useState<{
    fileName: string;
    fileSize: number;
    uploadTime: string;
    jobDescription?: string;
    analysisResults: ResumeAnalysisResult;
    scanId?: string;
  } | null>(null);

  // Check for scan ID in URL params (for direct access)
  const scanId = searchParams.get('id');

  useEffect(() => {
    const loadData = async () => {
      // If we have state data from the navigation, use that
      if (location.state) {
        setAnalysisData(location.state);
        return;
      }
      
      // If we have a scan ID in the URL, load from Supabase
      if (scanId) {
        if (!user) {
          toast.error("Please log in to view this analysis");
          navigate("/login");
          return;
        }
        
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('resume_scans')
            .select('*')
            .eq('id', scanId)
            .single();
            
          if (error) throw error;
          
          if (data.user_id !== user.id) {
            toast.error("You don't have permission to view this analysis");
            navigate("/dashboard");
            return;
          }
          
          // Parse the scan_results from JSON string to object
          let parsedResults;
          try {
            parsedResults = typeof data.scan_results === 'string' 
              ? JSON.parse(data.scan_results) 
              : data.scan_results;
          } catch (e) {
            console.error("Error parsing scan results:", e);
            setError("Failed to parse analysis results. The data format may be invalid.");
            setLoading(false);
            return;
          }
          
          setAnalysisData({
            fileName: data.file_name,
            fileSize: data.file_size,
            uploadTime: data.scan_date,
            jobDescription: data.job_description,
            analysisResults: parsedResults as ResumeAnalysisResult,
            scanId: data.id
          });
        } catch (error) {
          console.error("Error fetching scan:", error);
          setError("Failed to load analysis. Please try again.");
          toast.error("Failed to load analysis");
        } finally {
          setLoading(false);
        }
      } else if (!location.state) {
        // If we have neither state nor ID, redirect to home
        navigate("/");
      }
    };
    
    loadData();
  }, [location, navigate, scanId, user]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="mt-4 text-lg font-medium">Authentication Required</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to be logged in to view analysis results.
            </p>
            <div className="mt-4 flex justify-center space-x-3">
              <Button onClick={() => navigate("/login")}>Log In</Button>
              <Button variant="outline" onClick={() => navigate("/signup")}>Sign Up</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center p-8 border rounded-lg bg-destructive/10">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="mt-4 text-lg font-medium">Error Loading Analysis</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Return Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!analysisData) {
    return null; // Will redirect in the useEffect
  }

  // Check if analysisResults is valid
  if (!analysisData.analysisResults || 
      !analysisData.analysisResults.userName || 
      !analysisData.analysisResults.score) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center p-8 border rounded-lg bg-destructive/10">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="mt-4 text-lg font-medium">Invalid Analysis Data</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The analysis data appears to be corrupted or incomplete. Please try scanning your resume again.
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 pl-1" 
            onClick={() => navigate(user ? "/dashboard" : "/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {user ? "Back to Dashboard" : "Back to Upload"}
          </Button>
          
          <h1 className="text-3xl font-bold animate-fade-in mb-2">
            Hello, {analysisData.analysisResults.userName}!
          </h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
            Here's your personalized resume analysis
          </p>
        </div>
        
        <div className="mb-8">
          <DownloadableReport 
            fileName={analysisData.fileName}
            fileSize={analysisData.fileSize}
            uploadTime={analysisData.uploadTime}
            jobDescription={analysisData.jobDescription}
            analysisResults={analysisData.analysisResults}
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-12 mb-8">
          {/* Resume Preview - Left column */}
          <div className="lg:col-span-6">
            <ResumePreview 
              resumeText={analysisData.analysisResults.resumeText} 
              userName={analysisData.analysisResults.userName} 
            />
          </div>
          
          {/* Section Progress - Right column */}
          <div className="lg:col-span-6">
            <SectionProgress analysisResults={analysisData.analysisResults} />
          </div>
        </div>
        
        <ResumeAnalysis 
          fileName={analysisData.fileName}
          fileSize={analysisData.fileSize}
          uploadTime={analysisData.uploadTime}
          jobDescription={analysisData.jobDescription}
          analysisResults={analysisData.analysisResults}
        />
      </div>
    </Layout>
  );
};

export default Analysis;
