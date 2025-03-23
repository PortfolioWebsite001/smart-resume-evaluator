
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

  return (
    <div className="analysis-card">
      <h3 className="text-lg font-medium mb-4">Section Progress</h3>
      <div className="space-y-4">
        {Object.entries(analysisResults.sections).map(([section, { score, present, quality }]) => (
          <div key={section} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium capitalize">{section}</span>
              <span className="text-sm font-medium">{score}/100</span>
            </div>
            <Progress 
              value={score} 
              className="h-2" 
              indicatorClassName={getQualityColor(score)}
            />
            <p className="text-xs text-muted-foreground">
              {!present ? "Missing section" : `Quality: ${quality.charAt(0).toUpperCase() + quality.slice(1)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionProgress;
