import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Droplet,
  CloudSun,
  Beaker,
  Bug,
  MessageSquareCode,
  LineChart,
  FileSpreadsheet,
  Settings,
  Info,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User as UserIcon,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  setCurrentPage,
  darkMode,
  setDarkMode,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'disease', label: 'Crop Disease', icon: <Sprout className="h-5 w-5" /> },
    { id: 'yield', label: 'Yield Prediction', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'crop-rec', label: 'Crop Recommend', icon: <Leaf className="h-5 w-5" /> },
    { id: 'irrigation', label: 'Smart Irrigation', icon: <Droplet className="h-5 w-5" /> },
    { id: 'weather', label: 'Weather Intel', icon: <CloudSun className="h-5 w-5" /> },
    { id: 'fertilizer', label: 'Fertilizer Rec', icon: <Beaker className="h-5 w-5" /> },
    { id: 'pest', label: 'Pest Detection', icon: <Bug className="h-5 w-5" /> },
    { id: 'chat', label: 'Farmer AI Assistant', icon: <MessageSquareCode className="h-5 w-5" /> },
    { id: 'analytics', label: 'Advanced Analytics', icon: <LineChart className="h-5 w-5" /> },
    { id: 'reports', label: 'Diagnosis Reports', icon: <FileSpreadsheet className="h-5 w-5" /> },
    { id: 'profile', label: 'Farmer Profile', icon: <UserIcon className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { id: 'about', label: 'About SmartFarm', icon: <Info className="h-5 w-5" /> },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    const active = navigationItems.find((item) => item.id === currentPage);
    return active ? active.label : 'SmartFarm AI';
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark text-slate-100 bg-slate-950' : 'text-slate-900 bg-slate-50'}`}>
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
          ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center justify-between px-6 border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                SmartFarm AI
              </span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Precision Ag Tech</span>
            </div>
          </div>
          <button
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-600/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
              >
                <div className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t dark:border-slate-800">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100/50 dark:bg-slate-800/40 border dark:border-slate-800">
              <div 
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                title="View Profile Details"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <span className="block font-semibold text-sm truncate dark:text-slate-200">
                    {user.full_name || user.username}
                  </span>
                  <span className="block text-xs text-slate-400 capitalize truncate">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('landing')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all text-sm"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In / Join</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main dashboard frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b shrink-0 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button
              className="p-2.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-800 lg:hidden transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold dark:text-slate-100 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            {/* Quick platform status */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-500 dark:text-slate-400">API Live</span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 bg-grid-pattern relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
