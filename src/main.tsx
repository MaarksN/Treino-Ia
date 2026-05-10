import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installGlobalErrorTelemetry } from './utils/errorTelemetry';
import { registerSW } from './utils/pwaUtils';

installGlobalErrorTelemetry();

registerSW().catch(error => {
  console.warn('Falha ao registrar Service Worker:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
