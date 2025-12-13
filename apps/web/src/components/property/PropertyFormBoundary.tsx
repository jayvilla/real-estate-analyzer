'use client';

import React, { ReactNode } from 'react';
import { FeatureErrorBoundary } from '../shared/FeatureErrorBoundary';
import { FeatureSuspenseBoundary } from '../shared/FeatureSuspenseBoundary';

interface PropertyFormBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  isLoading?: boolean;
}

/**
 * Granular boundary wrapper for the property form feature.
 * Isolates errors and loading states to just the form component.
 */
export function PropertyFormBoundary({
  children,
  onRetry,
  isLoading,
}: PropertyFormBoundaryProps) {
  return (
    <FeatureErrorBoundary
      featureName="Property Form"
      onRetry={onRetry}
    >
      {isLoading ? (
        <FeatureSuspenseBoundary
          featureName="form"
          message="Processing..."
          compact
        >
          {children}
        </FeatureSuspenseBoundary>
      ) : (
        children
      )}
    </FeatureErrorBoundary>
  );
}

