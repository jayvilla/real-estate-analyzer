'use client';

import React, { Suspense, ReactNode } from 'react';

interface FeatureSuspenseFallbackProps {
  message?: string;
  featureName?: string;
  compact?: boolean;
}

function FeatureSuspenseFallback({
  message,
  featureName,
  compact = false,
}: FeatureSuspenseFallbackProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block relative">
          <div className="w-8 h-8 border-3 border-brand-primary-200 border-t-brand-primary-600 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-8 h-8 border-3 border-transparent border-t-brand-secondary-600 rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>
        {message && (
          <p className="ml-3 text-sm text-neutral-600">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="inline-block relative mb-6">
        <div className="w-16 h-16 border-4 border-brand-primary-200 border-t-brand-primary-600 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary-600 rounded-full animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      {featureName && (
        <p className="text-sm font-medium text-neutral-500 mb-2">
          Loading {featureName}...
        </p>
      )}
      {message && (
        <p className="text-neutral-600">{message}</p>
      )}
    </div>
  );
}

interface FeatureSuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  message?: string;
  featureName?: string;
  compact?: boolean;
}

export function FeatureSuspenseBoundary({
  children,
  fallback,
  message,
  featureName,
  compact = false,
}: FeatureSuspenseBoundaryProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <FeatureSuspenseFallback
            message={message}
            featureName={featureName}
            compact={compact}
          />
        )
      }
    >
      {children}
    </Suspense>
  );
}

