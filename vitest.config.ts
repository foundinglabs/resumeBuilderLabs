import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  test: {
    environment: 'node',
    reporters: [
      'default',
      ['junit', { outputFile: 'test-results/junit.xml' }],
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'dist/**',
        'client/**',
        '**/*.test.*',
        '**/__tests__/**',
      ],
    },
  },
});