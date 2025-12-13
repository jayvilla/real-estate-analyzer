'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@real-estate-analyzer/ui';

interface FeatureErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  featureName: string;
  onRetry?: () => void;
}

function FeatureErrorFallback({
  error,
  resetErrorBoundary,
  featureName,
  onRetry,
}: FeatureErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="glass rounded-2xl p-8 border border-red-200 animate-scale-in"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {featureName} Error
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        {onRetry && (
          <Button onClick={onRetry} className="btn-glow">
            Retry
          </Button>
        )}
        <Button
          variant="outline"
          onClick={resetErrorBoundary}
          className="border-neutral-300"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
  resetKeys?: Array<string | number>;
}

export function FeatureErrorBoundary({
  children,
  featureName,
  fallback,
  onError,
  onRetry,
  resetKeys,
}: FeatureErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`[${featureName}] Error caught by boundary:`, error, errorInfo);
    onError?.(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <FeatureErrorFallback
          {...props}
          featureName={featureName}
          onRetry={onRetry}
        />
      )}
      fallback={fallback}
      onError={handleError}
      resetKeys={resetKeys}
      onReset={() => {
        // Feature-specific reset logic can be added here
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

