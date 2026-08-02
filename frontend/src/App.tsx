import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { YieldPrediction } from './pages/YieldPrediction';
import { CropRecommendation } from './pages/CropRecommendation';
import { Weather } from './pages/Weather';
import { Irrigation } from './pages/Irrigation';
import { Fertilizer } from './pages/Fertilizer';
import { PestDetection } from './pages/PestDetection';
import { AIAssistant } from './pages/AIAssistant';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';


const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = location.pathname.substring(1) || 'landing';

  const setCurrentPage = (page: string) => {
    if (page === 'landing') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
  };

  // Dark Mode effect to apply dark class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Route guarding: Redirect unauthenticated users back to login if trying to access dashboard/modules
  useEffect(() => {
    if (isLoading) return;
    const guardedPages = [
      'dashboard',
      'disease',
      'yield',
      'crop-rec',
      'irrigation',
      'weather',
      'fertilizer',
      'pest',
      'chat',
      'analytics',
      'reports',
      'settings',
      'profile'
    ];
    if (guardedPages.includes(currentPage) && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [currentPage, isAuthenticated, isLoading, navigate]);

  // Authenticated redirect: Send users to dashboard if they are already logged in
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register' || currentPage === 'forgot-password' || currentPage === 'landing')) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentPage, isAuthenticated, isLoading, navigate]);

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      <Routes>
        <Route path="/" element={<Landing setCurrentPage={setCurrentPage} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setCurrentPage={setCurrentPage} />} />
        <Route path="/register" element={<Register setCurrentPage={setCurrentPage} />} />
        <Route path="/forgot-password" element={<ForgotPassword setCurrentPage={setCurrentPage} />} />
        <Route path="/dashboard" element={<Dashboard setCurrentPage={setCurrentPage} />} />
        <Route path="/disease" element={<DiseaseDetection />} />
        <Route path="/yield" element={<YieldPrediction />} />
        <Route path="/crop-rec" element={<CropRecommendation />} />
        <Route path="/irrigation" element={<Irrigation />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/fertilizer" element={<Fertilizer />} />
        <Route path="/pest" element={<PestDetection />} />
        <Route path="/chat" element={<AIAssistant />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};


export default App;
