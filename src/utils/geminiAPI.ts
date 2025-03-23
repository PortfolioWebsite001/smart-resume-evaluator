
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
      resolve(`
      JASON WILSON
      Senior Software Engineer

      CONTACT
      Email: jason.wilson@email.com
      Phone: (123) 456-7890
      LinkedIn: linkedin.com/in/jasonwilson
      GitHub: github.com/jasonwilson

      PROFESSIONAL SUMMARY
      Experienced software engineer with 8+ years developing scalable web applications and distributed systems. Expertise in JavaScript, TypeScript, React, and Node.js. Passionate about clean code, performance optimization, and modern development practices.

      SKILLS
      • Programming: JavaScript, TypeScript, Python, Java, SQL
      • Frontend: React, Redux, HTML5, CSS3, Tailwind CSS
      • Backend: Node.js, Express, NestJS, Django
      • Databases: MongoDB, PostgreSQL, Redis
      • Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
      • Tools: Git, GitHub Actions, Jest, Cypress

      WORK EXPERIENCE
      Senior Software Engineer
      TechInnovate Inc. | Jan 2020 - Present
      • Led development of a microservices architecture that improved system scalability by 40%
      • Implemented CI/CD pipelines reducing deployment time by 65%
      • Mentored junior developers and conducted code reviews
      • Optimized React application performance resulting in 30% faster page loads

      Software Engineer
      DataSystems Corp | Mar 2017 - Dec 2019
      • Developed RESTful APIs serving 1M+ daily requests with 99.9% uptime
      • Built responsive web applications using React and Redux
      • Collaborated with UX designers to implement intuitive user interfaces
      • Participated in agile development processes with 2-week sprint cycles

      Junior Developer
      WebSolutions LLC | Jun 2015 - Feb 2017
      • Maintained and enhanced legacy PHP applications
      • Assisted in migration from monolithic architecture to microservices
      • Created automated testing frameworks improving code coverage by 40%

      EDUCATION
      Bachelor of Science in Computer Science
      University of Technology | Graduated: May 2015
      • GPA: 3.8/4.0
      • Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development

      PROJECTS
      E-commerce Platform (2022)
      • Built a full-stack e-commerce solution using MERN stack
      • Implemented Stripe payment integration and user authentication
      • Utilized Redis for caching, reducing database load by 35%

      Real-time Chat Application (2021)
      • Developed using Socket.io, React, and Node.js
      • Implemented end-to-end encryption for message security
      • Deployed using Docker containers on AWS EC2

      CERTIFICATIONS
      • AWS Certified Developer - Associate (2022)
      • MongoDB Certified Developer (2021)
      • Google Cloud Professional Developer (2020)
      `);
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
    3. sections: An object with keys for common resume sections (summary, experience, education, skills, projects, certifications), each having 'present' (boolean), 'quality' (string: excellent, good, fair, poor, or missing), 'feedback' (string with specific improvement suggestions), and 'score' (number from 0-100)
    4. keywords: Object with 'matching' and 'missing' arrays of keywords (strings)
    5. formatting: Object with 'atsCompatible' (boolean) and 'issues' (array of strings)
    6. aiSuggestions: Array of string suggestions for improvement
    7. actionItems: Array of specific actions the candidate should take to improve the resume
    8. overallSummary: A paragraph summarizing the resume analysis and key improvement areas
    
    Focus your analysis on how well the resume matches the job description (if provided), section quality, keyword optimization, and ATS compatibility.
    If no job description is provided, evaluate the resume based on general best practices.
    Be critical and provide actionable feedback. Don't just say everything is good. Find areas to improve.
    For each section, give a specific score from 0-100 showing how good that particular section is.
    Use different scores for different sections - don't give the same score to everything.
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
  return {
    score: 65, // Average score as fallback
    userName: "Applicant", // Default name
    resumeText: resumeText, // Include the resume text
    sections: {
      summary: { present: true, quality: "fair", feedback: "Consider adding more specifics about your strengths and career goals.", score: 60 },
      experience: { present: true, quality: "good", feedback: "Add more quantifiable achievements to each position.", score: 75 },
      education: { present: true, quality: "good", feedback: "Your education section is solid, but consider adding relevant coursework.", score: 70 },
      skills: { present: true, quality: "fair", feedback: "Organize skills into categories and prioritize those most relevant to the job.", score: 65 },
      projects: { present: false, quality: "missing", feedback: "Add a projects section to showcase practical application of your skills.", score: 30 },
      certifications: { present: false, quality: "missing", feedback: "Consider adding relevant certifications to strengthen your qualifications.", score: 40 },
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

