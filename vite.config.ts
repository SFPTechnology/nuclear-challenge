import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Browser code receives only explicitly public VITE_* variables.
  envPrefix: 'VITE_',
  plugins: [
    react(),
    {
      name: 'local-storage-host',
      transformIndexHtml: {
        order: 'pre',
        handler(html, ctx) {
          if (!ctx.server) return html;
          return {
            html,
            tags: [{ tag: 'script', attrs: { type: 'module', src: '/src/dev/localStorageHost.entry.ts' }, injectTo: 'head-pre' }],
          };
        },
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@design': path.resolve(__dirname, './src/design'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true,
  },
});
