import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  const analyzeBundle = mode === 'analyze' || process.env.ANALYZE === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
        org: process.env.SENTRY_ORG ?? '',
        project: process.env.SENTRY_PROJECT ?? 'treino-ia',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }) : []),
      ...(analyzeBundle ? [visualizer({
        filename: 'dist/bundle-stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      })] : []),
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
            react: ['react', 'react-dom'],
            sentry: ['@sentry/react'],
            query: ['@tanstack/react-query'],
            icons: ['lucide-react'],
            charts: ['recharts'],
            markdown: ['react-markdown'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
