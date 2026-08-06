'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { useAuthInit } from '@/hooks/use-auth-init';
import { ChunkErrorHandler } from '@/components/navigation/chunk-error-handler';
import { AdminToastProvider } from '@/components/admin/admin-toast';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AdminToastProvider>
        <ChunkErrorHandler />
        <AuthInitializer>{children}</AuthInitializer>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </AdminToastProvider>
    </QueryClientProvider>
  );
}
