
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomePopupProps {
  type?: 'new-user' | 'premium';
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ type = 'new-user' }) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    // Show new user welcome if this is their first visit
    if (!hasSeenWelcome && type === 'new-user') {
      setOpen(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user, type]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Welcome to AI Resume Analyzer!
          </DialogTitle>
          <DialogDescription>
            Get professional feedback on your resume to stand out in the job market.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-3">
            <h3 className="font-medium">Here's what you can do:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Upload your resume for instant analysis</li>
              <li>Get feedback on formatting, content, and skills</li>
              <li>See your resume score and improvement suggestions</li>
              <li>Analyze as many resumes as you want - completely free!</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end">
          <Button onClick={handleClose}>
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
