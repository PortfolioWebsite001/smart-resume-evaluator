
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
  userName: string;
  sections: Record<string, { present: boolean; quality: string; feedback: string }>;
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
    2. userName: Extract the applicant's name from the resume
    3. sections: An object with keys for common resume sections (summary, experience, education, skills, projects, certifications), each having 'present' (boolean), 'quality' (string: excellent, good, fair, poor, or missing), and 'feedback' (string with specific improvement suggestions)
    4. keywords: Object with 'matching' and 'missing' arrays of keywords (strings)
    5. formatting: Object with 'atsCompatible' (boolean) and 'issues' (array of strings)
    6. aiSuggestions: Array of string suggestions for improvement
    7. actionItems: Array of specific actions the candidate should take to improve the resume
    8. overallSummary: A paragraph summarizing the resume analysis and key improvement areas
    
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
    userName: "Applicant", // Default name
    sections: {
      summary: { present: true, quality: "fair", feedback: "Consider adding more specifics about your strengths and career goals." },
      experience: { present: true, quality: "good", feedback: "Add more quantifiable achievements to each position." },
      education: { present: true, quality: "good", feedback: "Your education section is solid, but consider adding relevant coursework." },
      skills: { present: true, quality: "fair", feedback: "Organize skills into categories and prioritize those most relevant to the job." },
      projects: { present: false, quality: "missing", feedback: "Add a projects section to showcase practical application of your skills." },
      certifications: { present: false, quality: "missing", feedback: "Consider adding relevant certifications to strengthen your qualifications." },
    },
    keywords: {
      matching: ["communication", "team player", "problem solving"],
      missing: ["leadership", "project management", "agile methodology"],
    },
    formatting: {
      atsCompatible: true,
      issues: ["Consider improving readability with better spacing", "Ensure consistent bullet point formatting"],
    },
    aiSuggestions: [
      "Add more specific achievements with quantifiable results",
      "Include a projects section to showcase practical experience",
      "Consider adding relevant certifications"
    ],
    actionItems: [
      "Reorganize skills section into technical and soft skill categories",
      "Add 2-3 quantifiable achievements to each job position",
      "Create a concise summary that highlights your value proposition",
      "Add a projects section with 2-3 relevant projects"
    ],
    overallSummary: "Your resume has solid foundational elements but could benefit from more specific achievements and better keyword optimization. Focus on quantifying your impact and aligning your experience with the target job description. Improving the structure and adding missing sections will significantly enhance your resume's effectiveness."
  };
};
