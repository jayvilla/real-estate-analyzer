'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ErrorBoundary } from '../components/shared';
import { AuthProvider } from '../stores/auth/auth-context';
import { queryClient } from '../lib/query-client';
import { store } from '../stores/redux/store';

/**
 * Global providers wrapper.
 * Note: Feature-specific providers (like PropertyProvider) should be
 * scoped to their respective feature pages/components for better isolation.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={store}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReduxProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

