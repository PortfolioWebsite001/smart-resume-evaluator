
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
  
  const [analysisData, setAnalysisData] = useState<{
    fileName: string;
    fileSize: number;
    uploadTime: string;
    jobDescription?: string;
    analysisResults: ResumeAnalysisResult;
    scanId?: string;
  } | null>(null);

  const scanId = searchParams.get('id');

  useEffect(() => {
    const loadData = async () => {
      if (location.state) {
        console.log("Using location state data", location.state);
        setAnalysisData(location.state);
        return;
      }
      
      if (scanId) {
        if (!user) {
          toast.error("Please log in to view this analysis");
          navigate("/login");
          return;
        }
        
        setLoading(true);
        try {
          console.log("Fetching scan with ID:", scanId);
          const { data, error } = await supabase
            .from('resume_scans')
            .select('*')
            .eq('id', scanId)
            .single();
            
          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }
          
          if (!data) {
            console.error("No data returned for scan ID:", scanId);
            throw new Error("Scan not found");
          }
          
          if (data.user_id !== user.id) {
            toast.error("You don't have permission to view this analysis");
            navigate("/dashboard");
            return;
          }
          
          let parsedResults;
          try {
            console.log("Parsing scan results");
            parsedResults = typeof data.scan_results === 'string' 
              ? JSON.parse(data.scan_results) 
              : data.scan_results;
              
            if (!parsedResults.resumeText) {
              parsedResults.resumeText = '';
              console.log("Resume text was missing, set to empty string");
            }
            
            if (!parsedResults.userName) {
              parsedResults.userName = 'User';
              console.log("Username was missing, set to 'User'");
            }
            
          } catch (e) {
            console.error("Error parsing scan results:", e);
            setError("Failed to parse analysis results. The data format may be invalid.");
            setLoading(false);
            return;
          }
          
          console.log("Setting analysis data");
          setAnalysisData({
            fileName: data.file_name || "resume.pdf",
            fileSize: data.file_size || 0,
            uploadTime: data.scan_date || new Date().toISOString(),
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
        console.log("No scan ID or location state, navigating to home");
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

  if (!analysisData || !analysisData.analysisResults) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center p-8 border rounded-lg bg-destructive/10">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="mt-4 text-lg font-medium">No Analysis Data</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No resume analysis data is available. Please try uploading your resume again.
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Return Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { userName = 'User', resumeText = '', score = 0 } = analysisData.analysisResults;

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
            Hello, {userName}!
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
          <div className="lg:col-span-6">
            <ResumePreview 
              resumeText={resumeText} 
              userName={userName} 
            />
          </div>
          
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
