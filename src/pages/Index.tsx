
import { useState } from "react";
import Layout from "@/components/Layout";
import UploadZone from "@/components/UploadZone";
import { FileText, CheckCircle, Zap } from "lucide-react";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  return (
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <section className="section-container text-center space-y-4">
          <div className="space-y-2 max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
              Optimize Your Resume with AI Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant feedback and improve your chances of landing your dream job.
            </p>
          </div>
        </section>

        {/* Upload Section */}
        <section className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="analysis-card">
              <UploadZone onFileUpload={handleFileUpload} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">What We Analyze</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="analysis-card card-hover">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Structure Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  We check for all essential sections and ensure your resume is properly structured.
                </p>
              </div>
              
              <div className="analysis-card card-hover">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ATS Compatibility</h3>
                <p className="text-sm text-muted-foreground">
                  Ensure your resume passes through Applicant Tracking Systems with high scores.
                </p>
              </div>
              
              <div className="analysis-card card-hover">
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Keyword Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Compare your resume against job descriptions to highlight missing keywords.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
