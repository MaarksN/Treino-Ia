import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryProvider } from './providers/QueryProvider';
import { installGlobalErrorTelemetry } from './utils/errorTelemetry';
import { installHydrationQuickActionBridge } from './utils/hydrationQuickActions';
import { registerSW } from './utils/pwaUtils';

installGlobalErrorTelemetry();
installHydrationQuickActionBridge();

registerSW().catch(error => {
  console.warn('Falha ao registrar Service Worker:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);
