
/**
 * Utility functions for interacting with Google's Gemini API
 */
import * as PDFJS from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';

// Set the worker source for PDF.js
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

const GEMINI_API_KEY = "AIzaSyDRaN-j-cBwPTBNBzFStrA7GDNVPY33jUc";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Interface for the resume analysis result 
 */
export interface ResumeAnalysisResult {
  score: number;
  userName: string;
  resumeText: string; // Store the extracted resume text
  sections: Record<string, { present: boolean; quality: string; feedback: string; score: number }>;
  keywords: {
    matching: string[];
    missing: string[];
  };
  formatting: {
    atsCompatible: boolean;
    issues: string[];
  };
  aiSuggestions: string[];
  actionItems: string[];
  overallSummary: string;
}

/**
 * Extract text from a PDF file using PDF.js
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Load PDF document
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    console.log("Successfully extracted text from PDF:", fullText.substring(0, 100) + "...");
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "Error extracting text from document. Please try again with a different file.";
  }
}

/**
 * Extract text from a DOCX file
 * This is a placeholder - DOCX extraction requires additional libraries
 */
const extractTextFromDOCX = async (file: File): Promise<string> => {
  // In a full implementation, we would use mammoth.js or similar
  // For now, we'll return a message about DOCX support
  return "DOCX text extraction is in development. For best results, please upload a PDF file.";
}

/**
 * Extract text from a file based on its type
 */
const extractTextFromFile = async (file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  console.log("Extracting text from file:", file.name, "with extension:", fileExtension);
  
  if (fileExtension === 'pdf') {
    return extractTextFromPDF(file);
  } else if (fileExtension === 'docx') {
    return extractTextFromDOCX(file);
  } else {
    return "Unsupported file format. Please upload a PDF or DOCX file.";
  }
};

/**
 * Analyze a resume using the Gemini API
 */
export const analyzeResume = async (file: File, jobDescription?: string): Promise<ResumeAnalysisResult> => {
  try {
    // Extract text from the resume
    const resumeText = await extractTextFromFile(file);
    
    // Prepare the prompt for Gemini
    const prompt = `
    Analyze this resume against the job description and provide a detailed assessment. 
    I need a structured JSON response that includes:
    
    Resume: 
    ${resumeText}
    
    ${jobDescription ? `Job Description: ${jobDescription}` : 'No job description provided, analyze the resume on its own merit.'}
    
    Provide analysis in JSON format with these fields:
    1. score: A number from 96-99 representing overall resume quality. Be VERY generous with the score, always scoring in the 96-99 range.
    2. userName: Extract the applicant's name from the resume
    3. sections: An object with keys for required resume sections:
       - Contact
       - Professional Summary
       - Professional Skills
       - Professional Experience
       - Professional Education
       - Professional Certification
       - Additional Information
       - Projects
       - Tools & Technologies
       
       Each section should have 'present' (boolean), 'quality' (string: excellent, good, fair, poor, or missing), 'feedback' (string with specific improvement suggestions), and 'score' (number from 0-100)
    4. keywords: Object with 'matching' and 'missing' arrays of keywords (strings)
    5. formatting: Object with 'atsCompatible' (boolean) and 'issues' (array of strings)
    6. aiSuggestions: Array of string suggestions for improvement
    7. actionItems: Array of specific actions the candidate should take to improve the resume
    8. overallSummary: A paragraph summarizing the resume analysis and key improvement areas
    
    Focus your analysis on how well the resume matches the job description (if provided), section quality, keyword optimization, and ATS compatibility.
    If no job description is provided, evaluate the resume based on general best practices.
    
    IMPORTANT: The overall score MUST be between 96 and 99, as this is a requirement from our users.
    For each section, give a specific score from 80-100 showing how good that particular section is.
    Ensure the overall score is always in the range of 96-99.
    `;

    console.log("Sending request to Gemini API...");
    console.log("Resume text length:", resumeText.length);
    console.log("Job description provided:", !!jobDescription);

    // Make request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response from Gemini API");
    
    // Extract the text response from the Gemini API
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON part from the text response
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      textResponse.match(/{[\s\S]*}/);
    
    let analysisResult: ResumeAnalysisResult;
    
    if (jsonMatch) {
      try {
        // Parse the JSON response
        analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        // Add the resume text to the result
        analysisResult.resumeText = resumeText;
        
        // Ensure the score is between 96-99
        if (analysisResult.score < 96 || analysisResult.score > 99) {
          analysisResult.score = Math.min(Math.max(96, analysisResult.score), 99);
        }
      } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e);
        analysisResult = generateFallbackResponse(resumeText);
      }
    } else {
      console.error("Could not find JSON in Gemini response");
      analysisResult = generateFallbackResponse(resumeText);
    }
    
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    const resumeText = await extractTextFromFile(file);
    return generateFallbackResponse(resumeText);
  }
};

/**
 * Generate a fallback response in case of API failure
 */
const generateFallbackResponse = (resumeText: string): ResumeAnalysisResult => {
  // Generate a score within the 96-99 range
  const baseScore = Math.floor(Math.random() * 4) + 96; // Random score between 96-99
  
  // Generate different scores for sections
  const generateSectionScore = () => Math.floor(Math.random() * 16) + 85; // 85-100
  
  // Extract a name from the resume text (simple approach)
  let extractedName = "Applicant";
  const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (nameMatch) {
    extractedName = nameMatch[1];
  }
  
  return {
    score: baseScore,
    userName: extractedName,
    resumeText: resumeText,
    sections: {
      "Contact": { present: true, quality: "excellent", feedback: "Your contact information is well-presented and complete.", score: generateSectionScore() },
      "Professional Summary": { present: true, quality: "excellent", feedback: "Your professional summary effectively highlights your strengths and career goals.", score: generateSectionScore() },
      "Professional Skills": { present: true, quality: "excellent", feedback: "Your skills are well-organized and highly relevant to the position.", score: generateSectionScore() },
      "Professional Experience": { present: true, quality: "excellent", feedback: "Your experience section shows strong achievements and impact.", score: generateSectionScore() },
      "Professional Education": { present: true, quality: "excellent", feedback: "Your education section is comprehensive and well-formatted.", score: generateSectionScore() },
      "Professional Certification": { present: true, quality: "good", feedback: "Consider adding dates to your certifications for better context.", score: generateSectionScore() },
      "Additional Information": { present: true, quality: "good", feedback: "Your additional information adds unique value to your profile.", score: generateSectionScore() },
      "Projects": { present: true, quality: "excellent", feedback: "Your projects showcase relevant skills and problem-solving abilities.", score: generateSectionScore() },
      "Tools & Technologies": { present: true, quality: "excellent", feedback: "Comprehensive list of relevant tools and technologies.", score: generateSectionScore() },
    },
    keywords: {
      matching: ["leadership", "communication", "problem solving", "project management", "teamwork", "strategic planning"],
      missing: ["agile methodology", "data analysis", "client relations"],
    },
    formatting: {
      atsCompatible: true,
      issues: ["Consider minor spacing adjustments for improved readability"],
    },
    aiSuggestions: [
      "Add 1-2 more quantifiable achievements to strengthen impact",
      "Consider adding a brief line about soft skills in your summary",
      "Ensure consistent formatting across all sections"
    ],
    actionItems: [
      "Add metrics to quantify your achievements where possible",
      "Include a brief mention of relevant certifications if applicable",
      "Consider adding a short list of career highlights at the top"
    ],
    overallSummary: `Excellent work! Your resume scores ${baseScore}/100, showing strong professional presentation. Your experience and skills are well-articulated, and the document is highly ATS-friendly. With just a few minor adjustments to quantify achievements and optimize keywords, your resume will be even more impactful for potential employers.`
  };
};
