import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => showToast(message, 'success', title), [showToast]);
  const error = useCallback((message: string, title?: string) => showToast(message, 'error', title), [showToast]);
  const info = useCallback((message: string, title?: string) => showToast(message, 'info', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <aside
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-xl border font-semibold text-xs transition-all ${
                  isSuccess
                    ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 dark:bg-emerald-900/90'
                    : isError
                    ? 'bg-red-950/90 text-red-100 border-red-500/40 dark:bg-red-900/90'
                    : 'bg-slate-900/90 text-slate-100 border-slate-700 dark:bg-slate-800/90'
                }`}
                role="alert"
              >
                <div className="mt-0.5 shrink-0">
                  {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  {isError && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {!isSuccess && !isError && <Info className="h-5 w-5 text-indigo-400" />}
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  {toast.title && <div className="font-extrabold text-sm tracking-tight">{toast.title}</div>}
                  <div className="leading-relaxed opacity-90">{toast.message}</div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close notification"
                  className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
