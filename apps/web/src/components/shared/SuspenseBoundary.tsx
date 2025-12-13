'use client';

import React, { Suspense, ReactNode } from 'react';

interface SuspenseFallbackProps {
  message?: string;
}

function SuspenseFallback({ message = 'Loading...' }: SuspenseFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  message?: string;
}

export function SuspenseBoundary({
  children,
  fallback,
  message,
}: SuspenseBoundaryProps) {
  return (
    <Suspense fallback={fallback || <SuspenseFallback message={message} />}>
      {children}
    </Suspense>
  );
}

