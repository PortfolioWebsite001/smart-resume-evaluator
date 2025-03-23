
import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { FileUp, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
}

const UploadZone = ({ onFileUpload }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    
    // In a real application, you would upload the file to the server here
    // For this demo, we'll simulate the upload and analysis
    try {
      // Simulate file processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onFileUpload(selectedFile);
      
      // Simulate successful analysis
      setIsLoading(false);
      
      // Navigate to analysis page with resume data
      navigate("/analysis", { 
        state: { 
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          uploadTime: new Date().toISOString(),
          jobDescription: jobDescription
        }
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("There was an error processing your file");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
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
