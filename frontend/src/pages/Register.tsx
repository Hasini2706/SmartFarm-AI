import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { User as UserIcon, Lock, Mail, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface RegisterProps {
  setCurrentPage: (page: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ setCurrentPage }) => {
  const { register, googleRedirectLogin } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    try {
      toast.info('Redirecting to Google OAuth Sign-Up...', 'Google OAuth');
      await googleRedirectLogin();
    } catch (err: any) {
      const msg = 'Failed to initialize Google login. Please try again.';
      setError(msg);
      toast.error(msg, 'OAuth Error');
    }
  };


  // Password strength checklist states
  const [strengthCheck, setStrengthCheck] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false,
    special: false
  });

  useEffect(() => {
    setStrengthCheck({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Sanitization & Basic Validation
    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      const msg = 'All fields are required';
      setError(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const msg = 'Invalid email address format';
      setError(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    const isPasswordStrong = Object.values(strengthCheck).every(Boolean);
    if (!isPasswordStrong) {
      const msg = 'Password does not satisfy all strength requirements';
      setError(msg);
      toast.error(msg, 'Password Weak');
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg, 'Mismatch Error');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), username.trim(), password, fullName.trim());
      setSuccess(true);
      toast.success('Registration successful! Redirecting to login...', 'Account Created');
      setTimeout(() => {
        setCurrentPage('login');
      }, 2500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Username or email may already be taken.';
      setError(msg);
      toast.error(msg, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };


  const StrengthRule: React.FC<{ checked: boolean; label: string }> = ({ checked, label }) => (
    <div className="flex items-center gap-1.5 text-xs">
      {checked ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
      )}
      <span className={checked ? 'text-emerald-500 font-medium' : 'text-slate-400'}>{label}</span>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <GlassCard premium hoverEffect className="space-y-6 text-center py-12 border border-white/10 dark:border-slate-800">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-3xl font-bold">Account Created!</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Your farmer profile has been registered successfully. Redirecting you to the login screen...
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background visual elements */}
      <div className="absolute top-10 left-1/4 h-72 w-72 bg-emerald-400/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 right-1/4 h-72 w-72 bg-teal-400/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-md w-full space-y-8">
        <GlassCard premium className="space-y-5 p-8 border border-white/10 dark:border-slate-800">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <UserIcon className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-400">Join SmartFarm to run automated AI crop models</p>
          </div>

          {error && (
            <div className="p-4 text-sm bg-red-100/80 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-2xl flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block px-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter your name (e.g. John Doe)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block px-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:bg-slate-900/40 dark:border-slate-800 transition-all text-sm disabled:opacity-50"
                />
              </div>
              {/* Visual strength checklist gauge */}
              {password && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border dark:border-slate-800 grid grid-cols-2 gap-2 mt-2">
                  <StrengthRule checked={strengthCheck.length} label="At least 8 chars" />
                  <StrengthRule checked={strengthCheck.lowercase} label="One lowercase" />
                  <StrengthRule checked={strengthCheck.uppercase} label="One uppercase" />
                  <StrengthRule checked={strengthCheck.digit} label="One digit" />
                  <StrengthRule checked={strengthCheck.special} label="One symbol" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block px-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              <span>{loading ? 'Creating account...' : 'Register'}</span>
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
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.513 0-6.362-2.85-6.362-6.361s2.85-6.363 6.362-6.363c1.616 0 3.078.61 4.2 1.605l3.1-3.1C18.665 1.83 15.65 0 12.24 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c6.22 0 11.233-4.545 11.948-10.51H12.24z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Already have an account? </span>
            <button
              onClick={() => setCurrentPage('login')}
              className="text-xs text-emerald-600 hover:underline dark:text-emerald-400 font-bold"
            >
              Log In
            </button>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};
