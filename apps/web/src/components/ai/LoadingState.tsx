'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4`}
      ></div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ lines = 3, className }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="h-4 bg-white/10 rounded animate-pulse"
          style={{ width: idx === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  );
}

