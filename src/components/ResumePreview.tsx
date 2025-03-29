
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User } from "lucide-react";

interface ResumePreviewProps {
  resumeText: string;
  userName: string;
}

const ResumePreview = ({ resumeText, userName }: ResumePreviewProps) => {
  // Function to format resume text with proper line breaks and sections
  const formatResumeText = (text: string) => {
    // Split into sections based on multiple line breaks or section headers
    const sections = text
      .split(/\n{2,}|(?=([A-Z][A-Z\s]+:))/g)
      .filter(section => section.trim().length > 0);
    
    return sections.map((section, index) => {
      // Check if section is a header (all caps followed by colon)
      const isHeader = /^[A-Z][A-Z\s]+:/.test(section);
      
      // Format the section with appropriate styling
      return (
        <div key={index} className={`${isHeader ? 'mt-4' : 'mt-2'}`}>
          {isHeader ? (
            <h3 className="text-base font-semibold text-primary">{section}</h3>
          ) : (
            <div className="text-sm whitespace-pre-line leading-relaxed">
              {section}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="analysis-card h-full">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Resume Preview for {userName}</h3>
      </div>
      
      <ScrollArea className="h-[500px] w-full rounded border p-6 bg-card shadow-sm">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{userName}</h2>
          </div>
          
          <div className="space-y-1">
            {formatResumeText(resumeText)}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ResumePreview;
