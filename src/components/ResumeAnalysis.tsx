
import { useState } from "react";
import { Check, X, AlertCircle, ChevronDown, ChevronUp, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisChart from "./AnalysisChart";
import AIFeedback from "./AIFeedback";

// Mock data for demonstration
const MOCK_ANALYSIS = {
  score: 68,
  sections: {
    summary: { present: true, quality: "good" },
    experience: { present: true, quality: "excellent" },
    education: { present: true, quality: "good" },
    skills: { present: true, quality: "fair" },
    projects: { present: false, quality: "missing" },
    certifications: { present: false, quality: "missing" },
  },
  keywords: {
    matching: ["JavaScript", "React", "Node.js", "frontend development"],
    missing: ["TypeScript", "GraphQL", "CI/CD", "Agile methodology"],
  },
  formatting: {
    atsCompatible: true,
    issues: ["Inconsistent bullet point formatting", "Consider using a simpler font"],
  },
  aiSuggestions: [
    "Add a projects section to highlight your practical experience",
    "Include TypeScript in your skills section",
    "Quantify your achievements with more specific metrics",
    "Include relevant certifications to strengthen your profile",
    "Use more active verbs in your experience descriptions"
  ],
};

interface ResumeAnalysisProps {
  fileName: string;
  fileSize: number;
  uploadTime: string;
  jobDescription?: string;
}

const ResumeAnalysis = ({ fileName, fileSize, uploadTime, jobDescription }: ResumeAnalysisProps) => {
  const [sectionExpanded, setSectionExpanded] = useState<string>("overview");

  const toggleSection = (section: string) => {
    if (sectionExpanded === section) {
      setSectionExpanded("");
    } else {
      setSectionExpanded(section);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-blue-500";
      case "fair":
        return "text-amber-500";
      case "poor":
      case "missing":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left column - Summary and Score */}
      <div className="lg:col-span-4 space-y-6">
        <div className="analysis-card micro-animate-in" style={{ animationDelay: "0ms" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Resume File</h3>
              <p className="text-sm text-muted-foreground">Uploaded: {new Date(uploadTime).toLocaleString()}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Filename:</span>
              <span className="font-medium truncate max-w-[150px]">{fileName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">{formatFileSize(fileSize)}</span>
            </div>
          </div>
        </div>

        <div className="analysis-card micro-animate-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-medium mb-4">ATS Compatibility Score</h3>
          <AnalysisChart score={MOCK_ANALYSIS.score} />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {MOCK_ANALYSIS.score >= 80
                ? "Excellent! Your resume is well-optimized for ATS."
                : MOCK_ANALYSIS.score >= 60
                ? "Good, but there's room for improvement."
                : "Your resume needs significant improvements for ATS."}
            </p>
          </div>
        </div>

        <div className="analysis-card micro-animate-in" style={{ animationDelay: "200ms" }}>
          <h3 className="text-lg font-medium mb-4">AI Feedback</h3>
          <AIFeedback suggestions={MOCK_ANALYSIS.aiSuggestions} />
          
          <div className="mt-6">
            <Button className="w-full">Download Full Report</Button>
          </div>
        </div>
      </div>

      {/* Right column - Detailed Analysis */}
      <div className="lg:col-span-8 space-y-4">
        {/* Overview Section */}
        <div className="analysis-card micro-animate-in" style={{ animationDelay: "300ms" }}>
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection("overview")}
          >
            <h3 className="text-lg font-medium">Resume Structure Overview</h3>
            {sectionExpanded === "overview" ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          
          {sectionExpanded === "overview" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(MOCK_ANALYSIS.sections).map(([section, { present, quality }]) => (
                <div 
                  key={section}
                  className="p-3 border rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {present ? (
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="capitalize">{section}</span>
                  </div>
                  <span className={`text-sm font-medium ${getQualityColor(quality)}`}>
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keyword Analysis */}
        <div className="analysis-card micro-animate-in" style={{ animationDelay: "400ms" }}>
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection("keywords")}
          >
            <h3 className="text-lg font-medium">Keyword Analysis</h3>
            {sectionExpanded === "keywords" ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          
          {sectionExpanded === "keywords" && (
            <div className="mt-4 space-y-4">
              {jobDescription && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center text-sm font-medium mb-2">
                    <Search className="h-4 w-4 text-muted-foreground mr-1" />
                    Based on provided job description
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    Matching Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_ANALYSIS.keywords.matching.map(keyword => (
                      <span key={keyword} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <X className="h-4 w-4 text-red-500 mr-1" />
                    Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_ANALYSIS.keywords.missing.map(keyword => (
                      <span key={keyword} className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ATS Compatibility */}
        <div className="analysis-card micro-animate-in" style={{ animationDelay: "500ms" }}>
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection("formatting")}
          >
            <h3 className="text-lg font-medium">ATS Compatibility</h3>
            {sectionExpanded === "formatting" ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          
          {sectionExpanded === "formatting" && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                {MOCK_ANALYSIS.formatting.atsCompatible ? (
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                )}
                <span>
                  {MOCK_ANALYSIS.formatting.atsCompatible
                    ? "Your resume is generally compatible with ATS systems"
                    : "Your resume may have compatibility issues with some ATS systems"}
                </span>
              </div>
              
              {MOCK_ANALYSIS.formatting.issues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Formatting Issues:</h4>
                  <ul className="space-y-2">
                    {MOCK_ANALYSIS.formatting.issues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
