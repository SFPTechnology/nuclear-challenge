import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// fileURLToPath (not URL.pathname) — on Windows, `new URL(import.meta.url).pathname`
// yields "/C:/..." which path.resolve cannot use, silently breaking every alias.
const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    // Must mirror the aliases in vite.config.ts, otherwise components that use
    // '@design/tokens' et al. cannot be imported from tests.
    alias: {
      '@': path.resolve(dirname, './src'),
      '@components': path.resolve(dirname, './src/components'),
      '@constants': path.resolve(dirname, './src/constants'),
      '@design': path.resolve(dirname, './src/design'),
      '@domain': path.resolve(dirname, './src/domain'),
      '@hooks': path.resolve(dirname, './src/hooks'),
      '@styles': path.resolve(dirname, './src/styles'),
      '@utils': path.resolve(dirname, './src/utils'),
    },
  },
});
