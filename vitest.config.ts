import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000,
    setupFiles: ['./src/test/setup.ts'],
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx', 'api/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['src/**/*.ts', 'src/**/*.tsx', 'api/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'tests/**',
        'node_modules/**',
      ],
      // Progressive thresholds — Sprint 03 (Conservative baseline gate)
      // Baseline from Sprint 02: Stmts 26.06%, Branches 22.71%, Funcs 26.04%, Lines 25.83%
      // Thresholds set ~1-2% below baseline to allow rounding tolerance.
      // Increase by +5% increments in future sprints as coverage improves.
      thresholds: {
        statements: 27.3,
        branches: 23.2,
        functions: 27.7,
        lines: 27.2,
      },
    },
  },
});
