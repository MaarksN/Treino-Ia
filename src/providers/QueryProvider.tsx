import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useState } from 'react';

export function AppQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
