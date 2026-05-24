import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';
import { env } from './config/env';
import { QueryProvider } from './providers/QueryProvider';
import { installGlobalErrorTelemetry } from './utils/errorTelemetry';
import { installHydrationQuickActionBridge } from './utils/hydrationQuickActions';
import { registerSW } from './utils/pwaUtils';

if (env.sentryDsn) {
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,
    enabled: env.isProduction || Boolean(env.sentryDsn),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
  });
}

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
