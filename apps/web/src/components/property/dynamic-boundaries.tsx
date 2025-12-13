/**
 * Dynamically imported boundary components for better code splitting.
 */

import React from 'react';
import dynamic from 'next/dynamic';

// Lightweight loading fallback for boundaries
const BoundaryLoading = () => null; // Boundaries don't need loading states

/**
 * PropertyListBoundary - Lazy loaded boundary wrapper
 */
export const PropertyListBoundary = dynamic(
  () =>
    import('./PropertyListBoundary').then((mod) => ({
      default: mod.PropertyListBoundary,
    })),
  {
    loading: () => <BoundaryLoading />,
    ssr: true,
  }
) as React.ComponentType<{
  children: React.ReactNode;
  onRetry?: () => void;
}>;

/**
 * PropertyFormBoundary - Lazy loaded boundary wrapper
 */
export const PropertyFormBoundary = dynamic(
  () =>
    import('./PropertyFormBoundary').then((mod) => ({
      default: mod.PropertyFormBoundary,
    })),
  {
    loading: () => <BoundaryLoading />,
    ssr: true,
  }
) as React.ComponentType<{
  children: React.ReactNode;
  onRetry?: () => void;
  isLoading?: boolean;
}>;

/**
 * PropertyModalBoundary - Lazy loaded boundary wrapper
 */
export const PropertyModalBoundary = dynamic(
  () =>
    import('./PropertyModalBoundary').then((mod) => ({
      default: mod.PropertyModalBoundary,
    })),
  {
    loading: () => <BoundaryLoading />,
    ssr: false, // Modals don't need SSR
  }
) as React.ComponentType<{
  children: React.ReactNode;
  onRetry?: () => void;
  onClose?: () => void;
}>;
