import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { About } from './pages/About';
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
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();

  // Dark Mode effect to apply dark class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Route guarding: Redirect unauthenticated users back to landing if trying to access dashboard/modules
  useEffect(() => {
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
      setCurrentPage('landing');
    }
  }, [currentPage, isAuthenticated]);

  const renderActivePage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing setCurrentPage={setCurrentPage} />;
      case 'about':
        return <About />;
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'disease':
        return <DiseaseDetection />;
      case 'yield':
        return <YieldPrediction />;
      case 'crop-rec':
        return <CropRecommendation />;
      case 'irrigation':
        return <Irrigation />;
      case 'weather':
        return <Weather />;
      case 'fertilizer':
        return <Fertilizer />;
      case 'pest':
        return <PestDetection />;
      case 'chat':
        return <AIAssistant />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Landing setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderActivePage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
