
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ResumeAnalysis from "@/components/ResumeAnalysis";
import DownloadableReport from "@/components/DownloadableReport";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ResumeAnalysisResult } from "@/utils/geminiAPI";

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    fileName: string;
    fileSize: number;
    uploadTime: string;
    jobDescription?: string;
    analysisResults: ResumeAnalysisResult;
  } | null;

  useEffect(() => {
    // If there's no state (user accessed directly via URL), redirect to home
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) {
    return null; // Will redirect in the useEffect
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 pl-1" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
          
          <h1 className="text-3xl font-bold animate-fade-in mb-2">
            Hello, {state.analysisResults.userName}!
          </h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
            Here's your personalized resume analysis
          </p>
        </div>
        
        <div className="mb-8">
          <DownloadableReport 
            fileName={state.fileName}
            fileSize={state.fileSize}
            uploadTime={state.uploadTime}
            jobDescription={state.jobDescription}
            analysisResults={state.analysisResults}
          />
        </div>
        
        <ResumeAnalysis 
          fileName={state.fileName}
          fileSize={state.fileSize}
          uploadTime={state.uploadTime}
          jobDescription={state.jobDescription}
          analysisResults={state.analysisResults}
        />
      </div>
    </Layout>
  );
};

export default Analysis;
