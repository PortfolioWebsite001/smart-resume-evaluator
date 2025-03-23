
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ResumeAnalysisResult } from "@/utils/geminiAPI";
import { formatFileSize } from "@/utils/fileUtils";

interface DownloadableReportProps {
  fileName: string;
  fileSize: number;
  uploadTime: string;
  jobDescription?: string;
  analysisResults: ResumeAnalysisResult;
}

const DownloadableReport = ({ 
  fileName, 
  fileSize, 
  uploadTime, 
  jobDescription, 
  analysisResults 
}: DownloadableReportProps) => {
  const reportContent = React.useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!reportContent.current) return;
    
    const content = reportContent.current.innerHTML;
    const blob = new Blob([`
      <html>
        <head>
          <title>Resume Analysis Report - ${analysisResults.userName}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #3b82f6; }
            .section { margin-bottom: 30px; }
            .score { font-size: 72px; font-weight: bold; color: #3b82f6; text-align: center; }
            .score-container { text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
            .keywords { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .keyword { padding: 4px 12px; border-radius: 20px; font-size: 14px; }
            .matching { background-color: #ecfdf5; color: #047857; }
            .missing { background-color: #fef2f2; color: #b91c1c; }
            .issue { margin-bottom: 8px; }
            .suggestion { margin-bottom: 8px; }
            .action-item { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f9fafb; }
            .summary { background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 24px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .date { color: #6b7280; }
            .progress-bar { height: 10px; background-color: #e5e7eb; border-radius: 5px; margin: 5px 0; }
            .progress-indicator { height: 10px; border-radius: 5px; }
            .excellent { background-color: #10b981; }
            .good { background-color: #3b82f6; }
            .fair { background-color: #f59e0b; }
            .poor { background-color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Resume Analysis Report</h1>
            <p class="date">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h2>Resume Details</h2>
            <p><strong>Name:</strong> ${analysisResults.userName}</p>
            <p><strong>File:</strong> ${fileName} (${formatFileSize(fileSize)})</p>
            ${jobDescription ? `<p><strong>Job Description:</strong> Included in analysis</p>` : ''}
          </div>
          
          <div class="score-container">
            <h2>ATS Compatibility Score</h2>
            <p class="score">${analysisResults.score}</p>
            <p>${
              analysisResults.score >= 80
                ? "Excellent! Your resume is well-optimized for ATS."
                : analysisResults.score >= 60
                ? "Good, but there's room for improvement."
                : "Your resume needs significant improvements for ATS."
            }</p>
          </div>
          
          <div class="section">
            <h2>Resume Structure Overview</h2>
            <table>
              <tr>
                <th>Section</th>
                <th>Status</th>
                <th>Quality</th>
                <th>Score</th>
                <th>Feedback</th>
              </tr>
              ${Object.entries(analysisResults.sections)
                .map(([section, { present, quality, feedback, score }]) => {
                  const progressClass = score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "fair" : "poor";
                  return `
                    <tr>
                      <td>${section.charAt(0).toUpperCase() + section.slice(1)}</td>
                      <td>${present ? "Present" : "Missing"}</td>
                      <td>${quality.charAt(0).toUpperCase() + quality.slice(1)}</td>
                      <td>
                        <div>${score}/100</div>
                        <div class="progress-bar">
                          <div class="progress-indicator ${progressClass}" style="width: ${score}%;"></div>
                        </div>
                      </td>
                      <td>${feedback}</td>
                    </tr>
                  `;
                }).join('')}
            </table>
          </div>
          
          <div class="section">
            <h2>Keyword Analysis</h2>
            <h3>Matching Keywords</h3>
            <div class="keywords">
              ${analysisResults.keywords.matching.map(keyword => `
                <span class="keyword matching">${keyword}</span>
              `).join('')}
            </div>
            
            <h3>Missing Keywords</h3>
            <div class="keywords">
              ${analysisResults.keywords.missing.map(keyword => `
                <span class="keyword missing">${keyword}</span>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <h2>ATS Compatibility</h2>
            <p><strong>ATS Compatible:</strong> ${analysisResults.formatting.atsCompatible ? "Yes" : "No"}</p>
            <h3>Formatting Issues:</h3>
            <ul>
              ${analysisResults.formatting.issues.map(issue => `
                <li class="issue">${issue}</li>
              `).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>AI Suggestions</h2>
            <ul>
              ${analysisResults.aiSuggestions.map(suggestion => `
                <li class="suggestion">${suggestion}</li>
              `).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>Action Items</h2>
            <ul>
              ${analysisResults.actionItems.map(item => `
                <li class="action-item">${item}</li>
              `).join('')}
            </ul>
          </div>
          
          <div class="summary">
            <h2>Overall Summary</h2>
            <p>${analysisResults.overallSummary}</p>
          </div>
          
          <p style="text-align: center; margin-top: 40px; color: #6b7280;">
            Generated by AI Resume Analyzer
          </p>
        </body>
      </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_Analysis_${analysisResults.userName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 justify-center">
        <Button variant="outline" onClick={handleDownload} className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline" onClick={handlePrint} className="flex items-center">
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>
      
      <div ref={reportContent} className="hidden">
        {/* Report content for download/print - this is hidden on the page */}
      </div>
    </div>
  );
};

export default DownloadableReport;
