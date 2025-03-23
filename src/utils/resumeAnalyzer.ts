
// This file contains utilities for analyzing resumes
// In a real application, this would connect to an AI service or backend API

/**
 * Interface for the resume analysis result
 */
export interface ResumeAnalysisResult {
  score: number;
  sections: Record<string, { present: boolean; quality: string }>;
  keywords: {
    matching: string[];
    missing: string[];
  };
  formatting: {
    atsCompatible: boolean;
    issues: string[];
  };
  aiSuggestions: string[];
}

/**
 * Mock function to analyze a resume
 * In a real application, this would send the file to an API
 */
export const analyzeResume = (file: File, jobDescription?: string): Promise<ResumeAnalysisResult> => {
  // This is a mock implementation that returns dummy data after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, you would:
      // 1. Extract text from the resume file
      // 2. Send the text to an AI service for analysis
      // 3. Process the results
      
      // For now, we return mock data
      resolve({
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60 and 99
        sections: {
          summary: { present: Math.random() > 0.3, quality: randomQuality() },
          experience: { present: Math.random() > 0.1, quality: randomQuality() },
          education: { present: Math.random() > 0.2, quality: randomQuality() },
          skills: { present: Math.random() > 0.2, quality: randomQuality() },
          projects: { present: Math.random() > 0.5, quality: randomQuality() },
          certifications: { present: Math.random() > 0.7, quality: randomQuality() },
        },
        keywords: {
          matching: generateRandomKeywords(4),
          missing: generateRandomKeywords(4),
        },
        formatting: {
          atsCompatible: Math.random() > 0.3,
          issues: generateRandomIssues(),
        },
        aiSuggestions: generateRandomSuggestions(),
      });
    }, 2000);
  });
};

// Helper functions for generating mock data
const randomQuality = (): string => {
  const qualities = ["excellent", "good", "fair", "poor", "missing"];
  return qualities[Math.floor(Math.random() * qualities.length)];
};

const generateRandomKeywords = (count: number): string[] => {
  const allKeywords = [
    "JavaScript", "React", "Node.js", "TypeScript", "Python", "AWS",
    "Docker", "Kubernetes", "CI/CD", "Agile", "Scrum", "REST API",
    "GraphQL", "MongoDB", "PostgreSQL", "SQL", "NoSQL", "DevOps",
    "Machine Learning", "Data Science", "Frontend", "Backend", "Full Stack"
  ];
  
  const result: string[] = [];
  while (result.length < count) {
    const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
    if (!result.includes(keyword)) {
      result.push(keyword);
    }
  }
  
  return result;
};

const generateRandomIssues = (): string[] => {
  const allIssues = [
    "Inconsistent bullet point formatting",
    "Consider using a simpler font",
    "Too many font styles used",
    "Headers could be more distinct",
    "Some sections lack clear hierarchy",
    "Bullet points are too lengthy",
    "Some content may be in tables that ATS cannot parse",
    "Complex formatting may not be parsed correctly"
  ];
  
  const count = Math.floor(Math.random() * 3) + 1;
  const result: string[] = [];
  
  while (result.length < count) {
    const issue = allIssues[Math.floor(Math.random() * allIssues.length)];
    if (!result.includes(issue)) {
      result.push(issue);
    }
  }
  
  return result;
};

const generateRandomSuggestions = (): string[] => {
  const allSuggestions = [
    "Add a projects section to highlight your practical experience",
    "Include more industry-specific keywords throughout your resume",
    "Quantify your achievements with more specific metrics",
    "Include relevant certifications to strengthen your profile",
    "Use more active verbs in your experience descriptions",
    "Consider adding a brief professional summary at the top",
    "Ensure consistent formatting across all bullet points",
    "Keep your bullet points concise and focused on achievements",
    "Tailor your skills section to match the job requirements more closely",
    "Reduce the use of technical jargon unless specifically relevant"
  ];
  
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 suggestions
  const result: string[] = [];
  
  while (result.length < count) {
    const suggestion = allSuggestions[Math.floor(Math.random() * allSuggestions.length)];
    if (!result.includes(suggestion)) {
      result.push(suggestion);
    }
  }
  
  return result;
};
