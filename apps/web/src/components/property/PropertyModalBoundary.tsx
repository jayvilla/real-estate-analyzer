'use client';

import React, { ReactNode } from 'react';
import { FeatureErrorBoundary } from '../shared/FeatureErrorBoundary';

interface PropertyModalBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onClose?: () => void;
}

/**
 * Granular boundary wrapper for the property detail modal.
 * Isolates errors to just the modal component, allowing the rest of the page to function.
 */
export function PropertyModalBoundary({
  children,
  onRetry,
  onClose,
}: PropertyModalBoundaryProps) {
  return (
    <FeatureErrorBoundary
      featureName="Property Details"
      onRetry={onRetry}
      onError={(error) => {
        console.error('[PropertyModal] Error:', error);
        // Optionally close modal on error
        // onClose?.();
      }}
    >
      {children}
    </FeatureErrorBoundary>
  );
}

