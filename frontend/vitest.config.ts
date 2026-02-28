import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      'networking': resolve(__dirname, './app/networking'),
      'uicomponents': resolve(__dirname, './app/uicomponents'),
    },
  },
});