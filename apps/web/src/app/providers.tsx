'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ErrorBoundary } from '../components/shared';
import { queryClient } from '../lib/query-client';
import { store } from '../stores/redux/store';
import { PropertyProvider } from '../stores/context/PropertyContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={store}>
          <PropertyProvider>{children}</PropertyProvider>
        </ReduxProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

