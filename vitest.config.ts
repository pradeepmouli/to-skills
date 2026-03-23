import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@to-skills/core': resolve(__dirname, 'packages/core/src/index.ts'),
      '@to-skills/typedoc': resolve(__dirname, 'packages/typedoc/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/test/**/*.test.ts', 'packages/**/src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/test/**', '**/dist/**', '**/node_modules/**'],
      thresholds: {
        // Global thresholds account for untested plugin packages
        lines: 30,
        functions: 30,
        branches: 25,
        statements: 30,
        // Core package should maintain high coverage
        'packages/core/src/renderer.ts': {
          lines: 80,
          functions: 75,
          branches: 70,
          statements: 80,
        },
        'packages/core/src/tokens.ts': {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
    },
    typecheck: {
      enabled: false,
    },
  },
});
