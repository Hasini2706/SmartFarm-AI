import React from 'react';
import clsx from 'clsx';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'text' | 'graph';
  lines?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  lines = 3,
  className
}) => {
  const shimmer = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl';

  if (type === 'text') {
    return (
      <div className={clsx("space-y-2.5 w-full", className)}>
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={clsx(
              shimmer,
              "h-4",
              idx === lines - 1 ? "w-2/3" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  if (type === 'graph') {
    return (
      <div className={clsx("w-full flex flex-col space-y-4", className)}>
        <div className="flex justify-between items-end h-48 w-full gap-4 px-2">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className={clsx(shimmer, "w-full")}
              style={{ height: `${20 + idx * 10}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between w-full px-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className={clsx(shimmer, "h-3 w-12")} />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={clsx("w-full space-y-4", className)}>
        <div className="flex space-x-4 border-b pb-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={clsx(shimmer, "h-6 w-full")} />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, rIdx) => (
          <div key={rIdx} className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, cIdx) => (
              <div key={cIdx} className={clsx(shimmer, "h-5 w-full")} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default 'card' loader
  return (
    <div className={clsx("glass rounded-3xl p-6 space-y-5 w-full", className)}>
      <div className="flex items-center space-x-4">
        <div className={clsx(shimmer, "h-12 w-12 rounded-full")} />
        <div className="space-y-2 flex-1">
          <div className={clsx(shimmer, "h-5 w-1/3")} />
          <div className={clsx(shimmer, "h-4 w-1/2")} />
        </div>
      </div>
      <div className="space-y-3">
        <div className={clsx(shimmer, "h-4 w-full")} />
        <div className={clsx(shimmer, "h-4 w-5/6")} />
        <div className={clsx(shimmer, "h-4 w-4/5")} />
      </div>
    </div>
  );
};
