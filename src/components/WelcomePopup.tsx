
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  const { user, hasActiveSubscription } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const hasSeenPremiumWelcome = localStorage.getItem('hasSeenPremiumWelcome');
    
    const checkSubscriptionStatus = async () => {
      if (user) {
        const isSubscribed = await hasActiveSubscription();
        setIsPremium(isSubscribed);
        
        // Show premium welcome if user has an active subscription and hasn't seen it yet
        if (isSubscribed && !hasSeenPremiumWelcome && type === 'premium') {
          setOpen(true);
          localStorage.setItem('hasSeenPremiumWelcome', 'true');
        }
      }
    };
    
    // Show new user welcome if this is their first visit
    if (!hasSeenWelcome && type === 'new-user') {
      setOpen(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    
    checkSubscriptionStatus();
  }, [user, hasActiveSubscription, type]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {type === 'premium' 
              ? 'Welcome to Premium Access!' 
              : 'Welcome to AI Resume Analyzer!'}
          </DialogTitle>
          <DialogDescription>
            {type === 'premium' 
              ? 'Thank you for upgrading to premium. You now have full access to all our resume analysis features.'
              : 'Get professional feedback on your resume to stand out in the job market.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {type === 'premium' ? (
            <div className="space-y-3">
              <h3 className="font-medium">Your premium benefits include:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Unlimited resume analyses</li>
                <li>In-depth feedback on all resume sections</li>
                <li>Job matching recommendations</li>
                <li>Downloadable reports</li>
                <li>Priority support</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-medium">Here's what you can do:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Upload your resume for instant analysis</li>
                <li>Get feedback on formatting, content, and skills</li>
                <li>See your resume score and improvement suggestions</li>
                <li>Upgrade to premium for unlimited analyses</li>
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end">
          <Button onClick={handleClose}>
            {type === 'premium' ? 'Start Exploring' : 'Get Started'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
