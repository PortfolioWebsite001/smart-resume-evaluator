
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { ResumeAnalysisResult } from "@/utils/geminiAPI";
import { formatFileSize } from "@/utils/fileUtils";
import { jsPDF } from "jspdf";
// Import jspdf-autotable
import 'jspdf-autotable';

interface DownloadableReportProps {
  fileName: string;
  fileSize: number;
  uploadTime: string;
  jobDescription?: string;
  analysisResults: ResumeAnalysisResult;
}

// This adds the autoTable method to the jsPDF instance
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const DownloadableReport = ({ 
  fileName, 
  fileSize, 
  uploadTime, 
  jobDescription, 
  analysisResults 
}: DownloadableReportProps) => {
  const reportContent = React.useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportContent.current) return;
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Set basic properties
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246); // #3b82f6
      doc.text('Resume Analysis Report', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 22, { align: 'center' });
      
      // Resume Details
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Resume Details', 14, 35);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`Name: ${analysisResults.userName}`, 14, 42);
      doc.text(`File: ${fileName} (${formatFileSize(fileSize)})`, 14, 49);
      if (jobDescription) {
        doc.text(`Job Description: Included in analysis`, 14, 56);
      }
      
      // Score
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('ATS Compatibility Score', 105, 70, { align: 'center' });
      
      doc.setFontSize(40);
      doc.setTextColor(59, 130, 246);
      doc.text(`${analysisResults.score}`, 105, 85, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      const scoreMessage = analysisResults.score >= 80
        ? "Excellent! Your resume is well-optimized for ATS."
        : analysisResults.score >= 60
        ? "Good, but there's room for improvement."
        : "Your resume needs significant improvements for ATS.";
      
      doc.text(scoreMessage, 105, 95, { align: 'center' });
      
      // Resume Structure Table
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Resume Structure Overview', 14, 110);
      
      // Using autoTable
      doc.autoTable({
        startY: 115,
        head: [['Section', 'Status', 'Quality', 'Score', 'Feedback']],
        body: Object.entries(analysisResults.sections).map(([section, { present, quality, feedback, score }]) => [
          section,
          present ? 'Present' : 'Missing',
          quality.charAt(0).toUpperCase() + quality.slice(1),
          `${score}/100`,
          feedback
        ]),
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 85 }
        },
      });
      
      // Add a new page for remaining content
      doc.addPage();
      
      // Keywords
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Keyword Analysis', 14, 15);
      
      doc.setFontSize(14);
      doc.text('Matching Keywords', 14, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      const matchingKeywords = analysisResults.keywords.matching.join(', ');
      const splitMatchingKeywords = doc.splitTextToSize(matchingKeywords, 180);
      doc.text(splitMatchingKeywords, 14, 32);
      
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('Missing Keywords', 14, 45 + splitMatchingKeywords.length * 5);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      const missingKeywords = analysisResults.keywords.missing.join(', ');
      doc.text(doc.splitTextToSize(missingKeywords, 180), 14, 52 + splitMatchingKeywords.length * 5);
      
      // ATS Compatibility
      const yPosition = 70 + splitMatchingKeywords.length * 5;
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('ATS Compatibility', 14, yPosition);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`ATS Compatible: ${analysisResults.formatting.atsCompatible ? "Yes" : "No"}`, 14, yPosition + 10);
      
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('Formatting Issues:', 14, yPosition + 20);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      let currentY = yPosition + 30;
      analysisResults.formatting.issues.forEach(issue => {
        doc.text(`• ${issue}`, 14, currentY);
        currentY += 7;
      });
      
      // AI Suggestions
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('AI Suggestions', 14, currentY + 10);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      currentY += 20;
      analysisResults.aiSuggestions.forEach(suggestion => {
        doc.text(`• ${suggestion}`, 14, currentY);
        currentY += 7;
      });
      
      // Action Items
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Action Items', 14, currentY + 10);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      currentY += 20;
      analysisResults.actionItems.forEach(item => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(`• ${item}`, 14, currentY);
        currentY += 7;
      });
      
      // Overall Summary
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Overall Summary', 14, currentY + 10);
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      const summaryText = doc.splitTextToSize(analysisResults.overallSummary, 180);
      doc.text(summaryText, 14, currentY + 20);
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // text-gray-500
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text('Generated by AI Resume Analyzer', 105, 287, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 195, 287, { align: 'right' });
      }
      
      // Save the PDF
      doc.save(`Resume_Analysis_${analysisResults.userName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 justify-center">
        <Button variant="outline" onClick={generatePDF} className="flex items-center">
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF Report
        </Button>
      </div>
      
      <div ref={reportContent} className="hidden">
        {/* Hidden report content for PDF generation */}
      </div>
    </div>
  );
};

export default DownloadableReport;
