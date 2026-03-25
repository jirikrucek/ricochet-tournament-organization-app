import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    exclude: ['node_modules', 'tests/**', '**/*.spec.ts']
  }
});