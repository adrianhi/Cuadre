import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary, Toaster } from '@/shared/ui';
import { LoadingProvider } from '@/shared/context/loading-context';
import { queryClient } from './query-client';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <BrowserRouter>{children}</BrowserRouter>
          <Toaster />
        </LoadingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
