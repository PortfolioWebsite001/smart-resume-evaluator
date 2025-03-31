
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { CreditCard, Check, ThumbsUp } from 'lucide-react';

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-lg text-muted-foreground">
            Upgrade to premium to get 15 resume scans and professional analyses
          </p>
        </div>

        <div className="max-w-md mx-auto rounded-lg overflow-hidden shadow-lg border">
          <div className="bg-primary p-6 text-primary-foreground">
            <h2 className="text-2xl font-bold">Premium Subscription</h2>
            <div className="mt-4 flex items-baseline justify-center">
              <span className="text-5xl font-extrabold">KSh 150</span>
              <span className="ml-1 text-xl text-muted">/week</span>
            </div>
          </div>
          
          <div className="p-6 bg-card">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span><strong>15 resume scans</strong> (regular users get only 3)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Detailed AI-powered analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Personalized improvement suggestions</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Job description matching</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Downloadable reports</span>
              </li>
            </ul>
            
            <div className="mt-8">
              <Button 
                className="w-full text-lg py-6 flex items-center justify-center" 
                onClick={() => navigate('/payment')}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Subscribe Now
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>Secure payment via M-Pesa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
