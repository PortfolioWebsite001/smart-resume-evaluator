
import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePopup from './components/WelcomePopup';
import { subscribeToPaymentUpdates } from './integrations/supabase/client';

// Import pages
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analysis = lazy(() => import('./pages/Analysis'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Subscription = lazy(() => import('./pages/Subscription'));
const PaymentForm = lazy(() => import('./pages/PaymentForm'));

function AppContent() {
  const { user, hasActiveSubscription } = useAuth();
  const [showPremiumWelcome, setShowPremiumWelcome] = useState(false);
  const [prevSubscriptionStatus, setPrevSubscriptionStatus] = useState(false);

  useEffect(() => {
    // Check subscription status on mount
    const checkSubscription = async () => {
      if (user) {
        const isSubscribed = await hasActiveSubscription();
        setPrevSubscriptionStatus(isSubscribed);
      }
    };
    
    checkSubscription();
  }, [user, hasActiveSubscription]);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to payment updates
    const subscription = subscribeToPaymentUpdates(user.id, async () => {
      const isSubscribed = await hasActiveSubscription();
      
      // If user just got premium access, show the premium welcome
      if (isSubscribed && !prevSubscriptionStatus) {
        setShowPremiumWelcome(true);
        localStorage.removeItem('hasSeenPremiumWelcome'); // Force show the welcome popup
        setPrevSubscriptionStatus(true);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, hasActiveSubscription, prevSubscriptionStatus]);

  return (
    <>
      {/* Show regular welcome for new users */}
      <WelcomePopup type="new-user" />
      
      {/* Show premium welcome when premium is activated */}
      {showPremiumWelcome && <WelcomePopup type="premium" />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <AppContent />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
