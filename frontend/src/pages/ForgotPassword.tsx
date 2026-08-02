import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Mail, ArrowRight, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordProps {
  setCurrentPage: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Invalid email address format');
      return;
    }

    setLoading(true);
    // Simulate API request to reset password
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background visual blobs */}
      <div className="absolute top-10 left-1/3 h-72 w-72 bg-emerald-400/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 right-1/3 h-72 w-72 bg-teal-400/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-md w-full space-y-8">
        <GlassCard premium className="space-y-6 p-8 border border-white/10 dark:border-slate-800">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Reset Password</h2>
            <p className="text-sm text-slate-400">Receive a recovery link to access your account</p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-100/80 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 rounded-2xl flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold block">Reset Link Dispatched</span>
                  <span>We've dispatched a recovery link to <strong>{email}</strong>. Please check your inbox and spam folders.</span>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('login')}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 text-center"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm bg-red-100/80 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-2xl flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email address linked to account"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Dispatched recovery link...' : 'Send Reset Link'}</span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage('login')}
                  className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline font-bold"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
