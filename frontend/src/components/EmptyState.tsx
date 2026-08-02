import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <Sparkles className="h-10 w-10 text-emerald-500 animate-pulse" />
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-3xl min-h-[300px] border border-dashed border-slate-300 dark:border-slate-800">
      <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 p-4 mb-4 shadow-inner flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
        {description}
      </p>
    </div>
  );
};
