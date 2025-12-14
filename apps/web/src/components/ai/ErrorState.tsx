'use client';

import React from 'react';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="mb-4">
        <svg
          className="w-12 h-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
      <p className="text-gray-400 text-sm mb-6 text-center max-w-md">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry
        </button>
      )}
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-md w-full">
        <ErrorState error={error} onRetry={resetErrorBoundary} />
      </div>
    </div>
  );
}

