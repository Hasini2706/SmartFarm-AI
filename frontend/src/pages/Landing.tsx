import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  Droplet,
  CloudSun,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingProps {
  setCurrentPage: (page: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ setCurrentPage }) => {
  const { login, register, isAuthenticated, googleRedirectLogin } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Auth Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await googleRedirectLogin();
    } catch (err: any) {
      setAuthError('Failed to initialize Google login. Please try again.');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isLoginView) {
        await login(username, password);
        setCurrentPage('dashboard');
      } else {
        await register(email, username, password, fullName);
        setIsLoginView(true);
        // Clean fields
        setEmail('');
        setFullName('');
        alert('Registration successful! Please log in.');
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const features = [
    {
      title: "Disease Diagnostics",
      desc: "Instant leaf analysis using Scikit-Learn RandomForest visual feature extraction. Detects 14 different conditions.",
      icon: <Sprout className="h-6 w-6 text-emerald-500" />
    },
    {
      title: "Yield Forecasting",
      desc: "Predict yield outputs (tonnes/hectare) using regression algorithms with historical rainfall, temperature, and region metrics.",
      icon: <TrendingUp className="h-6 w-6 text-indigo-500" />
    },
    {
      title: "Smart Irrigation",
      desc: "Evaluates crop evapotranspiration rates to calculate optimal daily watering schedules and environmental warnings.",
      icon: <Droplet className="h-6 w-6 text-teal-500" />
    },
    {
      title: "Fertilizer Optimizer",
      desc: "Intelligent decision tree matching recommending customized NPK balances to maximize soil growth parameters.",
      icon: <CheckCircle2 className="h-6 w-6 text-amber-500" />
    },
    {
      title: "Weather Intelligence",
      desc: "Live temperature, pressure, wind velocity, and humidity tracking coupled with automated agronomic guidance.",
      icon: <CloudSun className="h-6 w-6 text-blue-500" />
    },
    {
      title: "Farmer AI Copilot",
      desc: "Interactive natural-language conversational agent trained in pest controls, schemes, prices, and organic techniques.",
      icon: <Bot className="h-6 w-6 text-purple-500" />
    }
  ];

  return (
    <div className="relative min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 left-1/4 h-72 w-72 bg-emerald-400/20 rounded-full blur-[100px] animate-float-slow -z-10" />
      <div className="absolute bottom-20 right-1/4 h-96 w-96 bg-teal-400/10 rounded-full blur-[120px] animate-float -z-10" />

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 pb-16">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>Smart Precision Farming Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
            Precision Ag Tech Powered by{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Artificial Intelligence
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl">
            Empower your crop management cycle with real-time computer vision disease diagnostics, yield prediction modeling, automated drip irrigation schedules, and conversational AI insights.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {isAuthenticated ? (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('register')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setCurrentPage('about')}
              className="px-6 py-3.5 rounded-2xl border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
            >
              Learn More
            </button>
          </div>

          {/* Quick numbers */}
          <div className="grid grid-cols-3 gap-6 border-t dark:border-slate-800 pt-8 mt-12">
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-200">98.4%</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Classification Acc</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-200">12,000+</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Acres Monitored</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-200">30%</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Water Saved</span>
            </div>
          </div>
        </div>

        {/* Auth section */}
        <div id="auth-form" className="lg:col-span-5 w-full">
          {isAuthenticated ? (
            <GlassCard premium hoverEffect className="space-y-6 text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold">You are authenticated!</h3>
              <p className="text-slate-500 text-sm">Welcome back to SmartFarm AI. Access your premium dashboard parameters, models history, and chats immediately.</p>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                Enter Platform Dashboard
              </button>
            </GlassCard>
          ) : (
            <GlassCard premium className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold">{isLoginView ? 'Welcome Back' : 'Create Account'}</h3>
                <p className="text-xs text-slate-400">
                  {isLoginView ? 'Access your private farm analytics' : 'Join SmartFarm precision agriculture platform'}
                </p>
              </div>

              {authError && (
                <div className="p-3 text-xs bg-red-100 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-xl">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLoginView && (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm"
                    />
                  </div>
                )}
                
                {!isLoginView && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm"
                    />
                  </div>
                )}

                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {authLoading ? 'Please wait...' : isLoginView ? 'Login' : 'Register'}
                </button>
              </form>

              {isLoginView && (
                <>
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400">or</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm text-sm"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.513 0-6.362-2.85-6.362-6.361s2.85-6.363 6.362-6.363c1.616 0 3.078.61 4.2 1.605l3.1-3.1C18.665 1.83 15.65 0 12.24 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c6.22 0 11.233-4.545 11.948-10.51H12.24z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsLoginView(!isLoginView);
                    setAuthError('');
                  }}
                  className="text-xs text-emerald-600 hover:underline dark:text-emerald-400 font-medium"
                >
                  {isLoginView ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Feature Grid Section */}
      <div className="py-16 border-t dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Everything you need for smart agriculture
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            A cohesive suite of machine learning engines feeding off telemetry datasets and image sensors to output SaaS-level audit diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <GlassCard key={idx} hoverEffect className="space-y-4 text-left group">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 w-fit transition-transform group-hover:scale-110">
                {feat.icon}
              </div>
              <h4 className="text-lg font-bold">{feat.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Testimonials section */}
      <div className="py-16 border-t dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Farmer Testimonials</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real stories from agricultural consultants managing commercial fields.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="space-y-4 text-left">
            <p className="italic text-slate-500 dark:text-slate-400 text-sm">
              "SmartFarm AI revolutionized how we monitor our wheat crop health. The early blight diagnoses saved us over 12% in yield losses this season because we sprayed copper fungicide within hours of the alert."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800">JS</div>
              <div>
                <span className="block font-bold text-sm">Jaspreet Singh</span>
                <span className="block text-xs text-slate-400">Wheat Farmer, Punjab (150 Acres)</span>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="space-y-4 text-left">
            <p className="italic text-slate-500 dark:text-slate-400 text-sm">
              "The smart irrigation calculations are incredibly accurate. Rather than watering blindly every day, the weather forecasting and soil moisture sensors determine the exact water liters needed. My electricity bills dropped by 25%."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-800">AM</div>
              <div>
                <span className="block font-bold text-sm">Aniket More</span>
                <span className="block text-xs text-slate-400">Cotton Cultivator, Maharashtra (80 Acres)</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 border-t dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Simple Transparent Pricing</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Unlock precision agricultural modeling scaled for your land volume.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="space-y-5 text-left border-t-4 border-t-slate-400 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Free Trial</span>
              <h4 className="text-3xl font-extrabold">₹0 <span className="text-sm font-normal text-slate-400">/ forever</span></h4>
              <p className="text-slate-500 text-xs leading-relaxed">Perfect for micro-plot growers testing diagnostic capabilities.</p>
              <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-3 border-t dark:border-slate-800">
                <li className="flex items-center gap-2">✓ 10 Crop Image Uploads / mo</li>
                <li className="flex items-center gap-2">✓ Basic Yield Prediction form</li>
                <li className="flex items-center gap-2">✓ Standard Weather advisory</li>
                <li className="flex items-center gap-2">✓ Basic Farmer AI Chatbot</li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) setCurrentPage('register');
                else setCurrentPage('dashboard');
              }}
              className="w-full mt-6 py-2.5 rounded-xl border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-center transition-all"
            >
              Sign Up Free
            </button>
          </GlassCard>

          <GlassCard className="space-y-5 text-left border-t-4 border-t-emerald-500 flex flex-col justify-between relative shadow-lg shadow-emerald-500/5">
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">Popular</div>
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Professional</span>
              <h4 className="text-3xl font-extrabold">₹999 <span className="text-sm font-normal text-slate-400">/ month</span></h4>
              <p className="text-slate-500 text-xs leading-relaxed">Designed for commercial farmers seeking full predictive analytics.</p>
              <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-3 border-t dark:border-slate-800">
                <li className="flex items-center gap-2">✓ UNLIMITED Crop Image Uploads</li>
                <li className="flex items-center gap-2">✓ Full Sensitivity Yield charts</li>
                <li className="flex items-center gap-2">✓ Smart Drip Irrigation Schedules</li>
                <li className="flex items-center gap-2">✓ Premium AI Chatbot + Voice TTS</li>
                <li className="flex items-center gap-2">✓ High-quality PDF Diagnostics Download</li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) setCurrentPage('register');
                else setCurrentPage('dashboard');
              }}
              className="w-full mt-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center transition-all shadow-md shadow-emerald-500/10"
            >
              Upgrade to Pro
            </button>
          </GlassCard>

          <GlassCard className="space-y-5 text-left border-t-4 border-t-teal-500 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-widest text-teal-600 dark:text-teal-400">Enterprise</span>
              <h4 className="text-3xl font-extrabold">Custom <span className="text-sm font-normal text-slate-400">/ quote</span></h4>
              <p className="text-slate-500 text-xs leading-relaxed">For agricultural co-ops, research centers, and seed corporations.</p>
              <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-3 border-t dark:border-slate-800">
                <li className="flex items-center gap-2">✓ Custom API integrations</li>
                <li className="flex items-center gap-2">✓ Multi-node IoT telemetry caches</li>
                <li className="flex items-center gap-2">✓ Custom ML model pipelines</li>
                <li className="flex items-center gap-2">✓ Dedicated agronomist advisor</li>
                <li className="flex items-center gap-2">✓ Drone/Satellite image classification</li>
              </ul>
            </div>
            <a
              href="#contact"
              className="w-full mt-6 py-2.5 rounded-xl border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-center block transition-all"
            >
              Contact Sales
            </a>
          </GlassCard>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="py-12 border-t dark:border-slate-800 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
            SmartFarm AI
          </span>
        </div>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          Providing enterprise-level machine learning frameworks for precision farming. Designed and implemented for sustainable agricultural productivity.
        </p>
        <div className="flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Support</a>
        </div>
        <p className="text-[10px] text-slate-500">© 2026 SmartFarm AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
