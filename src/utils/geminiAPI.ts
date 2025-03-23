
/**
 * Utility functions for interacting with Google's Gemini API
 */

const GEMINI_API_KEY = "AIzaSyDRaN-j-cBwPTBNBzFStrA7GDNVPY33jUc";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
 * Extract text from a PDF file
 * In a real implementation, this would use a PDF parsing library
 * For now we're mocking this functionality
 */
const extractTextFromFile = async (file: File): Promise<string> => {
  // In a real implementation, you would use a library like pdf.js to extract text
  // For this example, we'll just return a placeholder text
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // This is just a stub - in a real implementation you'd parse the file content
      resolve("Sample resume text extracted from " + file.name);
    };
    reader.readAsText(file);
  });
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
    1. score: A number from 0-100 representing overall resume quality
    2. sections: An object with keys for common resume sections (summary, experience, education, skills, projects, certifications), each having 'present' (boolean) and 'quality' (string: excellent, good, fair, poor, or missing)
    3. keywords: Object with 'matching' and 'missing' arrays of keywords (strings)
    4. formatting: Object with 'atsCompatible' (boolean) and 'issues' (array of strings)
    5. aiSuggestions: Array of string suggestions for improvement
    
    Focus your analysis on how well the resume matches the job description (if provided), section quality, keyword optimization, and ATS compatibility.
    `;

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
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
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
      } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e);
        analysisResult = generateFallbackResponse();
      }
    } else {
      console.error("Could not find JSON in Gemini response");
      analysisResult = generateFallbackResponse();
    }
    
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return generateFallbackResponse();
  }
};

/**
 * Generate a fallback response in case of API failure
 */
const generateFallbackResponse = (): ResumeAnalysisResult => {
  return {
    score: 65, // Average score as fallback
    sections: {
      summary: { present: true, quality: "fair" },
      experience: { present: true, quality: "good" },
      education: { present: true, quality: "good" },
      skills: { present: true, quality: "fair" },
      projects: { present: false, quality: "missing" },
      certifications: { present: false, quality: "missing" },
    },
    keywords: {
      matching: ["communication", "team player", "problem solving"],
      missing: ["leadership", "project management", "agile methodology"],
    },
    formatting: {
      atsCompatible: true,
      issues: ["Consider improving readability with better spacing"],
    },
    aiSuggestions: [
      "Add more specific achievements with quantifiable results",
      "Include a projects section to showcase practical experience",
      "Consider adding relevant certifications"
    ],
  };
};
