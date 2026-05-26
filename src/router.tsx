import type { ReactNode } from 'react';

interface AppRouterProps {
  children: ReactNode;
}

export function AppRouter({ children }: AppRouterProps) {
  return <>{children}</>;
}
