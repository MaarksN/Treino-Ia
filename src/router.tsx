// Preparatory file for React Router v6 migration
import React from 'react';
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './navigation/routes';

// Exemplo de como o router seria configurado no futuro:
/*
export const router = createBrowserRouter([
  {
    path: routes.dashboard,
    element: <Dashboard />,
  },
  // ... outras rotas
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
*/

export function AppRouterPlaceholder() {
  return <div>Router Placeholder - Pending full migration to React Router v6</div>;
}
