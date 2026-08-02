import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SmartFarm AI React ErrorBoundary caught an unhandled exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass rounded-3xl p-8 border border-red-500/20 shadow-2xl space-y-6">
            <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-red-500/5">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-red-500">UI Application Exception</span>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Something went wrong</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {this.state.error?.message || "An unexpected error occurred in the SmartFarm AI interface component."}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload & Recover Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
