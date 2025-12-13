'use client';

import React, { ReactNode } from 'react';
import { FeatureErrorBoundary } from '../shared/FeatureErrorBoundary';
import { FeatureSuspenseBoundary } from '../shared/FeatureSuspenseBoundary';

interface PropertyListBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

/**
 * Granular boundary wrapper for the property list feature.
 * Isolates errors and loading states to just the list component.
 */
export function PropertyListBoundary({
  children,
  onRetry,
}: PropertyListBoundaryProps) {
  return (
    <FeatureErrorBoundary
      featureName="Property List"
      onRetry={onRetry}
      resetKeys={['properties']}
    >
      <FeatureSuspenseBoundary
        featureName="property list"
        message="Loading properties..."
      >
        {children}
      </FeatureSuspenseBoundary>
    </FeatureErrorBoundary>
  );
}

