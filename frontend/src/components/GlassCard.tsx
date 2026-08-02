import React from 'react';
import clsx from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  premium?: boolean;
  hoverEffect?: boolean;
  glowColor?: 'emerald' | 'amber' | 'teal' | 'slate';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  premium = false,
  hoverEffect = false,
  glowColor,
  ...props
}) => {
  const glowClasses = {
    emerald: 'hover:shadow-[0_20px_50px_-12px_rgba(16,124,65,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(16,124,65,0.35)]',
    amber: 'hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.35)]',
    teal: 'hover:shadow-[0_20px_50px_-12px_rgba(13,148,136,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(13,148,136,0.35)]',
    slate: 'hover:shadow-[0_20px_50px_-12px_rgba(71,85,105,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(71,85,105,0.35)]',
  };

  return (
    <div
      className={clsx(
        premium ? 'glass-premium' : 'glass',
        'rounded-3xl p-6 transition-all duration-300 ease-out border backdrop-blur-md',
        hoverEffect && 'hover:-translate-y-1 hover:scale-[1.01]',
        glowColor && glowClasses[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
