
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { ResumeAnalysisResult } from '@/utils/geminiAPI';

interface SectionProgressProps {
  analysisResults: ResumeAnalysisResult;
}

const SectionProgress = ({ analysisResults }: SectionProgressProps) => {
  const getQualityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  // Define required sections in the order we want to display them
  const requiredSections = [
    "Contact",
    "Professional Summary",
    "Professional Skills",
    "Professional Experience", 
    "Professional Education",
    "Professional Certification",
    "Additional Information",
    "Projects",
    "Tools & Technologies"
  ];

  return (
    <div className="analysis-card">
      <h3 className="text-lg font-medium mb-4">Section Progress</h3>
      <div className="space-y-4">
        {requiredSections.map(sectionName => {
          const sectionData = analysisResults.sections[sectionName] || 
                             { present: false, quality: "missing", score: 0, feedback: "Section is missing" };
          
          return (
            <div key={sectionName} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{sectionName}</span>
                <span className="text-sm font-medium">{sectionData.score}/100</span>
              </div>
              <Progress 
                value={sectionData.score} 
                className="h-2" 
                indicatorClassName={getQualityColor(sectionData.score)}
              />
              <p className="text-xs text-muted-foreground">
                {!sectionData.present ? "Missing section" : `Quality: ${sectionData.quality.charAt(0).toUpperCase() + sectionData.quality.slice(1)}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionProgress;
