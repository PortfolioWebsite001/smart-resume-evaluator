
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User } from "lucide-react";

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
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Resume Preview for {userName}</h3>
      </div>
      
      <ScrollArea className="h-[500px] w-full rounded border p-4 bg-muted/20">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="font-mono text-sm whitespace-pre-wrap">
            {formatResumeText(resumeText)}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ResumePreview;
