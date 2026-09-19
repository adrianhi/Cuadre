import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: process.env.GITHUB_ACTIONS ? ['default', 'github-actions'] : ['default'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      thresholds: {
        statements: 30,
        branches: 60,
        functions: 30,
        lines: 30,
      },
    },
  },
});
