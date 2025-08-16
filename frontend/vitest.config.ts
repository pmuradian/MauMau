import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      'networking': resolve(__dirname, './app/networking'),
      'UserInterface': resolve(__dirname, './app/UserInterface'),
    },
  },
});