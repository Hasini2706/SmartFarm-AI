import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { Lock, User as UserIcon, ArrowRight, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface LoginProps {
  setCurrentPage: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setCurrentPage }) => {
  const { login, googleRedirectLogin } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Field validations
    if (!username.trim()) {
      const msg = 'Username is required';
      setError(msg);
      toast.error(msg, 'Validation Error');
      return;
    }
    if (!password) {
      const msg = 'Password is required';
      setError(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      toast.success(`Welcome back, ${username}!`, 'Login Successful');
      setCurrentPage('dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid username or password. Please try again.';
      setError(msg);
      toast.error(msg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      toast.info('Redirecting to Google Sign-In...', 'OAuth Flow');
      await googleRedirectLogin();
    } catch (err: any) {
      const msg = 'Failed to initialize Google login. Please try again.';
      setError(msg);
      toast.error(msg, 'OAuth Failure');
    }
  };


  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Visual background blobs */}
      <div className="absolute top-10 left-1/3 h-72 w-72 bg-emerald-400/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 right-1/3 h-72 w-72 bg-teal-400/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-md w-full space-y-8">
        <GlassCard premium className="space-y-6 shadow-xl p-8 border border-white/10 dark:border-slate-800">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-400">Access your private farm decision intelligence dashboard</p>
          </div>

          {error && (
            <div className="p-4 text-sm bg-red-100/80 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-2xl flex items-start gap-2 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block px-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-slate-400 block">Password</label>
                <button
                  type="button"
                  onClick={() => setCurrentPage('forgot-password')}
                  className="text-xs text-emerald-600 hover:underline dark:text-emerald-400 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400">or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm text-sm"
          >
            {/* Google G Logo icon using inline SVG */}
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.513 0-6.362-2.85-6.362-6.361s2.85-6.363 6.362-6.363c1.616 0 3.078.61 4.2 1.605l3.1-3.1C18.665 1.83 15.65 0 12.24 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c6.22 0 11.233-4.545 11.948-10.51H12.24z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <button
              onClick={() => setCurrentPage('register')}
              className="text-xs text-emerald-600 hover:underline dark:text-emerald-400 font-bold"
            >
              Sign Up Free
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
