import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
        org: process.env.SENTRY_ORG ?? '',
        project: process.env.SENTRY_PROJECT ?? 'treino-ia',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }) : []),
    ],
    define: {
      'process.env.GEMINI_API_KEY': 'undefined',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      sourcemap: 'hidden' as const,
      rollupOptions: {
        output: {
          manualChunks: {
            charts: ['recharts'],
            motion: ['motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
