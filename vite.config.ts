import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const manualChunkGroups = [
  { name: 'react', packages: ['react', 'react-dom'] },
  { name: 'sentry', packages: ['@sentry/react'] },
  { name: 'query', packages: ['@tanstack/react-query'] },
  { name: 'icons', packages: ['lucide-react'] },
  { name: 'charts', packages: ['recharts'] },
  { name: 'markdown', packages: ['react-markdown'] },
  { name: 'supabase', packages: ['@supabase/supabase-js'] },
];

export default defineConfig(({ mode }) => {
  const analyzeBundle = mode === 'analyze' || process.env.ANALYZE === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(process.env.SENTRY_AUTH_TOKEN
        ? sentryVitePlugin({
            org: process.env.SENTRY_ORG ?? '',
            project: process.env.SENTRY_PROJECT ?? 'treino-ia',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: process.env.SENTRY_RELEASE
              ? {
                  name: process.env.SENTRY_RELEASE,
                  deploy: {
                    env: process.env.SENTRY_DEPLOY_ENV ?? process.env.VITE_ENV ?? mode,
                  },
                }
              : undefined,
          })
        : []),
      ...(analyzeBundle
        ? [
            visualizer({
              filename: 'dist/bundle-stats.html',
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
            }),
          ]
        : []),
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
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
            const group = manualChunkGroups.find(({ packages }) =>
              packages.some((packageName) =>
                normalizedId.includes(`/node_modules/${packageName}/`),
              ),
            );

            return group?.name;
          },
        },
      },
    },
  };
});
