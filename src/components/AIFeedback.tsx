
import { useState } from "react";
import { Sparkles } from "lucide-react";

interface AIFeedbackProps {
  suggestions: string[];
}

const AIFeedback = ({ suggestions }: AIFeedbackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % suggestions.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative p-4 bg-primary/5 rounded-lg border border-primary/20 min-h-[100px] flex items-center">
        <div className="absolute -top-3 -left-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
        
        <p className="text-sm ml-1">{suggestions[currentIndex]}</p>
      </div>
      
      {suggestions.length > 1 && (
        <div className="flex items-center justify-between">
          <button 
            onClick={handlePrevious}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {suggestions.map((_, index) => (
              <div 
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  currentIndex === index 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AIFeedback;
