import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests run by default; integration tests are discoverable but gate
    // themselves on RUN_INTEGRATION_TESTS=true via describe.skipIf(...).
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  }
});
