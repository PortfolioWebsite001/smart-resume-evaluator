import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { FileUp, File, X, Loader2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { analyzeResume } from "@/utils/geminiAPI";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
}

const UploadZone = ({ onFileUpload }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, getRemainingFreeScans, hasActiveSubscription } = useAuth();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf' || fileExtension === 'docx') {
      setSelectedFile(file);
    } else {
      toast.error("Please upload a PDF or DOCX file");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateScanningProcess = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 150);
    
    return () => clearInterval(interval);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to analyze your resume");
      navigate("/login");
      return;
    }
    
    const remainingScans = await getRemainingFreeScans();
    const isSubscribed = await hasActiveSubscription();
    
    if (remainingScans <= 0 && !isSubscribed) {
      toast.error("You've used all your free scans. Please subscribe to continue.");
      navigate("/subscription");
      return;
    }

    setIsLoading(true);
    
    const clearScanInterval = simulateScanningProcess();
    
    try {
      const analysisResults = await analyzeResume(selectedFile, jobDescription);
      
      const { data, error } = await supabase
        .from('resume_scans')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          job_description: jobDescription,
          score: analysisResults.score,
          scan_results: JSON.stringify(analysisResults) as any
        })
        .select()
        .single();
      
      if (error) throw error;
      
      onFileUpload(selectedFile);
      
      setTimeout(() => {
        clearScanInterval();
        
        navigate("/analysis", { 
          state: { 
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            uploadTime: new Date().toISOString(),
            jobDescription: jobDescription,
            analysisResults: analysisResults,
            scanId: data.id
          }
        });
      }, 3000);
    } catch (error) {
      clearScanInterval();
      console.error("Error processing file:", error);
      toast.error("There was an error analyzing your resume");
      setIsScanning(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!user && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm">
          <p className="font-medium">Create an account to track your resume analyses</p>
          <p className="text-muted-foreground mt-1">
            Sign up to get 3 free resume scans and personalized feedback.
          </p>
          <div className="mt-3 flex space-x-2">
            <Button asChild size="sm" variant="default">
              <Link to="/signup">Sign Up</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      )}
      
      <div
        className={`upload-zone min-h-[280px] ${isDragging ? "dragging" : ""} ${selectedFile ? "border-primary/50 bg-primary/5" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {!selectedFile ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <FileUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Drag & drop your resume here</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, DOCX (Max 5MB)
              </p>
            </div>
            <Button variant="outline" className="mt-4">
              Browse Files
            </Button>
          </div>
        ) : (
          <div className="w-full text-center space-y-4">
            {isScanning ? (
              <div className="scanning-container space-y-4">
                <div className="relative mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Scan className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-sm font-medium">Scanning document...</p>
                <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">{scanProgress}% complete</p>
              </div>
            ) : (
              <>
                <div className="relative mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <File className="w-8 h-8 text-primary" />
                  <button
                    className="absolute -top-2 -right-2 bg-secondary rounded-full p-1 border border-border"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-base font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="jobDescription" className="text-sm font-medium">
            Job Description (Optional)
          </label>
          <textarea
            id="jobDescription"
            className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm"
            placeholder="Paste the job description here to get better resume analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            "Analyze Resume"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadZone;
