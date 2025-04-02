
import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import WelcomePopup from './components/WelcomePopup';

// Import pages
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analysis = lazy(() => import('./pages/Analysis'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function AppContent() {
  return (
    <>
      {/* Show regular welcome for new users */}
      <WelcomePopup type="new-user" />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
