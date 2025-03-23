
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResumePreviewProps {
  resumeText: string;
  userName: string;
}

const ResumePreview = ({ resumeText, userName }: ResumePreviewProps) => {
  // Function to format resume text with proper line breaks
  const formatResumeText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="analysis-card h-full">
      <h3 className="text-lg font-medium mb-4">Resume Preview for {userName}</h3>
      <ScrollArea className="h-[500px] w-full rounded border p-4 bg-muted/20">
        <div className="font-mono text-sm whitespace-pre-wrap">
          {formatResumeText(resumeText)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ResumePreview;
