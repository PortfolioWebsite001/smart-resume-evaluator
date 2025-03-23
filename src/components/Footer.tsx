
import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground order-2 md:order-1">
            © {currentYear} AI Resume Analyzer. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4 order-1 md:order-2">
            <p className="text-sm flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500 animate-pulse" /> for job seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
