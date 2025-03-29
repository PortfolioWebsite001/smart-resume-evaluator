import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ResumeAnalysis from "@/components/ResumeAnalysis";
import DownloadableReport from "@/components/DownloadableReport";
import ResumePreview from "@/components/ResumePreview";
import SectionProgress from "@/components/SectionProgress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
          const parsedResults = typeof data.scan_results === 'string' 
            ? JSON.parse(data.scan_results) 
            : data.scan_results;
          
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
          toast.error("Failed to load analysis");
          navigate("/dashboard");
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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!analysisData) {
    return null; // Will redirect in the useEffect
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
